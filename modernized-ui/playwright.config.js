import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
})
