import { describe, expect, it } from "vitest";
import { IDLE_LIMIT_MS, isIdleExpired } from "./idle";

describe("idle sign out", () => {
  const now = 10_000_000;

  it("is not expired within 30 minutes", () => {
    expect(isIdleExpired(String(now - IDLE_LIMIT_MS + 1000), now)).toBe(false);
  });

  it("is expired after 30 minutes without activity", () => {
    expect(isIdleExpired(String(now - IDLE_LIMIT_MS - 1000), now)).toBe(true);
  });

  it("treats a missing or broken value as not expired", () => {
    expect(isIdleExpired(undefined, now)).toBe(false);
    expect(isIdleExpired("not a number", now)).toBe(false);
  });
});
