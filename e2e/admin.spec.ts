import { expect, test } from "@playwright/test";

// The admin area is closed to anyone who is not signed in. No sign in happens here.

for (const path of ["/admin", "/admin/mfa", "/admin/export", "/admin/signups/11111111-1111-4111-8111-111111111111"]) {
  test(`${path} sends someone who is not signed in to the login page`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

test("admin pages ask search engines not to list them", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
