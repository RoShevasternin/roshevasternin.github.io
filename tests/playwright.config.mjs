// The site's tests and pictures: npm test (site.spec), npm run look (look.spec), npm run kit (kit.spec). Served like GitHub Pages.
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.', timeout: 180_000, workers: 1, reporter: [['list']],
  use: { baseURL: 'http://localhost:5190/', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, browserName: 'chromium', locale: 'en-US' },
  webServer: { command: 'node serve.mjs 5190', url: 'http://localhost:5190/', reuseExistingServer: true, timeout: 30_000 },
});
