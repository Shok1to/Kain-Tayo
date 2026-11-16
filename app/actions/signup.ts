"use server";

import { headers } from "next/headers";
import { signupSchema, type SignupInput } from "@/lib/validation/signup";
import { WORDING_VERSION } from "@/lib/consent";
import { createAdminClient } from "@/lib/supabase/admin";
import { isHoneypotFilled } from "@/lib/spam/shared";
import { clientAddress, signupRateLimit } from "@/lib/spam/rate-limit";
import { verifyTurnstile } from "@/lib/spam/turnstile";
import { sendConfirmationEmail } from "@/lib/email/send-confirmation";

export type SignupResult =
  // emailSent says whether the confirmation email really went out.
  | { ok: true; emailSent: boolean }
  | { ok: false; reason: "invalid" | "duplicate" | "error" | "verification" | "rate_limited" };

// Spam checks that travel with the form but are not part of the person's answers.
export type SignupSecurity = {
  honeypot?: string;
  turnstileToken?: string;
};

// Runs on the server only. The browser checks are for convenience;
// this is the check that counts, so we run the same rules again here.
export async function submitSignup(
  input: SignupInput,
  security: SignupSecurity = {}
): Promise<SignupResult> {
  const h = await headers();

  // 1. Too many tries from the same address in a short time.
  if (!signupRateLimit(clientAddress(h))) {
    return { ok: false, reason: "rate_limited" };
  }

  // 2. The hidden box was filled in, so this is almost surely a bot.
  // Pretend it worked, so the bot learns nothing, but save nothing.
  if (isHoneypotFilled(security.honeypot)) {
    return { ok: true, emailSent: true };
  }

  // 3. Ask Cloudflare whether the Turnstile token is real.
  if (!(await verifyTurnstile(security.turnstileToken))) {
    return { ok: false, reason: "verification" };
  }

  // 4. Check every answer again with the shared rules.
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "invalid" };
  }
  const { personal, business, consent } = parsed.data;

  // Which page the person agreed on: the sign up form at the site's own
  // address (SITE_URL), not an address the browser could change.
  // Without SITE_URL (local testing only) fall back to the browser's.
  const pageUrl = siteFormUrl() ?? h.get("referer") ?? "unknown";

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("create_signup", {
      p_applicant: {
        first_name: personal.firstName,
        last_name: personal.lastName,
        street_number: personal.streetNumber,
        street_name: personal.streetName,
        city: personal.city,
        province: personal.province,
        postal_code: personal.postalCode,
        country: personal.country,
        phone: personal.phone,
        mobile: personal.mobile,
        email: personal.email,
      },
      p_business: {
        company_name: business.companyName,
        business_type: business.businessType,
        street_number: business.streetNumber,
        street_name: business.streetName,
        city: business.city,
        province: business.province,
        postal_code: business.postalCode,
        country: business.country,
        phone: business.phone,
        website: business.website,
        email: business.email,
      },
      p_consent: {
        privacy_consent: consent.privacyConsent,
        email_opt_in: consent.emailOptIn,
        wording_version: WORDING_VERSION,
        page_url: pageUrl,
      },
    });

    if (error) {
      // 23505 means this email is already signed up.
      if (error.code === "23505") return { ok: false, reason: "duplicate" };
      // Log the error code only. Never log what the person typed.
      console.error("Signup save failed, code:", error.code);
      return { ok: false, reason: "error" };
    }
  } catch {
    console.error("Signup save failed: could not reach the database");
    return { ok: false, reason: "error" };
  }

  // 5. The signup is saved. Only now send the confirmation email.
  // If the email fails, the signup still counts.
  const emailSent = await sendConfirmationEmail({
    to: personal.email,
    firstName: personal.firstName,
    emailOptIn: consent.emailOptIn,
  });
  return { ok: true, emailSent };
}

function siteFormUrl(): string | undefined {
  const site = process.env.SITE_URL;
  if (!site) return undefined;
  try {
    return new URL("/signup", site).href;
  } catch {
    return undefined;
  }
}
