import { describe, expect, it } from "vitest";
import { clientAddress, createRateLimiter } from "./rate-limit";

describe("rate limit", () => {
  it("allows 5 tries, then refuses the 6th within 10 minutes", () => {
    const allow = createRateLimiter(5, 10 * 60 * 1000);
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) expect(allow("203.0.113.1", start + i)).toBe(true);
    expect(allow("203.0.113.1", start + 10)).toBe(false);
  });

  it("allows tries again after the window ends", () => {
    const allow = createRateLimiter(1, 1000);
    expect(allow("203.0.113.2", 0)).toBe(true);
    expect(allow("203.0.113.2", 500)).toBe(false);
    expect(allow("203.0.113.2", 1000)).toBe(true);
  });

  it("counts each address separately", () => {
    const allow = createRateLimiter(1, 1000);
    expect(allow("203.0.113.3", 0)).toBe(true);
    expect(allow("203.0.113.4", 0)).toBe(true);
  });

  it("reads the first address from x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(clientAddress(h)).toBe("203.0.113.5");
    expect(clientAddress(new Headers())).toBe("unknown");
  });
});
