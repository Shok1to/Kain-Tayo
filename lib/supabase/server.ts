import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { hardenLoginCookie } from "./cookie-options";

// A Supabase connection that acts as the signed in person, using their
// login cookie and the PUBLIC (publishable) key. Row level security applies.
// This is the client for login and admin checks. It is separate from the
// secret key client in admin.ts, which must never be used for login.
export async function createSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase settings are missing from .env.local");
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, hardenLoginCookie(options));
          }
        } catch {
          // Pages cannot change cookies; only actions and the proxy can.
          // The proxy refreshes the login cookie on every admin request.
        }
      },
    },
  });
}
