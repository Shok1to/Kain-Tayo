import { defineConfig, devices } from "@playwright/test";

// Browser tests for the main journeys, keyboard use and accessibility.
// They run against the local dev server. Tests that would save data or sign
// in are skipped unless a separate Supabase TEST project is set up (see
// docs/test-plan.md), so the real project is never touched.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "phone", use: { ...devices["iPhone 15"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
