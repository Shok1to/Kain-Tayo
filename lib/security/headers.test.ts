import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "./headers";

describe("security headers", () => {
  it("sends every header the review asked for", () => {
    const names = securityHeaders(false).map((h) => h.key);
    expect(names).toEqual([
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ]);
  });

  it("blocks framing and outside form targets, and allows only Cloudflare Turnstile from outside", () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-src https://challenges.cloudflare.com");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("never allows eval or live reload in production", () => {
    expect(contentSecurityPolicy(false)).not.toContain("unsafe-eval");
    expect(contentSecurityPolicy(false)).not.toContain("ws:");
    expect(contentSecurityPolicy(true)).toContain("unsafe-eval");
  });
});
