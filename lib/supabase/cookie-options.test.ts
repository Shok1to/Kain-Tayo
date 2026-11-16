import { afterEach, describe, expect, it, vi } from "vitest";
import { LOGIN_COOKIE_MAX_AGE, hardenLoginCookie } from "./cookie-options";

afterEach(() => vi.unstubAllEnvs());

describe("admin login cookie", () => {
  it("is hidden from page scripts and lasts 12 hours, not 400 days", () => {
    const options = hardenLoginCookie({ path: "/", sameSite: "lax", httpOnly: false, maxAge: 400 * 24 * 60 * 60 });
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: LOGIN_COOKIE_MAX_AGE });
    expect(LOGIN_COOKIE_MAX_AGE).toBe(12 * 60 * 60);
  });

  it("is sent only over HTTPS in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(hardenLoginCookie({ path: "/" })).toMatchObject({ secure: true });
  });

  it("still deletes the cookie when asked (life of 0)", () => {
    expect(hardenLoginCookie({ maxAge: 0 }).maxAge).toBe(0);
  });
});
