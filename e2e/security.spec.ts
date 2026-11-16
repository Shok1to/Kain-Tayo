import { expect, test } from "@playwright/test";

// The security headers are sent, and the Content Security Policy does not
// break the page or the Cloudflare security check.

for (const path of ["/signup", "/signup/privacy", "/admin/login"]) {
  test(`${path} sends the security headers`, async ({ page }) => {
    const response = await page.goto(path);
    const headers = response!.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
}

test("the sign up page works under the Content Security Policy, including Turnstile", async ({ page }) => {
  const blocked: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Content-Security-Policy/i.test(message.text())) blocked.push(message.text());
  });
  await page.goto("/signup");
  // The Cloudflare check loads in its own frame (inside a hidden shadow
  // area, so look at the browser's list of frames).
  await expect
    .poll(() => page.frames().some((frame) => frame.url().includes("challenges.cloudflare.com")), { timeout: 15000 })
    .toBe(true);
  // The form still reacts, so the page's own scripts were allowed to run.
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Please enter your first name")).toBeVisible();
  expect(blocked).toEqual([]);
});

test("the CSV download refuses a plain visit to its address", async ({ request }) => {
  const response = await request.get("/admin/export", { maxRedirects: 0 });
  expect(response.status()).not.toBe(200);
});
