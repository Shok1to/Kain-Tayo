import { expect, test } from "@playwright/test";
import { HONEYPOT_FIELD } from "../lib/spam/shared";

// Brief: the form and both consent boxes work with the keyboard only.

test("the whole form can be reached and used with the Tab key", async ({ page, browserName }) => {
  // Safari does not move Tab focus to links and buttons unless a setting is on.
  test.skip(browserName === "webkit", "Safari's Tab key skips links by default");
  await page.goto("/signup");

  const reached: string[] = [];
  for (let i = 0; i < 80; i += 1) {
    await page.keyboard.press("Tab");
    const label = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return "";
      return el.id || el.textContent?.trim() || el.tagName;
    });
    reached.push(label);
    if (label === "Submit") break;
  }

  const order = ["personal-firstName", "personal-lastName", "personal-email", "business-companyName", "business-businessType", "consent-privacy", "consent-email", "Submit"];
  const positions = order.map((id) => reached.indexOf(id));
  for (const [index, id] of order.entries()) expect(positions[index], `${id} is reachable`).toBeGreaterThanOrEqual(0);
  expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  expect(reached).not.toContain(HONEYPOT_FIELD);
});

test("the consent boxes can be ticked and unticked with the Space key", async ({ page }) => {
  await page.goto("/signup");
  const privacy = page.getByLabel(/^I agree that/);
  const email = page.getByLabel(/^Yes, I would like to receive emails/);

  await privacy.focus();
  await page.keyboard.press("Space");
  await expect(privacy).toBeChecked();
  await page.keyboard.press("Space");
  await expect(privacy).not.toBeChecked();

  await email.focus();
  await page.keyboard.press("Space");
  await expect(email).toBeChecked();
});

test("focus is clearly visible on the first name box", async ({ page }) => {
  await page.goto("/signup");
  const firstName = page.getByLabel(/^First name/);
  await firstName.focus();
  const outline = await firstName.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
});
