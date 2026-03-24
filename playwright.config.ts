import { defineConfig, devices } from '@playwright/test';

import { getPlaywrightRuntimeConfig } from './playwright.config.helpers';

const runtimeConfig = getPlaywrightRuntimeConfig();
const projects = process.env.CI
  ? [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ]
  : [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: runtimeConfig.baseURL,
    trace: 'on-first-retry',
  },
  projects,
  webServer: {
    command: runtimeConfig.webServerCommand,
    url: runtimeConfig.baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
