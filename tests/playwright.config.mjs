// The site's tests and pictures: npm test (site.spec), npm run look (look.spec), npm run kit (kit.spec). Served like GitHub Pages.
import { defineConfig } from '@playwright/test';
const PORT = +(process.env.SITE_PORT || 5190);   // SITE_PORT=5197 npm test — another port (two sessions on one Mac must not share a server)
export default defineConfig({
  testDir: '.', timeout: 180_000, workers: 1, reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}/`, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, browserName: 'chromium', locale: 'en-US' },
  webServer: { command: `node serve.mjs ${PORT}`, url: `http://localhost:${PORT}/`, reuseExistingServer: true, timeout: 30_000 },
});
