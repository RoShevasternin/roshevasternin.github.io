// npm test — the built site (npm run build first; npm test does it): languages, the heart, both mini-games, links, no third party.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const LANGS = JSON.parse(readFileSync(new URL('../src/langs.json', import.meta.url), 'utf8')).map((L) => L.id);
const watch = (page) => { const errs = [], ext = new Set();
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('request', (r) => { const u = new URL(r.url()); if (u.protocol.startsWith('http') && u.hostname !== 'localhost') ext.add(u.origin); });
  return { errs, ext }; };

test('speaks the visitor’s language, switches to any of 15, remembers it, and asks no third party for anything', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'pt-BR' }), page = await ctx.newPage(), w = watch(page);
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');                                   // the device's language
  await page.locator('#langBtn').click();
  await expect(page.locator('#langMenu button')).toHaveCount(15);
  await page.locator('#langMenu button[data-lang="uk"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  expect(page.url()).toContain('lang=uk');
  await expect(page.locator('.stats li').first()).toHaveText(/^2\s*людини$/);                         // a plural form, never «{n}»
  await expect(page.locator('.chap.cp a[data-lang-link]')).toHaveAttribute('href', '/Game-CubePix/?lang=uk');   // CubePix opens in the same language
  await page.goto('./');                                                                              // remembered
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  expect(w.errs).toEqual([]);
  expect([...w.ext]).toEqual([]);
  await ctx.close();
});

test('every language fills every text, and nothing scrolls sideways on a small phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const L of LANGS) {
    await page.goto(`./?lang=${L}`);
    await expect(page.locator('html')).toHaveAttribute('lang', L);
    const bad = await page.evaluate(() => [...document.querySelectorAll('[data-t]')].filter((e) => !e.closest('#og,#kit') && (!e.textContent.trim() || /\{\w+\}/.test(e.textContent))).map((e) => e.dataset.t));
    expect(bad, L).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), L).toBeLessThanOrEqual(320);
  }
});

test('the pixels become the Lewydo heart; tap it and they fly again', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const w = watch(page);
  await page.goto('./?lang=en');
  await expect(page.locator('#top')).toHaveClass(/\blit\b/, { timeout: 6000 });                      // the heart landed
  await expect(page.locator('#top .lw-lockup .lw-beat')).toHaveClass(/lw-beating/);                   // and beat once
  await page.locator('#heartBtn').click();
  await expect(page.locator('#top')).not.toHaveClass(/\blit\b/);
  await expect(page.locator('#top')).toHaveClass(/\blit\b/, { timeout: 4000 });
  expect(w.errs).toEqual([]);
});

test('both games can be played right on the page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const w = watch(page);
  await page.goto('./?lang=en');
  await page.locator('#cubepix').scrollIntoViewIfNeeded();
  await expect(page.locator('#cpLayer')).toHaveText(/LAYER \d+ \/ \d+/i);                              // a painting reveals itself
  await page.locator('#cpTry').click();                                                                // CubePix: the little puzzle
  await expect(page.locator('#pzHint')).toBeVisible();
  for (let i = 0; i < 300 && !(await page.locator('#pzDone').isVisible()); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(10); }
  await expect(page.locator('#pzDone')).toBeVisible();
  await expect(page.locator('#cpName')).toHaveText('Strawberry');
  await expect(page.locator('#pzFact')).not.toBeEmpty();
  await page.locator('#cpBack').click();
  await expect(page.locator('#cpTry')).toBeVisible();
  await page.locator('#orbitdash').scrollIntoViewIfNeeded();                                            // Orbit Dash: plays itself until you tap
  await expect(page.locator('#odHint')).toContainText('Tap to play');
  await page.locator('#odCv').click();
  await expect(page.locator('#odHint')).toHaveText(/Tap to switch orbits|Crash!/);
  await expect(page.locator('.od a.btn-cyan')).toHaveAttribute('href', /com\.lewydo\.orbitdash/);
  expect(w.errs).toEqual([]);
});

test('the pages around it: 404, robots, sitemap, app-ads.txt for AdMob', async ({ page, request }) => {
  const r404 = await request.get('./no-such-room');
  expect(r404.status()).toBe(404);
  await page.goto('./no-such-room');
  await expect(page.locator('.lw-lockup')).toBeVisible();
  await expect(page.locator('a[href="/"]')).toBeVisible();
  expect(await (await request.get('./app-ads.txt')).text()).toContain('pub-4052300465234748');        // AdMob reads it: never lose it
  expect(await (await request.get('./robots.txt')).text()).toContain('sitemap.xml');
  expect(await (await request.get('./sitemap.xml')).text()).toContain('Game-CubePix/');
  for (const f of ['assets/og.png', 'assets/favicon.png', 'assets/icon-180.png', 'logo.png', 'banner.png', 'brand.png'])
    expect((await request.get('./' + f)).status(), f).toBe(200);
});
