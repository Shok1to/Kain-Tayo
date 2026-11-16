import "server-only";
import { buildConfirmationEmail } from "./confirmation";

// Sends the confirmation email through Resend, on the server.
// Settings (in .env.local, and in Vercel later):
//   RESEND_API_KEY  the secret Resend key. Never logged, never sent to the browser.
//   EMAIL_FROM      the sender, for example "Company <hello@example.com>"
//   SITE_URL        the site address, for example https://example.com
//
// Returns true when Resend accepted the email, false otherwise.
// It never throws, so a failed email can never undo a saved signup.
// It logs only a short reason, never the address or name.

const RESEND_URL = "https://api.resend.com/emails";

export async function sendConfirmationEmail(input: {
  to: string;
  firstName: string;
  emailOptIn: boolean;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const siteUrl = process.env.SITE_URL;

  if (!apiKey || !from || !siteUrl) {
    console.error("Confirmation email not sent: email settings are missing");
    return false;
  }

  try {
    const privacyUrl = new URL("/signup/privacy", siteUrl).toString();
    const email = buildConfirmationEmail({
      firstName: input.firstName,
      emailOptIn: input.emailOptIn,
      privacyUrl,
    });

    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("Confirmation email not sent, status:", response.status);
      return false;
    }
    return true;
  } catch {
    console.error("Confirmation email not sent: could not reach Resend");
    return false;
  }
}
