import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";
import { IDLE_COOKIE, IDLE_COOKIE_OPTIONS } from "@/lib/auth/idle";
import { isSameOrigin } from "@/lib/security/same-origin";

// Sign out. The Sign out button posts a plain form here.
// It ends the Supabase session, clears the inactivity cookie, and sends
// the browser to the login page with a full page load, so no admin data
// stays in the browser's memory.
// Only a post from this site counts, so another website cannot sign the admin out.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return new NextResponse("Please use the Sign out button.", { status: 403 });
  }
  const supabase = await createSessionClient();
  await supabase.auth.signOut();

  // 303 tells the browser to open the login page with a normal GET.
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.delete({ name: IDLE_COOKIE, path: IDLE_COOKIE_OPTIONS.path });
  return response;
}
