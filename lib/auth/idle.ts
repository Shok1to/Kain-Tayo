// Automatic sign out for the admin area after a period with no activity.
// The proxy updates a small cookie with the time of each admin request.
// If the next request comes after the limit, the admin is signed out.
// This file is used by the proxy too, so it must not be server only.

export const IDLE_LIMIT_MINUTES = 30;
export const IDLE_LIMIT_MS = IDLE_LIMIT_MINUTES * 60 * 1000;

export const IDLE_COOKIE = "admin_last_active";

export const IDLE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
  maxAge: 12 * 60 * 60,
} as const;

// True when the last activity was too long ago. A missing or broken
// value is not "expired": the cookie is simply set again.
export function isIdleExpired(lastActive: string | undefined, now: number): boolean {
  if (!lastActive) return false;
  const last = Number(lastActive);
  if (!Number.isFinite(last)) return false;
  return now - last > IDLE_LIMIT_MS;
}
