// npm run kit — the brand pictures, drawn by the page's own CSS (the standard's numbers), so they can never drift from it:
//   assets/og.png (the card a link shows in chats, 1200×630), assets/favicon.png (64), assets/icon-180.png (Apple),
//   assets/icon-512.png, and the site's old addresses, now the standard too: logo.png (512), banner.png (1920×1080),
//   brand.png (the Lockup, transparent); and the brand kit's brand/kit/png/lockup.png, signature.png, pill.png (@3x).
//   Run after changing the mark, the fonts or the OG card, then npm run build again (the kit zip takes them) and commit the pictures.
import { test } from '@playwright/test';

const R = new URL('../', import.meta.url).pathname;
test.use({ deviceScaleFactor: 1 });

test('brand pictures', async ({ page }) => {
  await page.setViewportSize({ width: 2400, height: 1600 });
  await page.goto('./?kit&lang=en');
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  const shot = (sel, file, transparent = false) => page.locator(sel).screenshot({ path: R + file, omitBackground: transparent });
  await shot('#kitIcon', 'assets/icon-512.png'); await shot('#kitIcon', 'logo.png');
  await shot('#kitTouch', 'assets/icon-180.png');
  await shot('#kitFav', 'assets/favicon.png', true);
  await shot('#kitLockup', 'brand.png', true);
  await shot('#kitBanner', 'banner.png');
});

// the brand kit's own pictures, @3x, transparent, from the kit's PNG originals and its CSS (brand/?kit): the whole Lockup, the Signature, the menu pill
test('brand kit pictures', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1200 });
  await page.goto('./brand/?kit');
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  const shot = (sel, file) => page.locator(sel).screenshot({ path: R + file, omitBackground: true });
  await shot('#kitLockup3 .lw-lockup', 'brand/kit/png/lockup.png');
  await shot('#kitSig3 .lw-sig', 'brand/kit/png/signature.png');
  await shot('#kitPill3 .lw-pill', 'brand/kit/png/pill.png');
});

test('link card', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto('./?og&lang=en');
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(500);
  await page.screenshot({ path: R + 'assets/og.png' });
});
