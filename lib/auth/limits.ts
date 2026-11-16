import "server-only";
import { createRateLimiter } from "@/lib/spam/rate-limit";

// Limits on admin sign in tries, kept in memory only (nothing is saved).
// Same limit as the sign up form: on hosting with several servers,
// each server counts separately, so the real limit can be a little higher.
// Supabase Auth also has its own limits on sign in attempts.

export const LOGIN_LIMIT_MINUTES = 15;
const WINDOW_MS = LOGIN_LIMIT_MINUTES * 60 * 1000;

// Password tries: 5 per 15 minutes, per internet address and per email.
export const loginLimitByAddress = createRateLimiter(5, WINDOW_MS);
export const loginLimitByEmail = createRateLimiter(5, WINDOW_MS);

// Authenticator code tries: 5 per 15 minutes, per signed in person.
export const mfaLimitByUser = createRateLimiter(5, WINDOW_MS);
