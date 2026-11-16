"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAdmin } from "@/lib/auth/admin-guard";
import { IDLE_COOKIE, IDLE_COOKIE_OPTIONS } from "@/lib/auth/idle";
import {
  LOGIN_LIMIT_MINUTES,
  loginLimitByAddress,
  loginLimitByEmail,
  mfaLimitByUser,
} from "@/lib/auth/limits";
import { clientAddress } from "@/lib/spam/rate-limit";

export type FormState = { error: string | null };

// One message for a wrong password, an unknown email and a person who is
// not an admin, so nobody can learn which emails have accounts.
const WRONG_LOGIN ="Email or password is incorrect.";
const TOO_MANY = `Too many tries. Please wait ${LOGIN_LIMIT_MINUTES} minutes and try again.`;
const BAD_CODE = "That code did not work. Please check your authenticator app and try again.";

// Step 1: email and password.
export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Please enter your email and password." };

  const h = await headers();
  const addressAllowed = loginLimitByAddress(clientAddress(h));
  const emailAllowed = loginLimitByEmail(email);
  if (!addressAllowed || !emailAllowed) return { error: TOO_MANY };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: WRONG_LOGIN };

  const { data: row, error: rowError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();
  if (rowError) console.error("Admin check failed, code:", rowError.code);
  if (!row) {
    await supabase.auth.signOut();
    return { error: WRONG_LOGIN };
  }

  // Start the inactivity clock fresh for this new sign in.
  (await cookies()).set(IDLE_COOKIE, String(Date.now()), IDLE_COOKIE_OPTIONS);
  redirect("/admin/mfa");
}

export type EnrollResult =
  | { ok: true; factorId: string; qrCode: string; secret: string }
  | { ok: false; error: string };

// Step 2a (first time only): set up an authenticator app.
export async function startMfaEnrollment(): Promise<EnrollResult> {
  const check = await checkAdmin();
  if (check.stage === "signed-out" || check.stage === "not-admin") redirect("/admin/login");
  const { supabase } = check;

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totp = (factors?.all ?? []).filter((f) => f.factor_type === "totp");
  if (totp.some((f) => f.status === "verified")) {
    return { ok: false, error: "An authenticator app is already set up for this account." };
  }
  // Remove any setup that was started before but never finished.
  for (const factor of totp) await supabase.auth.mfa.unenroll({ factorId: factor.id });

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Admin authenticator",
  });
  if (error || !data) {
    console.error("MFA setup failed, code:", error?.code);
    return { ok: false, error: "We could not start the setup. Please try again." };
  }
  return {
    ok: true,
    factorId: data.id,
    qrCode: toSvgDataUrl(data.totp.qr_code),
    secret: data.totp.secret,
  };
}

// Supabase gives the QR code as SVG picture text, sometimes with a
// "data:" prefix and extra spaces. Turn it into a clean, safely encoded
// picture address that the page can show.
function toSvgDataUrl(qrCode: string): string {
  const svg = qrCode.trim().replace(/^data:image\/svg\+xml[^,]*,/, "");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Step 2b: check the 6 digit code from the authenticator app.
export async function verifyMfa(_prev: FormState, formData: FormData): Promise<FormState> {
  const factorId = String(formData.get("factorId") ?? "");
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) {
    return { error: "Please enter the 6 digit code from your authenticator app." };
  }

  const check = await checkAdmin();
  if (check.stage === "signed-out" || check.stage === "not-admin") redirect("/admin/login");
  if (!mfaLimitByUser(check.user.id)) return { error: TOO_MANY };
  const { supabase } = check;

  // The factor must belong to this person.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const owned = (factors?.all ?? []).some((f) => f.id === factorId && f.factor_type === "totp");
  if (!owned) return { error: BAD_CODE };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { error: BAD_CODE };

  // A fully signed in admin (password and code). Save the time. If saving
  // fails the admin still gets in; we only note the error code.
  const { error: saveError } = await createAdminClient()
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", check.user.id);
  if (saveError) console.error("Saving last sign in time failed, code:", saveError.code);

  redirect("/admin");
}
