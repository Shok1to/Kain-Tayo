import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { IDLE_COOKIE, IDLE_COOKIE_OPTIONS, isIdleExpired } from "@/lib/auth/idle";
import { hardenLoginCookie } from "@/lib/supabase/cookie-options";

// Runs before every /admin request (Next.js 16 calls this "proxy").
// It is a first filter only:
//   * keeps the Supabase login cookie fresh
//   * sends people who are not signed in to the login page
//   * signs out admins after 30 minutes with no activity
// The full check (admin_users and MFA) happens on the server in
// lib/auth/admin-guard.ts, on every admin page and action.

const LOGIN_PATH = "/admin/login";
// Pages that must work even when nobody is signed in.
const OPEN_PATHS = new Set([LOGIN_PATH, "/admin/logout"]);

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, hardenLoginCookie(options));
        }
      },
    },
  });

  // Checks the login token's signature, and refreshes it when needed.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const onOpenPath = OPEN_PATHS.has(request.nextUrl.pathname);

  if (!signedIn) {
    return onOpenPath ? response : redirectKeepingCookies(request, LOGIN_PATH, response);
  }

  if (isIdleExpired(request.cookies.get(IDLE_COOKIE)?.value, Date.now())) {
    await supabase.auth.signOut();
    const redirect = redirectKeepingCookies(request, `${LOGIN_PATH}?reason=timeout`, response);
    redirect.cookies.delete({ name: IDLE_COOKIE, path: IDLE_COOKIE_OPTIONS.path });
    return redirect;
  }

  response.cookies.set(IDLE_COOKIE, String(Date.now()), IDLE_COOKIE_OPTIONS);
  return response;
}

// A redirect that still carries any login cookies Supabase just changed.
// 303 makes the browser open the target with a normal GET, even after a form post.
function redirectKeepingCookies(request: NextRequest, path: string, from: NextResponse) {
  const redirect = NextResponse.redirect(new URL(path, request.url), 303);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  matcher: ["/admin/:path*"],
};
