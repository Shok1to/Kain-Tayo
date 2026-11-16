import { expect, test } from "@playwright/test";
import {
  NEEDS_TEST_PROJECT,
  expectNoAccessibilityProblems,
  fillRequired,
  privacyBox,
  totpCode,
  usesTestProject,
} from "./helpers";

// Journeys that save data or sign in. They run ONLY when the dev server is
// pointed at a separate Supabase TEST project and E2E_TEST_PROJECT=yes.
// Otherwise every test here is skipped, so the real project is never touched.

test.skip(!usesTestProject, NEEDS_TEST_PROJECT);
// One browser is enough for journeys that write data.
test.skip(({ browserName }) => browserName !== "chromium", "Runs in one browser only");

async function signUp(page: import("@playwright/test").Page, email: string) {
  await page.goto("/signup");
  await fillRequired(page, email);
  await privacyBox(page).check();
  // Wait for the Cloudflare test key to hand over its token.
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Submit" }).click();
}

test("a good sign up shows the thank you message", async ({ page }) => {
  await signUp(page, `test+${Date.now()}@example.com`);
  await expect(page.getByText("Thank you for signing up")).toBeVisible();
  await expectNoAccessibilityProblems(page);
});

test("a duplicate email is refused with a clear message", async ({ page }) => {
  const email = `test+dup${Date.now()}@example.com`;
  await signUp(page, email);
  await expect(page.getByText("Thank you for signing up")).toBeVisible();
  await signUp(page, email);
  await expect(page.getByText(/If you have already signed up, you do not need to do it again/)).toBeVisible();
});

test("an admin can sign in with MFA and see the list", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  const secret = process.env.E2E_ADMIN_TOTP_SECRET;
  test.skip(!email || !password || !secret, "Needs a TEST admin in the test project");

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.getByLabel(/code/i).fill(totpCode(secret!));
  await page.getByRole("button", { name: /verify|continue|check/i }).click();

  await expect(page.getByRole("heading", { name: "Signups" })).toBeVisible();
  await expectNoAccessibilityProblems(page);

  await page.getByLabel("Search name, email or company").fill("Test");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/q=Test/);
  await expectNoAccessibilityProblems(page);
});
