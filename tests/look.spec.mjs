// npm run look — the page as pictures, the way a visitor scrolls it (phone and desktop): shots/<lang>-phone-1.png, -2.png …,
// shots/<lang>-desktop-1.png … — to look at before publishing, and to show the owner (he works in web sessions, no localhost).
// Languages: LANGS=uk,en npm run look (default: uk). REDUCE=1 — with reduced motion (every animation at its end).
// The brand page (English only): PAGE=brand npm run look → shots/brand-phone-1.png …
import { test } from '@playwright/test';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';

const OUT = new URL('../shots/', import.meta.url).pathname;
const BRAND = process.env.PAGE === 'brand';
const LANGS = BRAND ? ['brand'] : (process.env.LANGS || 'uk').split(',').map((s) => s.trim()).filter(Boolean);
const SIZES = [['phone', { width: 390, height: 844 }, 2], ['desktop', { width: 1440, height: 900 }, 1]];

for (const [name, viewport, dpr] of SIZES) test.describe(name, () => {
  test.use({ viewport, deviceScaleFactor: dpr });
  for (const L of LANGS) test(`${L} · ${name}`, async ({ page }) => {
    mkdirSync(OUT, { recursive: true });
    for (const f of readdirSync(OUT)) if (f.startsWith(`${L}-${name}-`)) rmSync(OUT + f);
    if (process.env.REDUCE) await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BRAND ? './brand/' : `./?lang=${L}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(3600);                                          // the heart assembles and beats
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, n = 1; y < H; y += viewport.height * .92, n++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(1300);
      await page.screenshot({ path: `${OUT}${L}-${name}-${n}.png` });
      if (y + viewport.height >= H) break;
    }
  });
});
