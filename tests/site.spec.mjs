// npm test — the built site (npm run build first; npm test does it): languages, the heart, both mini-games, links, no third party,
// and the brand page (/brand/): its splash, About us in 15 languages, every download, brand.json, the kit zip, the sound and «How to say it».
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
  await expect(page.locator('.chap.cp .ctas a[data-lang-link]')).toHaveAttribute('href', '/Game-CubePix/?lang=uk');   // CubePix opens in the same language
  await expect(page.locator('.pix-meet')).toHaveAttribute('href', '/Game-CubePix/?lang=uk#pix');                // …and «Meet Pix» at his section
  await expect(page.locator('.pix-meet .pix-hi')).toHaveText('Привіт! Я Pix.');                                 // the mascot says hi in the visitor's language
  await expect(page.locator('.tl-i.pix h3')).toHaveText('Народився Pix');                                       // the day he was invented, in the story
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
  await expect(page.locator('#top .lw-lockup .lw-logo')).toHaveClass(/lw-beating/);                   // and beat once
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
  const cur = () => page.locator('#cpThumbs .thumb[aria-current="true"]').getAttribute('data-i');
  await expect(page.locator('#cpThumbs .thumb')).toHaveCount(4);                                      // the paintings themselves, not little squares
  expect(await cur()).toBe('0');
  await page.locator('#cpNext').click(); expect(await cur()).toBe('1');                               // big arrows on the frame
  await page.locator('#cpPrev').click(); await page.locator('#cpPrev').click(); expect(await cur()).toBe('3');
  await page.locator('#cpThumbs .thumb').nth(2).click(); expect(await cur()).toBe('2');               // a tap on a picture
  const m = await page.locator('#cpStage .mat').boundingBox();                                         // a swipe across the painting
  await page.mouse.move(m.x + m.width * .8, m.y + m.height / 2); await page.mouse.down();
  await page.mouse.move(m.x + m.width * .2, m.y + m.height / 2, { steps: 8 }); await page.mouse.up();
  expect(await cur()).toBe('3');
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
  await expect(page.locator('.od a.btn-cyan')).toHaveAttribute('href', '/Game-Orbit-Dash/play/');   // the whole game in the browser comes first, as with CubePix
  await expect(page.locator('.od .ctas a[href*="com.lewydo.orbitdash"]')).toHaveCount(1);          // Google Play right after it
  await expect(page.locator('.od .od-shots img')).toHaveCount(3);                                   // real frames from the game
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
  expect(await (await request.get('./sitemap.xml')).text()).toContain('/brand/');
  for (const f of ['assets/og.png', 'assets/favicon.png', 'assets/icon-180.png', 'logo.png', 'banner.png', 'brand.png'])
    expect((await request.get('./' + f)).status(), f).toBe(200);
});

test('the brand page: the splash, About us in every language, every download, brand.json and the kit zip', async ({ page, request }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const w = watch(page);
  await page.goto('./?lang=en');
  await expect(page.locator('.foot-links a[href="/brand/"]')).toHaveText('Brand');                   // the site links to it
  await page.goto('./brand/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');                                  // the visitor's language (here English)
  await expect(page.locator('#heroLock')).toHaveClass(/lw-splash/);                                  // the splash plays at once
  await page.locator('#abLang').selectOption('uk');                                                  // About us, the games' own words
  await expect(page.locator('#abTitle')).toHaveText('Про нас');
  await expect(page.locator('#abText')).toContainText('Влад');
  await expect(page.locator('#abText')).not.toContainText('Дякуємо');                                // the thank-you is not the paragraph's end…
  await expect(page.locator('#abThanks')).toHaveText('Дякуємо, що граєте!');                          // …but its own last line
  await page.locator('.tabs button', { hasText: 'BrandScreen.kt' }).click();                         // the code, file by file
  await expect(page.locator('pre.src:visible')).toContainText('class BrandScreen');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[download], .tabs button')].map((a) => a.getAttribute('href') || a.dataset.file))].filter((h) => h && h !== '#'));
  expect(links.length).toBeGreaterThan(20);
  for (const h of links) expect((await request.get('.' + h)).status(), h).toBe(200);
  const B = await (await request.get('./brand/brand.json')).json();
  expect(B.slogan).toBe('Love What You Do');
  expect(Object.keys(B.about.texts)).toHaveLength(15);
  for (const [L, A] of Object.entries(B.about.texts)) { expect(A.thanks, L).toBeTruthy(); expect(A.text, L).not.toContain(A.thanks); }
  expect(B.about.layout.thanks.rule).toMatch(/own last line/);
  for (const u of [...Object.values(B.images).flatMap((i) => [i.png, i.webp]), B.atlas.atlas, B.atlas.png, ...Object.values(B.code).map((c) => c.url)])
    expect((await request.get(u.replace('https://roshevasternin.github.io/', './'))).status(), u).toBe(200);
  expect(B.pronunciation.ipa).toBe('/lɛv.waɪ.doʊ/');                                                 // how to say it
  for (const u of Object.values(B.sound.files)) {                                                     // the Lewydo sound, every format
    const r = await request.get(u.replace('https://roshevasternin.github.io/', './'));
    expect(r.status(), u).toBe(200); expect((await r.body()).length, u).toBeGreaterThan(20000);
  }
  const zip = await (await request.get('./brand/lewydo-brand-kit.zip')).body();
  expect(zip.subarray(0, 2).toString()).toBe('PK');
  expect(w.errs).toEqual([]);
  expect([...w.ext]).toEqual([]);
});

test('«How to say it»: both pages say Lev-why-do in the device’s voice, and the brand page plays the Lewydo sound', async ({ page }) => {
  await page.addInitScript(() => { window.__said = [];                                                // a stand-in voice that remembers what it said
    Object.defineProperty(window, 'speechSynthesis', { value: { cancel() {}, getVoices: () => [], speak: (u) => window.__said.push(u.text) } }); });
  const w = watch(page);
  await page.goto('./?lang=uk');
  await expect(page.locator('#studio [data-say]')).toContainText('Як вимовляти');
  await expect(page.locator('#studio .say-spell')).toHaveText('Лев-вай-до');
  await page.locator('#studio [data-say]').click();
  expect(await page.evaluate(() => window.__said)).toEqual(['Lev, why, doe']);
  await page.goto('./brand/?lang=en');
  await page.locator('.spell [data-say]').click();
  expect(await page.evaluate(() => window.__said)).toEqual(['Lev, why, doe']);
  await expect(page.locator('#sound .notes i')).toHaveCount(2);                                       // lub · dub — the heart only
  await page.locator('#sndGo').click();
  await expect(page.locator('#sound .notes i.on').first()).toBeAttached({ timeout: 3000 });           // the hearts light up on the beats
  expect(w.errs).toEqual([]);
});

test('the brand page speaks all 15 languages, fills every text and never scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const w = watch(page);
  for (const L of LANGS) {
    await page.goto(`./brand/?lang=${L}`);
    await expect(page.locator('html')).toHaveAttribute('lang', L);
    const bad = await page.evaluate(() => [...document.querySelectorAll('[data-t]')].filter((e) => !e.textContent.trim()).map((e) => e.dataset.t));
    expect(bad, L).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), L).toBeLessThanOrEqual(320);
  }
  await page.goto('./brand/?lang=uk');
  await expect(page.locator('#abTitle')).toHaveText('Про нас');                                      // About us follows the page's language
  await page.locator('#langBtn').click(); await page.locator('#langMenu button[data-lang="de"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.goto('./?lang=');                                                                        // the site remembers it too
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  expect(w.errs).toEqual([]);
});

// the brand standard (owner 03.10.2026): «Thank you for playing!» — About us' own last line, centred, ONE line in every language
test('About us: the thank-you is one centred line under the text in all 15 languages, on the brand page and on the site', async ({ page }) => {
  const w = watch(page);
  await page.goto('./brand/?lang=en');
  for (const L of LANGS) {
    await page.locator('#abLang').selectOption(L);
    const r = await page.locator('#abThanks').evaluate((e) => { const b = e.getBoundingClientRect(), c = e.parentElement.getBoundingClientRect(), t = document.createRange();
      t.selectNodeContents(e); const tb = t.getBoundingClientRect();
      return { lines: Math.round(e.offsetHeight / parseFloat(getComputedStyle(e).lineHeight)), fits: e.scrollWidth <= e.clientWidth + 1, off: Math.abs((tb.left + tb.right) / 2 - (c.left + c.right) / 2),
        gap: document.getElementById('abSite').getBoundingClientRect().top - b.bottom }; });
    expect(r.lines, L).toBe(1); expect(r.fits, L).toBe(true); expect(r.off, L).toBeLessThan(3); expect(r.gap, L).toBeGreaterThan(5);   // and clear of the button
  }
  await page.goto('./?lang=uk');
  await expect(page.locator('#studio .sub.thanks')).toHaveText('Дякуємо, що граєте!');
  await expect(page.locator('#studio .sub').first()).not.toContainText('Дякуємо');
  expect(w.errs).toEqual([]);
});

// Vlad's favourite song (owner 03.10.2026; he chose «only the song, through YouTube»): it isn't ours, so it is never a file on the
// site — YouTube's own player, asked for only when the record is tapped, in sight while it plays (≥ 200 × 200), credited and linked
test('Vlad’s favourite song: the record opens YouTube’s own player only on a tap — credited, linked, on and off', async ({ page }) => {
  const w = watch(page);
  await page.route(/youtube|ytimg|googlevideo/, (r) => r.abort());                                   // offline here: what matters is what the page asks for, and when
  await page.goto('./?lang=uk');
  const fab = page.locator('#muFab'), card = page.locator('#muCard');
  await expect(fab).toHaveAttribute('aria-label', /^Улюблена пісня Влада: sombr\s—\s12 to 12$/);
  await expect(page.locator('#muHint')).toBeVisible({ timeout: 5000 });                               // the first visit: whose song it is
  expect([...w.ext]).toEqual([]);                                                                     // nothing from YouTube until the tap
  await expect(page.locator('#muPlayer iframe')).toHaveCount(0);
  await fab.click();
  await expect(card).toBeVisible();
  await expect(page.locator('#muHint')).toBeHidden();
  await expect(fab).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#muPlayer iframe')).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/cZgUiR31m-Y\?autoplay=1/);
  const b = await page.locator('#muPlayer').boundingBox();
  expect(b.width).toBeGreaterThanOrEqual(200); expect(b.height).toBeGreaterThanOrEqual(200);          // YouTube's rule: the player in sight, at least 200 × 200
  await expect(card).toContainText('Улюблена пісня Влада');
  await expect(card).toContainText(/sombr\s—\s12 to 12/);
  await expect(page.locator('.mu-song')).toHaveAttribute('href', 'https://www.youtube.com/watch?v=cZgUiR31m-Y');     // thanks to the author: his video
  await expect(page.locator('.mu-song')).toHaveAttribute('title', 'Дякуємо, sombr! Кліп на YouTube');
  expect(b.width).toBeLessThanOrEqual(201); expect(b.height).toBeLessThanOrEqual(201);              // …and no bigger: the smallest YouTube allows
  await expect(page.locator('.foot-music a')).toHaveAttribute('href', 'https://www.youtube.com/watch?v=cZgUiR31m-Y'); // the credit stays in the footer
  await fab.click();                                                                                  // off
  await expect(card).toBeHidden(); await expect(fab).toHaveAttribute('aria-pressed', 'false');
  await fab.click(); await expect(card).toBeVisible();                                                // on again
  await page.keyboard.press('Escape'); await expect(card).toBeHidden();                               // Esc — off
  await page.setViewportSize({ width: 320, height: 640 });                                            // the smallest phone: still ≥ 200 × 200, nothing sideways
  await page.goto('./?lang=uk');
  await fab.click();
  const s = await page.locator('#muPlayer').boundingBox();
  expect(s.width).toBeGreaterThanOrEqual(200); expect(s.height).toBeGreaterThanOrEqual(200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.locator('#muX').click(); await expect(card).toBeHidden();
  await page.goto('./brand/?lang=en');                                                                // the brand page has it too
  await expect(page.locator('#muFab')).toHaveAttribute('aria-label', /^Vlad’s favourite song: sombr\s—\s12 to 12$/);
  await expect(page.locator('#muHint')).toBeHidden();                                                 // the word by the record — once
  expect(w.errs.filter((e) => !/Failed to load resource|ERR_FAILED/.test(e))).toEqual([]);
});

// the contacts (owner 03.10.2026): the work Telegram, Lewydo's own pages; and the brand page says how every Lewydo game is made
test('contacts: the work Telegram and Lewydo\'s own pages; the brand page and brand.json say «prototype first»', async ({ page, request }) => {
  const w = watch(page);
  await page.goto('./?lang=uk');
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
  expect(hrefs.filter((h) => h.startsWith('https://t.me/'))).toEqual(['https://t.me/vlad_libgdx', 'https://t.me/vlad_libgdx']);   // Vlad's card and the contacts
  for (const u of ['https://www.tiktok.com/@lewydo_game', 'https://www.instagram.com/lewydo_game/', 'https://www.youtube.com/channel/UCn2SbibS30OyiUPHBFhvFpw',
    'https://www.facebook.com/profile.php?id=61594804110096']) {
    await expect(page.locator(`.social a[href="${u}"]`)).toHaveCount(1);
    await expect(page.locator(`.foot-social a[href="${u}"]`)).toHaveCount(1);
  }
  await expect(page.locator('.social-h')).toHaveText('Lewydo в соцмережах');
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(ld.sameAs).toContain('https://www.tiktok.com/@lewydo_game');
  await page.goto('./brand/?lang=uk');
  await expect(page.locator('#work h2')).toHaveText('Спершу прототип, потім гра');
  await expect(page.locator('#work .flow li')).toHaveCount(3);
  await expect(page.locator('#promptText')).toContainText('prototype first');
  const B = await (await request.get('./brand/brand.json')).json();
  expect(B.workflow.rule).toBe('Prototype first, then the game');
  expect(B.socials.telegram).toBe('https://t.me/vlad_libgdx');
  expect(B.font.name).toMatch(/^Nunito Black 54 \/ 74/); expect(B.font.slogan).toMatch(/^Nunito 14 \/ 19/);   // round numbers
  expect(w.errs).toEqual([]);
});
