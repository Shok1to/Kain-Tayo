import { expect, test } from "@playwright/test";
import { emailBox, fillRequired, privacyBox } from "./helpers";

// Brief section 10, consent checks. Nothing here is submitted to the server.

test("both consent boxes are unticked on first load", async ({ page }) => {
  await page.goto("/signup");
  await expect(privacyBox(page)).not.toBeChecked();
  await expect(emailBox(page)).not.toBeChecked();
});

test("both consent boxes are unticked again after a reload", async ({ page }) => {
  await page.goto("/signup");
  await privacyBox(page).check();
  await emailBox(page).check();
  await page.reload();
  await expect(privacyBox(page)).not.toBeChecked();
  await expect(emailBox(page)).not.toBeChecked();
});

test("both consent boxes are unticked again after the back button", async ({ page }) => {
  await page.goto("/signup");
  await privacyBox(page).check();
  await emailBox(page).check();
  await page.goto("/signup/privacy");
  await page.goBack();
  await expect(privacyBox(page)).not.toBeChecked();
  await expect(emailBox(page)).not.toBeChecked();
});

test("the privacy policy link opens in a new tab, so the form is not lost", async ({ page }) => {
  await page.goto("/signup");
  const link = page.getByRole("link", { name: "Privacy Policy" });
  await expect(link).toHaveAttribute("target", "_blank");
});

test("a sign up without privacy consent is blocked, and what was typed is kept", async ({ page }) => {
  await page.goto("/signup");
  await fillRequired(page);
  await emailBox(page).check();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText("Please agree to the privacy notice to sign up")).toBeVisible();
  await expect(page.getByLabel(/^First name/)).toHaveValue("Test");
  await expect(page.getByLabel(/^Email address/)).toHaveValue("test@example.com");
  await expect(emailBox(page)).toBeChecked();
  await expect(page.getByText("Thank you for signing up")).toHaveCount(0);
});

test("empty required fields show plain errors next to them", async ({ page }) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Please enter your first name")).toBeVisible();
  await expect(page.getByText("Please enter your company name, or N/A if you have none")).toBeVisible();
  await expect(page.getByLabel(/^First name/)).toHaveAttribute("aria-invalid", "true");
});
