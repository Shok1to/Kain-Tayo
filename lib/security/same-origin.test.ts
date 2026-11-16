import { describe, expect, it } from "vitest";
import { isSameOrigin } from "./same-origin";

const at = (origin?: string) =>
  new Request("http://localhost:3000/admin/export", {
    method: "POST",
    headers: origin ? { origin } : {},
  });

describe("same site check", () => {
  it("accepts a post from this site", () => {
    expect(isSameOrigin(at("http://localhost:3000"))).toBe(true);
  });

  it("refuses a post from another site, another port, or with no origin", () => {
    expect(isSameOrigin(at("https://bad.example"))).toBe(false);
    expect(isSameOrigin(at("http://localhost:3001"))).toBe(false);
    expect(isSameOrigin(at())).toBe(false);
  });
});
