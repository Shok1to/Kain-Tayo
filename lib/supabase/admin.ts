import "server-only";
import { createClient } from "@supabase/supabase-js";

// A Supabase connection that uses the SECRET key.
// It can read and write everything, so it may only be used in server code.
// The "server-only" line above makes the build fail if this file is ever
// imported by code that runs in the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Supabase settings are missing from .env.local");
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
