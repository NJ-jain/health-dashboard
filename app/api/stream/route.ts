import { NextRequest } from "next/server";
import { 
  addSSEClient, 
  removeSSEClient, 
  latestDashboardData, 
  SSEClient 
} from "@/lib/store";

/**
 * GET Handler - Establishes a persistent Server-Sent Events (SSE) stream.
 * Leveraging TransformStream, we pipeline updates in real-time, push the latest
 * dashboard data immediately upon connection, and register the socket globally.
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const clientId = crypto.randomUUID();

  // Create a TransformStream to pipeline encoded SSE messages
  const transformStream = new TransformStream();
  const writer = transformStream.writable.getWriter();

  /**
   * Helper to write a formatted SSE message to the stream pipeline
   */
  const sendSSE = (event: string, data: unknown, preSerialized?: string) => {
    try {
      const message = preSerialized || `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      writer.write(encoder.encode(message));
    } catch (err) {
      console.error(`[SSE Stream] Error writing payload to client ${clientId}:`, err);
    }
  };

  // Implement the SSEClient interface to register in our shared cache
  const client: SSEClient = {
    id: clientId,
    send: (event: string, data: unknown, preSerialized?: string) => {
      sendSSE(event, data, preSerialized);
    },
    close: () => {
      try {
        writer.close();
      } catch (err) {
        // Stream might already be closed
      }
    }
  };

  // 1. Push connected client into the shared store
  addSSEClient(client);

  // Send successful connection handshake event
  sendSSE("connected", { success: true, clientId });

  // 2. Send the latest dashboard data immediately upon connection
  if (latestDashboardData) {
    sendSSE("dashboard_update", latestDashboardData);
  }

  // 3. Monitor connection state and prune client on disconnection
  const cleanup = () => {
    console.log(`[SSE Stream] Client connection aborted/closed: ${clientId}`);
    removeSSEClient(clientId);
    try {
      writer.close();
    } catch (e) {
      // Already closed or errored
    }
  };

  request.signal.addEventListener("abort", cleanup);

  // 4. Return Response containing the readable side of our stream with correct headers
  return new Response(transformStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no" // Prevent proxy buffering
    }
  });
}
