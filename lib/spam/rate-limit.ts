import "server-only";

// A simple "fixed number of tries per time window" limit.
//
// The counts live only in this server's memory. Nothing is saved to the
// database, so no IP address is ever stored. Counts disappear after the
// window ends, or when the server restarts.
//
// Limit: on hosting with several servers (like Vercel), each server keeps
// its own count, so the real limit can be a little higher than set here.
// Turnstile is the main protection; this only slows down repeated tries.

export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

// Safety cap so the memory used can never grow without end.
const MAX_TRACKED_KEYS = 10_000;

export function createRateLimiter(max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS) {
  const attempts = new Map<string, number[]>();

  function forgetOld(now: number) {
    for (const [key, times] of attempts) {
      const recent = times.filter((t) => now - t < windowMs);
      if (recent.length === 0) attempts.delete(key);
      else attempts.set(key, recent);
    }
  }

  // Records one try for this key. Returns false when the limit is reached.
  return function allow(key: string, now = Date.now()): boolean {
    if (attempts.size >= MAX_TRACKED_KEYS) forgetOld(now);

    const recent = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      attempts.set(key, recent);
      return false;
    }
    recent.push(now);
    attempts.set(key, recent);
    return true;
  };
}

// The one limiter the sign up form uses.
export const signupRateLimit = createRateLimiter();

// The visitor's address, as passed on by the hosting platform.
// Used only as a key for the count in memory. Never logged or saved.
export function clientAddress(h: Headers): string {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "unknown";
}
