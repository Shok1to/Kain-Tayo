import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CONSENT_TEXT, WORDING_VERSION } from "@/lib/consent";

// Each wording version has a saved copy in docs/consent-wording/.
// If the text in lib/consent.ts changes without a new WORDING_VERSION and a
// new copy, this test fails, so a saved consent always matches what the
// person really saw.
describe("consent wording copies", () => {
  it("has a saved copy of the current version that matches the text exactly", () => {
    const file = path.join(process.cwd(), "docs", "consent-wording", `${WORDING_VERSION}.json`);
    const saved = JSON.parse(readFileSync(file, "utf8"));
    expect(saved).toEqual(CONSENT_TEXT);
  });
});
