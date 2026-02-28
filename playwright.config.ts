import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  // For now we only run the smoke test (landing + header/auth)
  testMatch: /smoke\.spec\.ts$/,
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  // In CI and local runs we only care about Chromium for now
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
