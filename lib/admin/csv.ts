import type { SignupListRow } from "./signups";
import { emailConsentLabel, formatDateTime, formatPhone, privacyConsentLabel } from "./format";

// Builds the CSV file for the admin export.

// A spreadsheet treats a cell that starts with = + - @ (or a tab or line
// break) as a formula, which could run something harmful when the file is
// opened. Putting an apostrophe in front makes the spreadsheet show it as
// plain text instead.
export function safeCell(value: string | null | undefined): string {
  const text = value ?? "";
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  // Every cell goes inside quotes, and quotes inside are doubled, so commas
  // and line breaks in a value cannot break the columns.
  return `"${safe.replace(/"/g, '""')}"`;
}

export const CSV_HEADINGS = [
  "Name",
  "Email",
  "Mobile",
  "Province",
  "Company",
  "Type of business",
  "Signed up",
  "Privacy consent",
  "Email consent",
] as const;

export function buildCsv(rows: SignupListRow[]): string {
  const lines = [CSV_HEADINGS.map(safeCell).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.full_name,
        row.email,
        formatPhone(row.mobile),
        row.province,
        row.company_name,
        row.business_type,
        formatDateTime(row.created_at),
        privacyConsentLabel(row.privacy_consent, row.privacy_withdrawn_at),
        emailConsentLabel(row.email_opt_in, row.email_withdrawn_at),
      ]
        .map(safeCell)
        .join(",")
    );
  }
  // The mark at the start tells Excel the file is UTF-8, so accented names
  // such as Zoë show correctly. Lines end with CRLF, the CSV standard.
  return "﻿" + lines.join("\r\n") + "\r\n";
}
