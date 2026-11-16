import { describe, expect, it } from "vitest";
import {
  emailConsentLabel,
  formatPhone,
  nextDay,
  privacyConsentLabel,
  torontoDayStart,
} from "./format";

describe("admin display helpers", () => {
  it("shows phone numbers as 3, 3 and 4 digits", () => {
    expect(formatPhone("+14165550100")).toBe("416 555 0100");
    expect(formatPhone(null)).toBe("");
  });

  it("shows consent status, including withdrawals", () => {
    expect(privacyConsentLabel(true, null)).toBe("Given");
    expect(privacyConsentLabel(true, "2026-11-10T15:00:00Z")).toMatch(/^Withdrawn /);
    expect(emailConsentLabel(true, null)).toBe("Yes");
    expect(emailConsentLabel(false, null)).toBe("No");
    expect(emailConsentLabel(true, "2026-11-10T15:00:00Z")).toMatch(/^Withdrawn /);
  });

  it("finds the start of a Toronto day in winter and summer time", () => {
    expect(torontoDayStart("2026-11-15")).toBe("2026-11-15T05:00:00.000Z");
    expect(torontoDayStart("2026-07-01")).toBe("2026-07-01T04:00:00.000Z");
  });

  it("finds the next day, across a month end", () => {
    expect(nextDay("2026-11-30")).toBe("2026-12-01");
  });
});
