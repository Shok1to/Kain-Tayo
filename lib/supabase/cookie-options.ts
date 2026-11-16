// Tighter settings for the Supabase login cookie. This site never uses
// Supabase in the browser, so page scripts never need to read the cookie.
// Supabase always asks for a 400 day life, so the life is set here, where
// our code writes the cookie.

// Matches the 12 hour inactivity cookie. Admins sign in again after this.
export const LOGIN_COOKIE_MAX_AGE = 12 * 60 * 60;

type CookieOptions = { maxAge?: number; [key: string]: unknown };

export function hardenLoginCookie<T extends CookieOptions>(options: T): T {
  return {
    ...options,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // A maxAge of 0 means "delete this cookie"; keep that as it is.
    maxAge: options.maxAge === 0 ? 0 : LOGIN_COOKIE_MAX_AGE,
  };
}
