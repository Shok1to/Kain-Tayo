import "server-only";
import { TURNSTILE_ACTION } from "./shared";

// Checks a Cloudflare Turnstile token with Cloudflare, on the server.
// The secret key stays on the server. It is never logged or sent to the browser.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare's published dummy secret keys for testing (1x... passes,
// 2x... fails, 3x... says the token was already used). Their answers may
// not name an action. Real keys always do.
const TEST_SECRET = /^[123]x0{31}AA$/;

export async function verifyTurnstile(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("Turnstile check failed: TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error("Turnstile check failed, status:", response.status);
      return false;
    }
    const result = (await response.json()) as { success?: boolean; action?: string };
    // The token must be made for the sign up form. Only Cloudflare's test
    // keys may leave the action out.
    const actionMatches =
      result.action === TURNSTILE_ACTION || (!result.action && TEST_SECRET.test(secret));
    return result.success === true && actionMatches;
  } catch {
    console.error("Turnstile check failed: could not reach Cloudflare");
    return false;
  }
}
