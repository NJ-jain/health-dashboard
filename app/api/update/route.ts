import { NextRequest, NextResponse } from "next/server";
import { 
  addSSEClient, 
  removeSSEClient, 
  updateDashboardData, 
  SSEClient,
  latestDashboardData,
  getInitialMockData
} from "@/lib/store";
import { transformSheetWebhook } from "@/lib/transformer";
import { isRateLimited } from "@/lib/rate-limiter";
import { validatePayload } from "@/lib/validator";

/**
 * GET Handler - Establishes Server-Sent Events (SSE) connections.
 * Allows multiple browser/dashboard clients to subscribe to realtime updates.
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const clientId = crypto.randomUUID();

  // Create stream representing persistent SSE channel
  const stream = new ReadableStream({
    start(controller) {
      // Define a custom client structure mapping back to the global store
      const client: SSEClient = {
        id: clientId,
        send: (event: string, data: unknown, preSerialized?: string) => {
          try {
            const message = preSerialized || `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (err) {
            console.error(`[SSE API] Error enqueuing message for client ${clientId}:`, err);
          }
        },
        close: () => {
          try {
            controller.close();
          } catch (e) {
            // Already closed
          }
        }
      };

      // Register the client globally in-memory
      addSSEClient(client);

      // Send initial heartbeat acknowledgment
      const handshake = `event: connected\ndata: ${JSON.stringify({ success: true, clientId })}\n\n`;
      controller.enqueue(encoder.encode(handshake));
    },
    cancel() {
      console.log(`[SSE API] Connection cancelled by client: ${clientId}`);
      removeSSEClient(clientId);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no" // Disable proxy buffering for instant delivery
    }
  });
}

/**
 * POST Handler - Webhook endpoint for data updates (e.g. from Google Sheets).
 * Receives the JSON data payload, updates the global store, and broadcasts it in realtime.
 */
export async function POST(request: NextRequest) {
  // 1. Rate Limiting Check
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
             request.headers.get("x-real-ip") || 
             "127.0.0.1";

  if (isRateLimited(ip)) {
    console.warn(`[Webhook POST] Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please wait before submitting more EHS updates."
      },
      { status: 429 }
    );
  }

  let jsonPayload: unknown;

  // 2. Safe JSON Parsing
  try {
    jsonPayload = await request.json();
  } catch (err) {
    console.warn("[Webhook POST] Failed to parse JSON request body.");
    return NextResponse.json(
      {
        success: false,
        error: "Malformed JSON payload. Please submit a valid JSON body."
      },
      { status: 400 }
    );
  }

  // 3. Request Validation
  const validation = validatePayload(jsonPayload);
  if (!validation.isValid) {
    console.warn("[Webhook POST] Payload validation rejected:", validation.error);
    return NextResponse.json(
      {
        success: false,
        error: validation.error || "Invalid payload structure."
      },
      { status: 400 }
    );
  }

  // 4. State Mutation & Realtime Broadcast
  try {
    const payload = jsonPayload as Record<string, any>;
    let updatedStore;

    // Smart Check: Detect if this is a raw Google Sheets row dataset payload
    if ("sheetName" in payload && "sheetData" in payload) {
      console.log(`[Webhook POST] Standardizing raw sheet rows for: ${payload.sheetName}`);
      const current = latestDashboardData || getInitialMockData();
      const parsedData = transformSheetWebhook(payload as any, current);
      updatedStore = updateDashboardData(parsedData);
    } else {
      // Direct partial update or standard dashboard state update
      updatedStore = updateDashboardData(payload);
    }

    return NextResponse.json({
      success: true,
      message: "Global store updated and broadcasted to SSE clients successfully",
      lastUpdated: updatedStore.lastUpdated
    });
  } catch (error: any) {
    console.error("[Webhook POST] Internal error processing webhook data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing the EHS update."
      },
      { status: 500 }
    );
  }
}
