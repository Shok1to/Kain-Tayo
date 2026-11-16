import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/server";

// The server side check for the admin area. Every admin page and every
// admin action calls this. The proxy is only a first filter; this is the
// check that counts.

export type AdminCheck =
  | { stage: "signed-out" }
  | { stage: "not-admin" }
  | { stage: "needs-mfa" | "ok"; user: User; supabase: Awaited<ReturnType<typeof createSessionClient>> };

// cache() runs this once per request, even if a page and its data
// functions all ask. Each new request checks again from scratch.
export const checkAdmin = cache(async function checkAdmin(): Promise<AdminCheck> {
  // Always run this check fresh for each request, never ahead of time.
  // (Supabase reads the current time to check if the login has expired.)
  await connection();
  const supabase = await createSessionClient();

  // 1. Is someone signed in? getUser asks the Supabase Auth server,
  // so a forged cookie cannot pass.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;
  if (userError || !user) return { stage: "signed-out" };

  // 2. Are they listed in admin_users? Row level security lets each person
  // read only their own row.
  const { data: row, error: rowError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (rowError) console.error("Admin check failed, code:", rowError.code);
  if (!row) {
    await supabase.auth.signOut();
    return { stage: "not-admin" };
  }

  // 3. Have they passed multi factor sign in in this session?
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") return { stage: "needs-mfa", user, supabase };

  return { stage: "ok", user, supabase };
});

export type AdminUser = { id: string; email: string };

// Use at the top of every admin page and admin action.
// Sends anyone who is not a fully signed in admin away.
export async function requireAdmin(): Promise<AdminUser> {
  const result = await checkAdmin();
  if (result.stage === "needs-mfa") redirect("/admin/mfa");
  if (result.stage !== "ok") redirect("/admin/login");
  return { id: result.user.id, email: result.user.email ?? "" };
}
