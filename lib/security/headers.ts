// Security headers sent with the sign up pages (/signup) and the admin area
// (/admin). Used by next.config.ts.

const TURNSTILE = "https://challenges.cloudflare.com";

// Content Security Policy: which places the page may load things from.
// Only this site, plus Cloudflare Turnstile for the spam check.
// Next.js adds small inline scripts to every page, so inline scripts from
// this site are allowed. In development, Next.js also needs eval and a live
// reload connection, which production never gets.
export function contentSecurityPolicy(isDev: boolean): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${TURNSTILE}${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${TURNSTILE}${isDev ? " ws: wss:" : ""}`,
    `frame-src ${TURNSTILE}`,
    // No other website may show our pages inside a frame (stops clickjacking).
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function securityHeaders(isDev: boolean) {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(isDev) },
    // Always use HTTPS for two years, on this domain and its subdomains.
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Other sites see only our domain name, never the full page address.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ];
}
