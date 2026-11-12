import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./frontend/e2e",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      command: "node scripts/e2e-backend.mjs",
      url: "http://127.0.0.1:3100/graphql",
      timeout: 120_000,
      reuseExistingServer: false,
      gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
    },
    {
      command: "npm --prefix frontend run dev -- --port 4173 --strictPort",
      url: "http://127.0.0.1:4173",
      env: { BACKEND_URL: "http://127.0.0.1:3100" },
      timeout: 60_000,
      reuseExistingServer: false,
      gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
    },
  ],
});
