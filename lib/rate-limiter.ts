/**
 * sliding-window / fixed-window rate limiter for the Webhook POST API.
 * Keeps track of requests per IP in memory, resetting keys after the window closes,
 * and includes automated garbage collection to avoid memory leaks in production.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 30; // Max 30 requests per minute per IP

/**
 * Checks if a given IP has exceeded its request threshold in the current window.
 * Returns true if the IP is rate limited.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    return false;
  }

  // Reset the window if it has expired
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    return false;
  }

  record.count++;
  return record.count > MAX_REQUESTS;
}

/**
 * Clears expired records from memory to prevent memory bloat over time.
 */
export function pruneRateLimitMap(): void {
  const now = Date.now();
  let prunedCount = 0;
  
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
      prunedCount++;
    }
  }
  
  if (prunedCount > 0) {
    console.log(`[RateLimiter] Background prune completed. Removed ${prunedCount} expired records.`);
  }
}

// Register background pruning every 5 minutes if executed in an active node runtime
if (typeof setInterval !== "undefined") {
  const pruningInterval = setInterval(() => {
    try {
      pruneRateLimitMap();
    } catch (err) {
      console.error("[RateLimiter] Error running pruning interval:", err);
    }
  }, 5 * 60 * 1000);
  
  // Unref to prevent blocking process termination in testing or scripts
  if (typeof pruningInterval.unref === "function") {
    pruningInterval.unref();
  }
}
