import { createHmac } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

// Shared helpers for the browser tests. Fake data only.

export const privacyBox = (page: Page) => page.getByLabel(/^I agree that/);
export const emailBox = (page: Page) => page.getByLabel(/^Yes, I would like to receive emails/);

export async function fillRequired(page: Page, email = "test@example.com") {
  await page.getByLabel(/^First name/).fill("Test");
  await page.getByLabel(/^Last name/).fill("Person");
  await page.getByLabel(/^Mobile number/).fill("416 555 0100");
  await page.getByLabel(/^Email address/).fill(email);
  await page.getByLabel(/^Company name/).fill("N/A");
  await page.getByLabel(/^Type of business/).selectOption("Other");
}

// Checks the page against WCAG 2.1 A and AA rules with axe.
// The Cloudflare security check lives in Cloudflare's own frame, which we
// cannot change, so it is left out.
export async function expectNoAccessibilityProblems(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("iframe")
    .analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`);
  expect(summary).toEqual([]);
}

// Tests that save data or sign in run only against a separate Supabase TEST
// project, never the real one. Set E2E_TEST_PROJECT=yes only when the dev
// server is pointed at that test project.
export const usesTestProject = process.env.E2E_TEST_PROJECT === "yes";
export const NEEDS_TEST_PROJECT = "Needs a separate Supabase test project (see docs/test-plan.md)";

// A 6 digit code from a TEST admin's authenticator secret (RFC 6238).
export function totpCode(base32Secret: string, now = Date.now()): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of base32Secret.replace(/=+$/, "").toUpperCase()) {
    bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  }
  const key = Buffer.from(bits.match(/.{8}/g)!.map((byte) => parseInt(byte, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30000)));
  const hash = createHmac("sha1", key).update(counter).digest();
  const offset = hash[hash.length - 1] & 0xf;
  const code = (hash.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, "0");
}
