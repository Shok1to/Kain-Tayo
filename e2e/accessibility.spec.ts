import { test } from "@playwright/test";
import { expectNoAccessibilityProblems } from "./helpers";

// axe checks (WCAG 2.1 A and AA) on every page a visitor or admin can open
// without signing in. Pages behind sign in are checked in database-journeys.

test("sign up form", async ({ page }) => {
  await page.goto("/signup");
  await expectNoAccessibilityProblems(page);
});

test("sign up form showing errors", async ({ page }) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByText("Please enter your first name").waitFor();
  await expectNoAccessibilityProblems(page);
});

test("privacy page", async ({ page }) => {
  await page.goto("/signup/privacy");
  await expectNoAccessibilityProblems(page);
});

test("how we use your information page", async ({ page }) => {
  await page.goto("/signup/how-we-use-your-information");
  await expectNoAccessibilityProblems(page);
});

test("admin login page", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").waitFor();
  await expectNoAccessibilityProblems(page);
});

test("admin login page showing an error", async ({ page }) => {
  await page.goto("/admin/login");
  // Leaving both boxes empty is refused by the browser form check first,
  // so no request reaches Supabase.
  await page.getByRole("button", { name: /sign in/i }).click();
  await expectNoAccessibilityProblems(page);
});
