import { describe, expect, it } from "vitest";
import { buildCsv, safeCell } from "./csv";
import type { SignupListRow } from "./signups";

const row: SignupListRow = {
  id: "11111111-1111-4111-8111-111111111111",
  full_name: "Test Person",
  email: "test@example.com",
  mobile: "+14165550100",
  province: "Ontario",
  created_at: "2026-11-13T20:14:00Z",
  company_name: "Test Company",
  business_type: "Corporation",
  privacy_consent: true,
  privacy_withdrawn_at: null,
  email_opt_in: true,
  email_withdrawn_at: "2026-11-14T15:00:00Z",
};

describe("CSV export", () => {
  it("makes cells that start like a spreadsheet formula safe", () => {
    expect(safeCell("=HYPERLINK(\"http://bad.example\")")).toBe('"\'=HYPERLINK(""http://bad.example"")"');
    expect(safeCell("+1 416")).toBe("\"'+1 416\"");
    expect(safeCell("-2+3")).toBe("\"'-2+3\"");
    expect(safeCell("@SUM(A1)")).toBe("\"'@SUM(A1)\"");
    expect(safeCell("\tTab")).toBe("\"'\tTab\"");
  });

  it("leaves normal text alone and keeps commas inside one cell", () => {
    expect(safeCell("Test Company, Inc.")).toBe('"Test Company, Inc."');
    expect(safeCell(null)).toBe('""');
  });

  it("builds a file with headings, readable values and withdrawn status", () => {
    const csv = buildCsv([row]);
    expect(csv.startsWith("﻿\"Name\",\"Email\"")).toBe(true);
    const lines = csv.trim().split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('"Test Person","test@example.com","416 555 0100","Ontario"');
    expect(lines[1]).toContain('"Given","Withdrawn ');
  });

  it("makes a formula typed into a name safe in the file", () => {
    const csv = buildCsv([{ ...row, company_name: "=1+1" }]);
    expect(csv).toContain("\"'=1+1\"");
  });
});
