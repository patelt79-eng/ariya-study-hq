import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 90_000,
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4179/ariya-study-hq/', serviceWorkers: 'allow' },
  projects: [
    { name: 'ipad-portrait', use: { viewport: { width: 820, height: 1180 }, hasTouch: true } },
    { name: 'ipad-landscape', use: { viewport: { width: 1180, height: 820 }, hasTouch: true } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
  webServer: {
    command: 'npx vite preview --port 4179 --strictPort',
    url: 'http://localhost:4179/ariya-study-hq/',
    reuseExistingServer: true,
  },
});
