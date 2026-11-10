// npm test — the built site (npm run build first; npm test does it): languages, the heart, both mini-games, links, no third party,
// and the brand page (/brand/): its splash, About us in every language, every download, brand.json, the kit zip, the sound and «How to say it».
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const LANGS = JSON.parse(readFileSync(new URL('../src/langs.json', import.meta.url), 'utf8')).map((L) => L.id);
const RTL = ['ar', 'he', 'fa', 'ur', 'ps'];
const STOP_RU = 'Россия, останови войну в Украине';
const watch = (page) => { const errs = [], ext = new Set();
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('request', (r) => { const u = new URL(r.url()); if (u.protocol.startsWith('http') && u.hostname !== 'localhost') ext.add(u.origin); });
  return { errs, ext }; };

// Orbit Dash's block shows the game itself: its site's play/embed.html (the prototype + a director) — since 06.11.2026 on its own origin,
// https://orbitdash.lewydo.com/, not under the studio's. tests/serve.mjs mirrors that: the studio on SITE_PORT, the game's site on the next
// port (OD_PORT), and the pages it serves name the game by that local address (OD below; the files on disk keep the real one — tested too).
// npm test speaks to a stand-in that answers the same messages by the same rules; with OD_SITE=<a build of the Orbit Dash site> the real game answers.
const REAL_OD = !!process.env.OD_SITE;
const SITE_PORT = +(process.env.SITE_PORT || 5190), OD = `http://localhost:${+(process.env.OD_PORT || SITE_PORT + 1)}`;
const OD_REAL = 'https://orbitdash.lewydo.com', CP = 'https://cubepix.lewydo.com', MARK = 'utm_source=lewydo&utm_medium=studio_site';
const ROOT = new URL('../', import.meta.url), disk = (p) => readFileSync(new URL(p, ROOT), 'utf8');

test('speaks the visitor’s language, switches to any of ours, remembers it, and asks no third party for anything', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'pt-BR' });
  const page = await ctx.newPage(), w = watch(page);
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');                                   // the device's language
  await page.locator('#langBtn').click();
  await expect(page.locator('#langMenu button')).toHaveCount(LANGS.length);
  await expect(page.locator('#langMenu button').last()).toHaveAttribute('data-lang', 'km');            // the game's order: Latin, then the other scripts
  await page.locator('#langMenu button[data-lang="uk"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  expect(page.url()).toContain('lang=uk');
  await expect(page.locator('.stats li').first()).toHaveText(/^2\s*людини$/);                         // a plural form, never «{n}»
  await expect(page.locator('.chap.cp .ctas a.px-dark')).toHaveAttribute('href', `${CP}/?${MARK}&lang=uk`);   // CubePix opens in the same language (its own origin: the link says it)
  await expect(page.locator('.pix-meet')).toHaveAttribute('href', `${CP}/?${MARK}&lang=uk#pix`);                // …and «Meet Pix» at his section
  await expect(page.locator('.pix-meet .pix-hi')).toHaveText('Привіт! Я Pix.');                                 // the mascot says hi in the visitor's language
  await expect(page.locator('.tl-i.pix h3')).toHaveText('Народився Pix');                                       // the day he was invented, in the story
  await page.goto('./');                                                                              // remembered
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.locator('.stats li').nth(2)).toHaveText(new RegExp(`^${LANGS.length}\\s*мов`));      // all our languages
  await page.locator('#langBtn').click();                                                             // the list: find by the name in the page's language…
  await page.locator('#langFind').fill('німецька');
  await expect(page.locator('#langMenu button:visible')).toHaveCount(1);
  await expect(page.locator('#langMenu button:visible')).toHaveAttribute('data-lang', 'de');
  await page.locator('#langFind').fill('japanese');                                                   // …in English…
  await expect(page.locator('#langMenu button:visible')).toHaveAttribute('data-lang', 'ja');
  await page.locator('#langFind').fill('');
  await expect(page.locator('#langMenu button[data-lang="de"] small')).toHaveText('німецька');        // each language says what it is, in the page's language
  expect(w.errs).toEqual([]);
  expect([...w.ext]).toEqual([]);
  await ctx.close();
});

// no Russian, anywhere (owner 13–14.10.2026): not a language of ours; every language list ends with the row of Russia — the flag
// stained with blood, «Россия, останови войну в Украине» and, under it, the same in the visitor's language; not chosen, not a link
test('no Russian: a Russian device gets English, and every list ends with «Россия, останови войну в Украине» — not a language', async ({ browser, request }) => {
  const ctx = await browser.newContext({ locale: 'ru-RU' });
  const page = await ctx.newPage(), w = watch(page);
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto('./?lang=ru');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect((await request.get('./lang/ru.json')).status()).toBe(404);
  expect(await page.locator('link[hreflang="ru"]').count()).toBe(0);
  for (const [path, L, own] of [['./?lang=uk', 'uk', 'Росіє, припини війну в Україні'], ['./brand/?lang=en', 'en', 'Russia, stop the war in Ukraine']]) {
    await page.goto(path);
    await page.locator('#langBtn').click();
    await expect(page.locator('#langMenu button[data-lang="ru"]')).toHaveCount(0);
    const stop = page.locator('#langStop');
    await expect(stop).toBeVisible();
    await expect(stop.locator('b')).toHaveText(STOP_RU);
    await expect(stop.locator('small')).toHaveText(own);
    await expect(stop.locator('img')).toHaveAttribute('src', '/assets/flags/ru-stained.svg');
    expect(await stop.evaluate((e) => !!e.closest('[role="listbox"]') || !!e.querySelector('a,button,[role="option"]'))).toBe(false);   // not a language, not a link
    const last = await page.locator('#langMenu .lang-scroll').evaluate((e) => [...e.children].filter((c) => !c.hidden).pop().id);
    expect(last, path).toBe('langStop');                                                              // the very end of the list
    await stop.click(); await expect(page.locator('html')).toHaveAttribute('lang', L);               // a tap changes nothing
  }
  expect(w.errs).toEqual([]);
  expect([...w.ext]).toEqual([]);
  await ctx.close();
});

// right to left (ar, he, fa, ur, ps): the page mirrors, the Lewydo mark and the games' pictures keep their sides
test('right to left: Arabic and Hebrew mirror the page and keep the mark, the paintings and the phone as they are', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const w = watch(page);
  for (const L of ['ar', 'he']) {
    await page.goto(`./?lang=${L}`);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', L);
    const lb = await page.locator('#langBtn').boundingBox(), home = await page.locator('.top .home').boundingBox();
    expect(lb.x, L).toBeLessThan(home.x);                                                            // the language button moved to the left, the mark to the right
    expect(await page.locator('.top .lw-sig').evaluate((e) => getComputedStyle(e).direction)).toBe('ltr');
    expect(await page.locator('#cpStage .thumbs').evaluate((e) => getComputedStyle(e).direction)).toBe('ltr');
    await expect(page.locator('html')).toHaveAttribute('data-words', L);
    if (L === 'ar') expect(await page.locator('.eyebrow').first().evaluate((e) => getComputedStyle(e).letterSpacing)).toBe('normal');   // Arabic letters stay joined
  }
  await page.goto('./?lang=en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  expect(w.errs).toEqual([]);
});

test('every language fills every text, and nothing scrolls sideways on a small phone', async ({ page }) => {
  test.setTimeout(600_000);
  await page.setViewportSize({ width: 320, height: 700 });
  for (const L of LANGS) {
    await page.goto(`./?lang=${L}`);
    await expect(page.locator('html')).toHaveAttribute('lang', L);
    await expect(page.locator('html')).toHaveAttribute('dir', RTL.includes(L) ? 'rtl' : 'ltr');
    await expect(page.locator('html')).toHaveAttribute('data-words', L);                             // its words arrived (lang/<id>.json)
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

test('both games show themselves right on the page: CubePix plays, Orbit Dash is the game itself', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const w = watch(page);
  await page.goto('./?lang=en');
  await page.locator('#cubepix').scrollIntoViewIfNeeded();
  await expect(page.locator('#cpLayer')).toHaveText(/LAYER \d+ \/ \d+/i);                              // a painting reveals itself
  const cur = () => page.locator('#cpThumbs .thumb[aria-current="true"]').getAttribute('data-i');
  await expect(page.locator('#cpThumbs .thumb')).toHaveCount(4);                                      // the paintings themselves, not little squares
  await expect.poll(cur).toBe('0');
  await page.locator('#cpNext').click(); await expect.poll(cur).toBe('1');                               // big arrows on the frame
  await page.locator('#cpPrev').click(); await page.locator('#cpPrev').click(); await expect.poll(cur).toBe('3');
  await page.locator('#cpThumbs .thumb').nth(2).click(); await expect.poll(cur).toBe('2');               // a tap on a picture
  let m = null;                                                                                       // a swipe across the painting —
  for (let i = 0, b; i < 40; i++) {                                                                   // once the page stopped scrolling
    b = await page.locator('#cpStage .mat').boundingBox(); if (m && b && b.x === m.x && b.y === m.y) break; m = b; await page.waitForTimeout(50); }
  await page.mouse.move(m.x + m.width * .8, m.y + m.height / 2); await page.mouse.down();
  await page.mouse.move(m.x + m.width * .2, m.y + m.height / 2, { steps: 8 }); await page.mouse.up();
  await expect.poll(cur).toBe('3');
  await page.locator('#cpTry').click();                                                                // CubePix: the little puzzle
  await expect(page.locator('#pzHint')).toBeVisible();
  for (let i = 0; i < 300 && !(await page.locator('#pzDone').isVisible()); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(10); }
  await expect(page.locator('#pzDone')).toBeVisible();
  await expect(page.locator('#cpName')).toHaveText('Strawberry');
  await expect(page.locator('#pzFact')).not.toBeEmpty();
  await page.locator('#cpBack').click();
  await expect(page.locator('#cpTry')).toBeVisible();
  const L = JSON.parse(readFileSync(new URL('../src/orbitdash.json', import.meta.url), 'utf8')).levels;
  await page.locator('#orbitdash').scrollIntoViewIfNeeded();                                        // the game loads when you get to it
  const pills = page.locator('.od-pill');
  await expect(pills).toHaveCount(L.length + 1);                                                   // «All levels» + every level
  await expect(page.locator('#odScreen iframe')).toHaveAttribute('src', `${OD}/play/embed.html?lang=en`);   // the game's own origin; the page's language
  await expect(page.locator('#odScreen iframe')).toHaveAttribute('allow', 'autoplay; web-share; clipboard-write');   // the game's SHARE button inside the frame
  await expect(page.locator('#odScreen')).toHaveClass(/\bready\b/, { timeout: 30_000 });
  const game = () => page.frame({ url: /embed\.html/ });
  const level = () => REAL_OD ? game().evaluate(() => { const i = window.__orbitDev.current.beatInfo(); return i && i.id; })
    : game().evaluate(() => { const l = got.filter((m) => m.od === 'level').pop(); return l ? l.id : undefined; });
  const tap = () => game().evaluate((real) => real ? (document.querySelector('#odx .tap span') || {}).textContent
    : (got.filter((m) => m.od === 'labels').pop() || {}).tap, REAL_OD).catch(() => null);
  await expect.poll(tap, { timeout: 15_000 }).toBe('TAP TO PLAY');                                  // the words in the frame — the page's language
  await pills.nth(3).click();                                                                      // a pill → that level in the game
  await expect(pills.nth(3)).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(level, { timeout: 15_000 }).toBe(L[2].id);
  await page.locator('#odNext').click();                                                           // the arrows walk through the levels too
  await expect(pills.nth(4)).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(level, { timeout: 15_000 }).toBe(L[3].id);
  // [HALLOWEEN-LEVEL] the holiday levels (02.11.2026): pills with 🎃, and a card — the game's word, three covers that play that level, where
  const hol = L.filter((l) => l.col === 'halloween');
  expect(hol.map((l) => l.id)).toEqual(['blood-moon', 'midnight-parade', 'witchs-brew']);
  await expect(pills.filter({ hasText: '🎃' })).toHaveCount(hol.length);
  const holBtn = page.locator('.od-hol [data-od-level]');
  await expect(holBtn).toHaveCount(hol.length);
  await expect(page.locator('.od-hol [data-t="od.hol"]')).toHaveText('HALLOWEEN');
  await expect(page.locator('.od-hol [data-t="od.holWhere"]')).toHaveText('In the browser and on Android');
  await holBtn.nth(2).click();                                                                     // a cover → that level in the phone
  await expect(holBtn.nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(level, { timeout: 15_000 }).toBe(hol[2].id);
  await pills.nth(0).click();                                                                      // «All levels» — the trailer again
  await expect(pills.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.od a.btn-cyan')).toHaveAttribute('href', `${OD}/play/?${MARK}&lang=en`);   // the whole game in the browser comes first, as with CubePix
  await expect(page.locator('.od .ctas a[href*="com.lewydo.orbitdash"]')).toHaveCount(1);          // Google Play right after it
  const as = page.locator('.od .ctas a.od-as');                                                    // …and the App Store next to it (since 10.11.2026)
  await expect(as).toHaveAttribute('href', 'https://apps.apple.com/app/id6824944395');              // bare: no ct/pt without the provider token
  await expect(as).toHaveText('Download on the App Store');
  expect(await page.locator('.od .ctas a').evaluateAll((a) => a.map((e) => e.getAttribute('href').includes('apps.apple.com')))).toEqual([false, false, true, false]);
  expect(w.errs).toEqual([]);
});

// owner 10.11.2026 (the studio rule docs/ux/store-badges.md): «quality buttons that tell at a glance which is the App Store and which is Google Play» —
// the stores' official marks and names, two lines (the small one translated), a pair of one width and height (≥ 48), Google Play → App Store,
// on iPhone / iPad the App Store first, a column on a phone, 320 px without sideways scroll; the story's store links — the same buttons
test('the store buttons: official marks, «GET IT ON Google Play» / «Download on the App Store», one size, ordered by the device, a column on a phone', async ({ browser }) => {
  const UA = { iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1',
    ipad: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Safari/605.1.15',
    android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36' };
  const html = disk('index.html');
  const pair = html.match(/<div class="stores">(<a class="btn od-line[\s\S]*?)<\/div>/);   // Orbit Dash's pair (CubePix's world has its own, below)
  // CubePix's world (10.11.2026): the same official marks in its pixel frame; its App Store badge only once src/games.json → cubepix.appStore is set
  const cpPair = html.match(/<div class="stores">(<a class="btn store cp-store[\s\S]*?)<\/div>/);
  expect(cpPair, 'CubePix has its pair').not.toBeNull();
  expect(cpPair[1]).toContain('<path fill="#00d7fe" d="M1.2.6C');
  expect(cpPair[1].includes('cp-as')).toBe(!!JSON.parse(readFileSync('src/games.json', 'utf8')).cubepix.appStore);
  expect(pair, 'the built page has the pair').not.toBeNull();
  expect(pair[1].indexOf('od-gp')).toBeLessThan(pair[1].indexOf('od-as'));                                      // without JS: Google Play, then the App Store
  expect(pair[1]).toContain('<path fill="#fff" d="M12.152 6.896c');                                               // Apple's apple, white
  expect(pair[1]).toContain('<path fill="#00d7fe" d="M1.2.6C');                                                  // Google Play's four-colour triangle
  expect(html).not.toContain('<rect x="5" y="1" width="14" height="22"');                                       // the old made-up phone glyph is gone
  const boxes = (page, sel) => page.locator(sel).evaluateAll((a) => a.map((e) => { const r = e.getBoundingClientRect();
    return { cls: e.className, x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, over: e.scrollWidth > e.clientWidth + 1, text: e.textContent.replace(/\s+/g, ' ').trim() }; }));
  for (const [who, ua, width, touch, os] of [['desktop', null, 1440, false, 'desktop'], ['iPhone', UA.iphone, 390, true, 'ios'], ['iPad', UA.ipad, 820, true, 'ios'],
    ['Android', UA.android, 390, true, 'android'], ['Android 320', UA.android, 320, true, 'android']]) {
    for (const lang of who === 'Android 320' ? ['uk', 'de', 'ar', 'ta'] : ['en']) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, ...(ua ? { userAgent: ua } : {}), hasTouch: touch, isMobile: touch && width < 600 });
      if (who === 'iPad') await ctx.addInitScript(() => Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 }));
      const page = await ctx.newPage(), w = watch(page), tag = `${who} ${lang}`;
      await page.goto(`./?lang=${lang}`);
      await expect(page.locator('html')).toHaveAttribute('data-words', lang);
      await expect(page.locator('html')).toHaveAttribute('data-os', os);
      const b = await boxes(page, '#orbitdash .stores a');
      expect(b.length, tag).toBe(2);
      const [gp, as] = [b.find((x) => /od-gp/.test(x.cls)), b.find((x) => /od-as/.test(x.cls))];
      if (lang === 'en') { expect(gp.text, tag).toBe('Get it on Google Play'); expect(as.text, tag).toBe('Download on the App Store'); }   // on screen «GET IT ON» (CSS caps)
      expect(Math.abs(gp.w - as.w), tag).toBeLessThan(1); expect(Math.abs(gp.h - as.h), tag).toBeLessThan(1); expect(gp.h, tag).toBeGreaterThanOrEqual(48);
      const first = os === 'ios' ? as : gp, second = os === 'ios' ? gp : as;
      if (width >= 600) { expect(Math.abs(first.y - second.y), tag).toBeLessThan(1); expect(second.x, tag).toBeGreaterThan(first.x); }   // one row (en, ltr)
      else {
        expect(second.y, tag).toBeGreaterThanOrEqual(first.y + first.h - 1);                                     // a column, the device's store on top
        const play = (await boxes(page, '#orbitdash .ctas .btn-cyan'))[0];
        expect(gp.w, tag).toBeGreaterThanOrEqual(play.w - 1);                                                     // never smaller than «Play in your browser»
      }
      expect(b.every((x) => !x.over && x.x >= 0 && x.r <= width + .5), tag).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), tag).toBe(true);
      expect(w.errs, tag).toEqual([]);
      await ctx.close();
    }
  }
  // the story's store links: the same official buttons (the App Store on «our first game on iPhone», Google Play on «Orbit Dash goes online»)
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('./?lang=en#first-ios');
  await expect(page.locator('html')).toHaveAttribute('data-words', 'en');
  await expect(page.locator('#first-ios .tl-links a.tl-store')).toHaveText('Download on the App Store');
  await expect(page.locator('#first-ios .tl-links a.tl-store svg.apple')).toHaveCount(1);
  await expect(page.locator('#first-online .tl-links a.tl-store')).toHaveText('Get it on Google Play');
  await expect(page.locator('#first-online .tl-links a.tl-store')).toHaveAttribute('href', /^https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.lewydo\.orbitdash&referrer=/);
  await ctx.close();
});

// owner 29.10.2026: CubePix's Halloween on the studio site too — a card in its world while the holiday is on (the CubePix site's dates
// and words), leading to the holiday on the CubePix site; the day after it ends, the card is gone by itself
test('a CubePix holiday: its card shows only while it is on, in the visitor’s language, and leads to it on the CubePix site', async ({ page }) => {
  const w = watch(page);
  await page.clock.setFixedTime(new Date('2026-10-29T12:00:00'));
  await page.goto('./?lang=uk');
  const card = page.locator('.cp-ev[data-ev="halloween"]');
  await expect(card).toBeVisible();
  await expect(card.locator('b')).toHaveText('Хелловін у музеї!');
  await expect(card).toContainText('30 листопада');
  await expect(card.locator('.cp-ev-left')).toHaveText('ще 33 дні');
  await expect(card).toHaveAttribute('href', `${CP}/?${MARK}&lang=uk#event`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.clock.setFixedTime(new Date('2026-12-01T00:00:01'));
  await page.reload();
  await expect(card).toBeHidden();
  expect(w.errs).toEqual([]);
  expect([...w.ext]).toEqual([]);
});

// owner 29.10.2026: Orbit Dash's Halloween too (29.10–30.11, the window its site builds in from the game) — a card in its world while the
// season is on, in the visitor's language, leading to the whole game in the browser where Halloween already is; gone by itself on 1.12
test('an Orbit Dash holiday: its card shows only while it is on, in the visitor’s language, and leads to the game in the browser', async ({ page }) => {
  const w = watch(page);
  await page.clock.setFixedTime(new Date('2026-10-29T12:00:00'));
  await page.goto('./?lang=uk');
  const card = page.locator('.od-ev[data-ev="halloween"]');
  await expect(card).toBeVisible();
  await expect(card.locator('b')).toHaveText('Хелловін на орбіті!');
  await expect(card).toContainText('30 листопада');
  await expect(card).toContainText('WISP');
  await expect(card.locator('.od-ev-left')).toHaveText('ще 33 дні');
  await expect(card.locator('em')).toContainText('Грати в браузері');
  await expect(card).toHaveAttribute('href', `${OD}/play/?${MARK}&lang=uk`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.goto('./?lang=en');
  await expect(card.locator('em')).toHaveText('33 days left · Play in your browser →');
  await expect(card).toHaveAttribute('href', `${OD}/play/?${MARK}&lang=en`);                    // English too: the game's site can't read our choice
  await page.clock.setFixedTime(new Date('2026-11-30T23:00:00'));                                  // the last evening — still on
  await page.reload();
  await expect(card.locator('.od-ev-left')).toHaveText('1 day left');
  await page.clock.setFixedTime(new Date('2026-12-01T00:00:01'));
  await page.reload();
  await expect(card).toBeHidden();
  expect(w.errs).toEqual([]);
  expect([...w.ext]).toEqual([]);
});

// [HALLOWEEN] owner 31.10.2026 («треба ж і сайт студії зробити в хеловінській тематиці»): the studio page dresses up while Orbit Dash's Halloween
// is on (its window, src/orbitdash.json → events.halloween, the visitor's own date; src/halloween.css, src/halloween.js): a night sky, cobwebs,
// pumpkins and candles, one festive line → the worlds. The Lewydo sign is never touched; the decor takes no tap and is hidden from readers;
// ?halloween=0 / 1 and ?today= switch it; on December 1 it is gone by itself. Remove with the rest of [HALLOWEEN] in December.
test('Halloween on the studio page: only in season, one festive line in the visitor’s language, decor that takes no tap, the sign untouched', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage(), w = watch(page), html = page.locator('html'), pill = page.locator('.hero .hw-pill');
  const decor = () => page.locator('.hw').count();
  // the Lewydo sign — the hero's Lockup, the header's signature, the footer's pill, the contact card's heart: its markup and its look
  const sign = async () => { await expect(page.locator('#top')).toHaveClass(/\blit\b/, { timeout: 8000 }); await page.waitForTimeout(1000);   // the one beat is over
    return page.evaluate(() => [...document.querySelectorAll('#lock .lw-lockup, .top .home, .foot .lw-pill, .contact-mark')].map((e) => [e.outerHTML.replace(/ lw-beating/g, ''),
      ...[e, ...e.querySelectorAll('*')].map((x) => { const s = getComputedStyle(x); return [s.filter, s.transform, s.mixBlendMode, s.opacity, getComputedStyle(x, '::before').content, getComputedStyle(x, '::after').content].join(' | '); })])); };
  await page.clock.setFixedTime(new Date('2026-10-31T12:00:00'));
  await page.goto('./?lang=uk');
  await expect(html).toHaveClass(/\bhalloween\b/);
  await expect(pill).toBeVisible();
  await expect(pill).toHaveText('Щасливого Хелловіну! Наші ігри до 30 листопада в костюмах');
  await expect(pill).toHaveAttribute('href', '#worlds');
  for (const k of ['.hw-sky', '.hw-hmoon', '.top .hw-web', '#top .hw-ground', '#top .ctas .hw-flank', '.contact-card .hw-porch', '.foot .hw-hang']) expect(await page.locator(k).count(), k).toBeGreaterThan(0);
  const bad = await page.evaluate(() => [...document.querySelectorAll('.hw')].filter((e) => e.getAttribute('aria-hidden') !== 'true' || getComputedStyle(e).pointerEvents !== 'none').map((e) => e.className.baseVal ?? e.className));
  expect(bad).toEqual([]);                                                                         // hidden from readers, takes no tap
  expect(await page.locator('#lock .hw, .top .home .hw, .foot .lw-pill .hw, .contact-mark .hw').count()).toBe(0);   // nothing on the sign
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const inSeason = await sign();
  for (const L of ['ar', 'he']) {                                                                  // right to left: no sideways scroll either
    await page.goto(`./?lang=${L}`); await expect(html).toHaveAttribute('data-words', L);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), L).toBeLessThanOrEqual(390);
  }
  await page.goto('./?lang=uk&halloween=0');                                                      // the switches
  await expect(html).not.toHaveClass(/\bhalloween\b/); await expect(pill).toBeHidden(); expect(await decor()).toBe(0);
  await page.goto('./?lang=uk&today=2026-12-01');
  await expect(html).not.toHaveClass(/\bhalloween\b/);
  await page.goto('./?og');                                                                       // never on the brand pictures (npm run kit)
  await expect(html).not.toHaveClass(/\bhalloween\b/);
  await page.clock.setFixedTime(new Date('2026-11-30T23:00:00'));                                  // the last evening — still on
  await page.goto('./?lang=uk');
  await expect(html).toHaveClass(/\bhalloween\b/);
  await page.clock.setFixedTime(new Date('2026-12-01T00:00:01'));                                  // December 1 — gone by itself
  await page.reload();
  await expect(html).not.toHaveClass(/\bhalloween\b/); await expect(pill).toBeHidden(); expect(await decor()).toBe(0);
  expect(await sign()).toEqual(inSeason);                                                          // the sign is the same in season and out of it
  await page.goto('./?lang=uk&halloween=1');
  await expect(html).toHaveClass(/\bhalloween\b/); expect(await decor()).toBeGreaterThan(0);
  // a wide screen: the moon, the cobwebs and the pumpkins keep off the hero's words, buttons, the heart and the language button
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.setFixedTime(new Date('2026-10-31T12:00:00'));
  await page.goto('./?lang=de');
  await expect(page.locator('#top')).toHaveClass(/\bs3\b/, { timeout: 8000 }); await page.waitForTimeout(800);
  const hits = await page.evaluate(() => { const box = (e) => e.getBoundingClientRect(), hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    const content = [...document.querySelectorAll('.hero .hw-pill, .hero .eyebrow, #lock, .hero-lead, .hero .ctas .btn, .hero .hint, #langBtn, .top .home, .nav')];
    const deco = [...document.querySelectorAll('.hw-sky .hw-moon, .hw-flank .hw-side, .hw-web')].filter((d) => getComputedStyle(d).display !== 'none' && box(d).width);
    return deco.flatMap((d) => content.filter((c) => hit(box(d), box(c))).map((c) => `${d.className.baseVal ?? d.className} × ${c.id || c.className}`)); });
  expect(hits).toEqual([]);
  expect(w.errs).toEqual([]);
  expect([...w.ext]).toEqual([]);
  await ctx.close();
  // less motion: everything stands still — no decor animation runs, nothing flies
  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p2 = await rm.newPage();
  await p2.clock.setFixedTime(new Date('2026-10-31T12:00:00'));
  await p2.goto('./?lang=en');
  await expect(p2.locator('html')).toHaveClass(/\bhalloween\b/);
  await expect(p2.locator('.hero .hw-pill')).toHaveText('Happy Halloween! Our games are in costume until November 30');
  expect(await p2.locator('.hw').count()).toBeGreaterThan(0);
  await expect(p2.locator('.hw-witch')).toBeHidden();
  const running = await p2.evaluate(() => document.getAnimations().filter((a) => { const t = a.effect && a.effect.target; return t && t.closest && t.closest('.hw') && a.playState !== 'paused'; })
    .map((a) => a.animationName || a.transitionProperty || 'animation'));
  expect(running).toEqual([]);
  await rm.close();
});

// [HALLOWEEN] the festive line stays a pill on the narrowest phones (two lines at most, in every language — three made it a slab that pushed
// the word Lewydo under the music bubble on a 320×568 phone), and on a short screen the sign stands exactly where it does out of season
test('Halloween’s festive line: two lines at most in all our languages at 320 and 390 px, and the word Lewydo stays put on a short phone', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const page = await ctx.newPage(), w = watch(page), html = page.locator('html');
  await page.clock.setFixedTime(new Date('2026-10-31T12:00:00'));
  const name = async (q) => { await page.goto('./?' + q); await expect(page.locator('#top')).toHaveClass(/\bs3\b/, { timeout: 8000 }); await page.waitForTimeout(700);
    return page.evaluate(() => { const r = document.querySelector('#lock .lw-name').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; }); };
  for (const L of ['uk', 'en', 'hy', 'mn']) {                                                       // a short phone: the pill comes after the sign
    const off = await name(`lang=${L}&halloween=0`), on = await name(`lang=${L}`);
    await expect(html).toHaveClass(/\bhalloween\b/);
    expect(Math.abs(on[0] - off[0]), `${L}: the word Lewydo ${off} → ${on}`).toBeLessThanOrEqual(4);
    expect(on[1], L).toBeLessThan(568);
  }
  const lines = () => page.evaluate(() => { const s = document.querySelector('.hero .hw-pill span');
    return [Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight)), document.documentElement.scrollWidth]; });
  const bad = [];
  for (const vw of [320, 390]) {                                                                    // a tall phone: the pill above the eyebrow
    await page.setViewportSize({ width: vw, height: 844 });
    await page.goto('./?lang=en'); await expect(html).toHaveClass(/\bhalloween\b/);
    for (const L of LANGS) {
      if (await html.getAttribute('data-words') !== L) { await page.locator('#langBtn').click(); await page.locator(`#langMenu button[data-lang="${L}"]`).click(); }
      await expect(html).toHaveAttribute('data-words', L);
      const [n, sw] = await lines();
      if (n > 2 || sw > vw) bad.push(`${vw} ${L}: ${n} lines, page ${sw} px wide`);
    }
  }
  expect(bad).toEqual([]);
  expect(w.errs).toEqual([]);
  expect([...w.ext]).toEqual([]);
  await ctx.close();
});

test('the pages around it: 404, robots, sitemap, app-ads.txt for AdMob', async ({ page, request }) => {
  const r404 = await request.get('./no-such-room');
  expect(r404.status()).toBe(404);
  await page.goto('./no-such-room');
  await expect(page.locator('.lw-lockup')).toBeVisible();
  await expect(page.locator('a[href="/"]')).toBeVisible();
  expect(await (await request.get('./app-ads.txt')).text()).toContain('pub-4052300465234748');        // AdMob reads it: never lose it
  expect(await (await request.get('./app-ads.txt')).text()).toContain('unity.com, 157539800, DIRECT, 96cabb5fbdde37a7');  // Unity Ads (mediation via AdMob)
  expect(await (await request.get('./googlea91a80ac974455de.html')).text()).toContain('google-site-verification');  // Search Console → Play Console: never lose it
  expect(await (await request.get('./')).text()).toContain('FbnCfBUOkfR84lwfaDQwOJiyQXAwnK5tVhmtCYK-Seo');               // the backup: meta tag on the home page
  expect(await (await request.get('./robots.txt')).text()).toContain('sitemap.xml');
  const map = [...(await (await request.get('./sitemap.xml')).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(map).toEqual(['https://lewydo.com/', 'https://lewydo.com/brand/']);                       // this host only: the games' pages are in their own sites' maps
  expect(await (await request.get('./robots.txt')).text()).toContain('Sitemap: https://lewydo.com/sitemap.xml');
  expect(await (await request.get('./CNAME')).text()).toBe('lewydo.com\n');                        // the domain: GitHub Pages reads it from the branch
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
  expect(Object.keys(B.about.texts)).toEqual(LANGS);                                                 // every language of ours, in the list's order
  for (const [L, A] of Object.entries(B.about.texts)) { expect(A.thanks, L).toBeTruthy(); expect(A.text, L).not.toContain(A.thanks); }
  expect(B.about.layout.thanks.rule).toMatch(/own last line/);
  for (const u of [...Object.values(B.images).flatMap((i) => [i.png, i.webp]), B.atlas.atlas, B.atlas.png, ...Object.values(B.code).map((c) => c.url)])
    expect((await request.get(u.replace('https://lewydo.com/', './'))).status(), u).toBe(200);
  expect(B.pronunciation.ipa).toBe('/lɛv.waɪ.doʊ/');                                                 // how to say it
  expect(Object.keys(B.sound.files)).toEqual(['wav']);                                                // the Lewydo sound: one WAV, nothing else
  for (const u of Object.values(B.sound.files)) {
    const r = await request.get(u.replace('https://lewydo.com/', './'));
    expect(r.status(), u).toBe(200); const wav = await r.body();
    expect(wav.length, u).toBe(B.sound.file.bytes); expect(createHash('sha256').update(wav).digest('hex'), u).toBe(B.sound.file.sha256);
    expect(wav.subarray(0, 4).toString() + wav.subarray(8, 16).toString(), u).toBe('RIFFWAVEfmt ');
    expect([wav.readUInt16LE(20), wav.readUInt16LE(22), wav.readUInt32LE(24), wav.readUInt16LE(34)], u).toEqual([1, 2, 48000, 16]); // PCM, stereo, 48 kHz, 16-bit
  }
  for (const x of ['ogg', 'mp3']) expect((await request.get(`./brand/kit/sound/lewydo-heartbeat.${x}`)).status(), x).toBe(404);
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

test('the brand page speaks all our languages, fills every text and never scrolls sideways', async ({ page }) => {
  test.setTimeout(600_000);
  await page.setViewportSize({ width: 320, height: 700 });
  const w = watch(page);
  for (const L of LANGS) {
    await page.goto(`./brand/?lang=${L}`);
    await expect(page.locator('html')).toHaveAttribute('lang', L);
    await expect(page.locator('html')).toHaveAttribute('data-words', L);                             // its words arrived (brand/lang/<id>.json)
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
test('About us: the thank-you is one centred line under the text in every language, on the brand page and on the site', async ({ page }) => {
  test.setTimeout(300_000);
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
  await card.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));                // measured at rest: mid-entrance the transform gives 199.9999…
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
  await card.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));                 // measured after its slide-in, not mid-move
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
test('contacts: the work Telegram and Lewydo\'s own pages, first names only; the brand page and brand.json say «prototype first»', async ({ page, request }) => {
  const w = watch(page);
  await page.goto('./?lang=uk');
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
  expect(hrefs.filter((h) => h.startsWith('https://t.me/'))).toEqual(['https://t.me/vlad_libgdx', 'https://t.me/vlad_libgdx']);   // Vlad's card and the contacts
  for (const u of ['https://www.tiktok.com/@lewydo_game', 'https://www.instagram.com/lewydo_game/', 'https://www.youtube.com/channel/UCn2SbibS30OyiUPHBFhvFpw',
    'https://www.facebook.com/profile.php?id=61594804110096', 'https://discord.gg/Krkk8bAqDF', 'https://x.com/lewydo_game']) {
    await expect(page.locator(`.social a[href="${u}"]`)).toHaveCount(1);
    await expect(page.locator(`.foot-social a[href="${u}"]`)).toHaveCount(1);
  }
  await expect(page.locator('.social-h')).toHaveText('Lewydo в соцмережах');
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(ld.sameAs).toContain('https://www.tiktok.com/@lewydo_game');
  // first names only, no surnames (owner 06.10.2026)
  await expect(page.locator('[data-t="p.lilya.who"]')).toHaveText('Лілія, веб- і UX/UI-дизайнерка');
  expect(ld.founder.map((f) => f.name)).toEqual(['Vlad', 'Liliia']);
  await page.goto('./brand/?lang=uk');
  await expect(page.locator('#work h2')).toHaveText('Спершу прототип, потім гра');
  await expect(page.locator('#work .flow li')).toHaveCount(3);
  await expect(page.locator('#promptText')).toContainText('prototype first');
  const B = await (await request.get('./brand/brand.json')).json();
  expect(B.workflow.rule).toBe('Prototype first, then the game');
  expect(B.socials.telegram).toBe('https://t.me/vlad_libgdx');
  expect(B.socials.discord).toBe('https://discord.gg/Krkk8bAqDF');
  expect(B.socials.x).toBe('https://x.com/lewydo_game');
  expect(B.font.name).toMatch(/^Nunito Black 54 \/ 74/); expect(B.font.slogan).toMatch(/^Nunito 14 \/ 19/);   // round numbers
  expect(w.errs).toEqual([]);
});

test('the story: the first streamer to play our game live (22.10.2026) — our own clip, loaded only when needed; the thank-you; his links', async ({ page, request }) => {
  const w = watch(page), media = [];
  page.on('request', (r) => { if (/\/assets\/story\/(?!(?:twitch|versus|ios)\.svg)/.test(r.url())) media.push(new URL(r.url()).pathname); });   // twitch.svg, versus.svg — the dots of the 03.11 and 10.11 entries (1 KB vectors, like the other dots), not media
  await page.goto('./?lang=uk');
  const li = page.locator('#first-live');
  await expect(li.locator('h3')).toHaveText('Orbit Dash у прямому ефірі TikTok');
  await expect(li.locator('.tl-thanks p')).toHaveText('Дякую, Андрію, що ти мій перший блогер, який провів прямий ефір, граючи в мою гру. Дуже тобі дякую!');
  await expect(li.locator('.tl-thanks footer')).toHaveText('— Veldan, засновник Lewydo');
  await expect(li.locator('.tl-links a[href="https://www.tiktok.com/@malcev_ua"]')).toHaveText('@malcev_ua');
  await expect(li.locator('.tl-links a[href="https://choko.link/abbie"]')).toHaveText('choko.link/abbie');
  const v = li.locator('video');
  await expect(v).toHaveAttribute('preload', 'none'); await expect(v).toHaveAttribute('controls', '');
  expect(await v.evaluate((e) => e.autoplay || e.muted)).toBe(false);                               // never plays by itself
  await expect(v.locator('source')).toHaveAttribute('src', '/assets/story/first-live.mp4');         // our own file, no embed
  await expect(v).toHaveAttribute('aria-label', /Андрій грає в Orbit Dash/);
  expect(media).toEqual([]);                                                                         // nothing of it on the first screen
  await page.click('#tlAll');                                                                       // 31.10: the story folds after 3 — show it all
  await li.scrollIntoViewIfNeeded();
  await li.locator('.tl-tog').click();                                                              // 29.10: the story is cards — open this one
  await expect.poll(() => v.evaluate((e) => e.getAttribute('poster'))).toBe('/assets/story/first-live.jpg');
  expect(media.filter((m) => m.endsWith('.mp4'))).toEqual([]);                                       // the poster only, until it is played
  const mp4 = await request.get('./assets/story/first-live.mp4'), jpg = await request.get('./assets/story/first-live.jpg');
  expect(mp4.status()).toBe(200); expect(jpg.status()).toBe(200);
  expect((await mp4.body()).length).toBeLessThan(8 * 1024 * 1024);                                   // small enough for a phone
  await expect(v).toHaveAttribute('width', '720'); await expect(v).toHaveAttribute('height', '1280');   // the clip is vertical (9:16)
  expect(await v.evaluate((e) => { const r = e.getBoundingClientRect(); return Math.round(r.height / r.width * 100); })).toBe(178);
  expect([...w.ext]).toEqual([]);
  expect(w.errs).toEqual([]);
});

// 03.11.2026 — Vlad’s first day on Twitch (viewers 6yJ7b and morghet_vlr played Orbit Dash): Twitch’s emblem (our own SVG) is the dot on the line and the thumbnail,
// the thank-you carries the founder’s sign, two channel buttons; the nicks stay Latin (isolated in RTL); nothing scrolls sideways; no third party
test('the story: first time on Twitch (03.11.2026) — the emblem on the line, the thank-you, two channel links; nicks stay Latin; RTL; 320 px', async ({ browser, request }) => {
  const svg = await request.get('./assets/story/twitch.svg'); expect(svg.status()).toBe(200);
  const src = await svg.text(); expect(src).toContain('#9146FF'); expect(src).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);      // Twitch purple; no outside reference
  for (const [lang, width, title] of [['uk', 390, 'Вперше на Twitch'], ['en', 1440, 'First time on Twitch'], ['ar', 390, 'للمرة الأولى على Twitch'], ['uk', 320, 'Вперше на Twitch']]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await ctx.newPage(), w = watch(page), tag = `${lang} ${width}`;
    await page.goto(`./?lang=${lang}#first-twitch`);
    await expect(page.locator('html')).toHaveAttribute('data-words', lang);
    const li = page.locator('#first-twitch');
    await expect(li).toHaveClass(/\bopen\b/); await expect(li).toHaveClass(/\btwitch\b/);
    await expect(li.locator('h3')).toHaveText(title);
    await expect(li.locator('.tl-when')).toHaveText('03 · 11 · 2026');
    expect(await li.locator('.tl-pad > p').innerText(), tag).toContain('Orbit Dash');
    for (const n of ['6yJ7b', 'morghet_vlr']) { expect(await li.locator('.tl-pad > p').innerText(), tag).toContain(n); expect(await li.locator('.tl-thanks p').innerText(), tag).toContain(n); }
    await expect(li.locator('.tl-thanks footer')).toHaveText(await page.locator('#first-live .tl-thanks footer').innerText());   // the same sign as the other thank-yous
    const links = li.locator('.tl-links a');
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toHaveAttribute('href', 'https://www.twitch.tv/6yj7b'); await expect(links.nth(0)).toHaveText('6yJ7b');
    await expect(links.nth(1)).toHaveAttribute('href', 'https://www.twitch.tv/morghet_vlr'); await expect(links.nth(1)).toHaveText('morghet_vlr');
    for (let i = 0; i < 2; i++) { await expect(links.nth(i).locator('span')).toHaveAttribute('dir', 'ltr'); await expect(links.nth(i).locator('svg')).toHaveCount(1); }
    if (RTL.includes(lang)) {                                                                             // Latin nicks inside right-to-left text are isolated (LRI … PDI)
      for (const n of ['6yJ7b', 'morghet_vlr']) expect(await li.locator('.tl-thanks p').innerText(), tag).toContain(`\u2066${n}\u2069`);
    }
    // the emblem is the dot (a background of ::before, no circle) and the card’s thumbnail
    expect(await li.evaluate((e) => getComputedStyle(e, '::before').backgroundImage), tag).toContain('/assets/story/twitch.svg');
    const th = li.locator('.tl-thumb'); await expect(th).toHaveAttribute('src', '/assets/story/twitch.svg');
    await expect.poll(() => th.evaluate((e) => e.complete && e.naturalWidth > 0), tag).toBe(true);
    // the dot is 32 px and its centre is where the others’ are (37.5 px under the entry’s top — the fold’s DOT)
    const dot = await li.evaluate((e) => { const c = getComputedStyle(e, '::before'); return { w: parseFloat(c.width), h: parseFloat(c.height), top: parseFloat(c.top) }; });
    expect(dot.w, tag).toBe(32); expect(Math.abs(dot.top + dot.h / 2 - 37.5), tag).toBeLessThanOrEqual(.5);
    // …and on the line itself, across it (10.11.2026, owner: at ≥ 900 px the online dot sat 4.5 px off — the wide layout had no rule for it)
    const off = await li.evaluate((e) => { const c = getComputedStyle(e, '::before'), tl = e.closest('.tl'), l = getComputedStyle(tl, '::before');
      const dx = e.getBoundingClientRect().left + parseFloat(c.left) + parseFloat(c.marginLeft) + parseFloat(c.width) / 2;
      const lx = tl.getBoundingClientRect().left + parseFloat(l.left) + parseFloat(l.marginLeft) + parseFloat(l.width) / 2; return dx - lx; });
    expect(Math.abs(off), tag).toBeLessThanOrEqual(.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), tag).toBeLessThanOrEqual(width);
    expect([...w.ext], tag).toEqual([]);
    expect(w.errs, tag).toEqual([]);
    await ctx.close();
  }
});

// 10.11.2026 — Orbit Dash is out on the App Store: the studio's first game on iPhone (13 days after #app-store, 28.10). Our own emblem (a silver
// phone with the game's orbit and a gold «first» star; no Apple logo, no store name) is the dot and the thumbnail — on the line, centred, at 390
// and at 1440 (the wide layout needs its own rule: the online dot sat 4.5 px off there); the card glows silver, the date carries an iOS badge;
// the App Store (bare, no ct/pt) and the browser game; it stands before #first-online (the same day, earlier); RTL; 320 px; no third party
test('the story: our first game on iPhone (10.11.2026) — the emblem on the line, the iOS badge, the App Store and the browser game; RTL; 320 px', async ({ browser, request }) => {
  const svg = await request.get('./assets/story/ios.svg'); expect(svg.status()).toBe(200);
  const src = await svg.text(); expect(src).toContain('viewBox="0 0 32 32"'); expect(src).toContain('#FFD36B'); expect(src).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
  for (const [lang, width, title] of [['uk', 390, 'Наша перша гра на iPhone'], ['en', 1440, 'Our first game on iPhone'], ['uk', 1440, 'Наша перша гра на iPhone'], ['ar', 390, 'أول لعبة لنا على iPhone'], ['he', 1440, 'המשחק הראשון שלנו ל-iPhone'], ['ta', 320, 'iPhone-இல் எங்கள் முதல் கேம்'], ['uk', 320, 'Наша перша гра на iPhone']]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await ctx.newPage(), w = watch(page), tag = `${lang} ${width}`;
    await page.goto(`./?lang=${lang}#first-ios`);
    await expect(page.locator('html')).toHaveAttribute('data-words', lang);
    const li = page.locator('#first-ios');
    await expect(li).toHaveClass(/\bopen\b/); await expect(li).toHaveClass(/\biosfirst\b/);
    expect(await li.evaluate((e) => e.nextElementSibling?.id), tag).toBe('first-online');                // the same day, earlier
    await expect(li.locator('h3')).toHaveText(title);
    await expect(li.locator('.tl-when')).toHaveText('10 · 11 · 2026');
    expect(await li.locator('.tl-when').evaluate((e) => getComputedStyle(e, '::after').content), tag).toBe('"iOS"');
    const d = await li.locator('.tl-pad > p').innerText();
    for (const k of ['Orbit Dash', 'App Store', 'iPhone', 'iPad', '82', '13']) expect(d, tag).toContain(k);
    expect(d, tag).not.toMatch(/VERSUS|3\.0/);                                                           // online on iPhone comes with an update — no promises, no dates
    const links = li.locator('.tl-links a');
    await expect(links).toHaveCount(2);
    expect(await links.nth(0).getAttribute('href'), tag).toBe('https://apps.apple.com/app/id6824944395');  // bare: no ct/pt without the provider token
    expect((await links.nth(0).textContent()).trim(), tag).toBe((await page.locator('#orbitdash .ctas a.od-as').textContent()).trim());   // the world's App Store words
    expect(await links.nth(1).getAttribute('href'), tag).toMatch(new RegExp(`/play/\\?utm_source=lewydo&utm_medium=studio_site.*lang=${lang}`));
    expect((await links.nth(1).textContent()).trim(), tag).toBe((await page.locator('#orbitdash .ctas .btn-cyan').textContent()).trim());
    // the emblem is the dot (32 px, centred like the others) and the thumbnail
    expect(await li.evaluate((e) => getComputedStyle(e, '::before').backgroundImage), tag).toContain('/assets/story/ios.svg');
    const th = li.locator('.tl-thumb'); await expect(th).toHaveAttribute('src', '/assets/story/ios.svg');
    await expect.poll(() => th.evaluate((e) => e.complete && e.naturalWidth > 0), tag).toBe(true);
    const dot = await li.evaluate((e) => { const c = getComputedStyle(e, '::before'); return { w: parseFloat(c.width), h: parseFloat(c.height), top: parseFloat(c.top) }; });
    expect(dot.w, tag).toBe(32); expect(Math.abs(dot.top + dot.h / 2 - 37.5), tag).toBeLessThanOrEqual(.5);
    // …and on the line itself, across it — measured on screen, so RTL and either side at ≥ 900 px count too
    const off = await li.evaluate((e) => { const c = getComputedStyle(e, '::before'), tl = e.closest('.tl'), l = getComputedStyle(tl, '::before');
      const r = e.getBoundingClientRect(), lr = tl.getBoundingClientRect();
      const dx = (c.left !== 'auto' ? r.left + parseFloat(c.left) : r.right - parseFloat(c.right) - parseFloat(c.width)) + parseFloat(c.marginLeft) + parseFloat(c.width) / 2;
      const lx = (l.left !== 'auto' ? lr.left + parseFloat(l.left) : lr.right - parseFloat(l.right) - parseFloat(l.width)) + parseFloat(l.marginLeft) + parseFloat(l.width) / 2; return dx - lx; });
    expect(Math.abs(off), tag).toBeLessThanOrEqual(.5);
    expect(await li.locator('.tl-card').evaluate((e) => getComputedStyle(e).boxShadow), tag).toContain('214, 228, 255');   // the open card's silver edge
    for (const el of await li.locator('.tl-head, .tl-pad > p, .tl-links a').all()) {                      // nothing spills out of the card
      const [r, c] = await Promise.all([el.boundingBox(), li.locator('.tl-card').boundingBox()]);
      expect(r.x >= c.x - 1 && r.x + r.width <= c.x + c.width + 1, tag).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth), tag).toBeLessThanOrEqual(width);
    expect([...w.ext], tag).toEqual([]);
    expect(w.errs, tag).toEqual([]);
    await ctx.close();
  }
});

// 10.11.2026 — a milestone: Orbit Dash 3.0, the studio's first game with an online mode (VERSUS LIVE). Our own emblem (two linked orbits and a live
// signal) is the dot and the thumbnail; the card glows cyan, the date carries an ONLINE badge; Google Play and the browser game, marked and in the page's language;
// nothing on Apple (no iPhone version yet); the nick stays Latin (isolated in RTL); nothing scrolls sideways; no third party
test('the story: Orbit Dash goes online (10.11.2026) — the milestone emblem, the glowing card, Google Play and the browser game; RTL; 320 px', async ({ browser, request }) => {
  const svg = await request.get('./assets/story/versus.svg'); expect(svg.status()).toBe(200);
  const src = await svg.text(); expect(src).toContain('#00E5FF'); expect(src).toContain('#FF4FD8'); expect(src).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
  for (const [lang, width, title] of [['uk', 390, 'Orbit Dash виходить в онлайн'], ['en', 1440, 'Orbit Dash goes online'], ['ar', 390, 'Orbit Dash يدخل عالم الأونلاين'], ['ta', 320, 'Orbit Dash இப்போது ஆன்லைனில்'], ['uk', 320, 'Orbit Dash виходить в онлайн']]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await ctx.newPage(), w = watch(page), tag = `${lang} ${width}`;
    await page.goto(`./?lang=${lang}#first-online`);
    await expect(page.locator('html')).toHaveAttribute('data-words', lang);
    const li = page.locator('#first-online');
    await expect(li).toHaveClass(/\bopen\b/); await expect(li).toHaveClass(/\bversus\b/);
    await expect(li.locator('h3')).toHaveText(title);
    await expect(li.locator('.tl-when')).toHaveText('10 · 11 · 2026');
    expect(await li.locator('.tl-when').evaluate((e) => getComputedStyle(e, '::after').content), tag).toBe('"ONLINE"');
    const d = await li.locator('.tl-pad > p').innerText();
    for (const k of ['Orbit Dash 3.0', 'VERSUS LIVE', 'Google Play', '6yJ7b']) expect(d, tag).toContain(k);
    expect(d, tag).not.toMatch(/App Store|iPhone|iOS/);                                                   // no iPhone version yet — never promised
    if (RTL.includes(lang)) expect(d, tag).toContain('\u20666yJ7b\u2069');
    const links = li.locator('.tl-links a');
    await expect(links).toHaveCount(2);
    expect(await links.nth(0).getAttribute('href'), tag).toMatch(/^https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.lewydo\.orbitdash.*utm_source%3Dlewydo/);
    expect(await links.nth(1).getAttribute('href'), tag).toMatch(new RegExp(`/play/\\?utm_source=lewydo&utm_medium=studio_site.*lang=${lang}`));
    expect((await links.nth(1).textContent()).trim(), tag).toBe((await page.locator('#orbitdash .ctas .btn-cyan').textContent()).trim());   // «Play in browser» — the same words as the world's button
    // the emblem is the dot (32 px, centred like the others) and the thumbnail; the card has the only glowing edge on the line
    expect(await li.evaluate((e) => getComputedStyle(e, '::before').backgroundImage), tag).toContain('/assets/story/versus.svg');
    const th = li.locator('.tl-thumb'); await expect(th).toHaveAttribute('src', '/assets/story/versus.svg');
    await expect.poll(() => th.evaluate((e) => e.complete && e.naturalWidth > 0), tag).toBe(true);
    const dot = await li.evaluate((e) => { const c = getComputedStyle(e, '::before'); return { w: parseFloat(c.width), h: parseFloat(c.height), top: parseFloat(c.top) }; });
    expect(dot.w, tag).toBe(32); expect(Math.abs(dot.top + dot.h / 2 - 37.5), tag).toBeLessThanOrEqual(.5);
    // …and on the line itself, across it (10.11.2026, owner: at ≥ 900 px the online dot sat 4.5 px off — the wide layout had no rule for it)
    const off = await li.evaluate((e) => { const c = getComputedStyle(e, '::before'), tl = e.closest('.tl'), l = getComputedStyle(tl, '::before');
      const dx = e.getBoundingClientRect().left + parseFloat(c.left) + parseFloat(c.marginLeft) + parseFloat(c.width) / 2;
      const lx = tl.getBoundingClientRect().left + parseFloat(l.left) + parseFloat(l.marginLeft) + parseFloat(l.width) / 2; return dx - lx; });
    expect(Math.abs(off), tag).toBeLessThanOrEqual(.5);
    expect(await li.locator('.tl-card').evaluate((e) => getComputedStyle(e).boxShadow), tag).toContain('0, 229, 255');
    for (const el of await li.locator('.tl-head, .tl-pad > p, .tl-links a').all()) {                      // nothing spills out of the card
      const [r, c] = await Promise.all([el.boundingBox(), li.locator('.tl-card').boundingBox()]);
      expect(r.x >= c.x - 1 && r.x + r.width <= c.x + c.width + 1, tag).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth), tag).toBeLessThanOrEqual(width);
    expect([...w.ext], tag).toEqual([]);
    expect(w.errs, tag).toEqual([]);
    await ctx.close();
  }
});

// 31.10.2026 (owner): «спочатку перші 3 частини, а потім по 1… або одразу все» — the story folds, and still scales as it grows
test('the story folds: the first 3, then one more at a time (under the finger) or all of it; collapse; links open their entry; RTL; 320 px; reduced motion', async ({ browser }) => {
  test.setTimeout(240_000);
  const LINKS = ['languages-82', 'first-live', 'web', 'first-sale', 'app-store', 'first-fan', 'first-twitch', 'first-ios', 'first-online'];
  const vis = (page) => page.evaluate(() => [...document.querySelectorAll('#tl .tl-i')].filter((l) => !l.hidden).length);
  const focused = (page, i) => page.evaluate((i) => document.activeElement === document.querySelectorAll('#tl .tl-i')[i].querySelector('.tl-tog'), i);
  // the reveal's own animations (scripted; CSS transitions such as a dot lighting up don't count)
  const moving = (page) => page.evaluate(() => document.getAnimations().filter((a) => !(a instanceof CSSTransition) && !(a instanceof CSSAnimation) && a.playState === 'running' && a.effect?.target?.closest?.('#story')).length);
  for (const [width, height, rm] of [[390, 844], [1440, 900], [390, 844, 'reduce']]) {
    const tag = `${width}${rm ? ' reduce' : ''}`;
    const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: rm || 'no-preference' });
    const page = await ctx.newPage(), w = watch(page);
    await page.goto('./?lang=uk');
    await expect(page.locator('html')).toHaveAttribute('data-words', 'uk');
    const items = page.locator('#tl .tl-i'), N = await items.count(), one = page.locator('#tlOne'), all = page.locator('#tlAll');
    expect(N, tag).toBeGreaterThanOrEqual(16);
    // folded: the first 3 entries, the rest in the HTML (search engines) but hidden; the slot shows the next one's title
    expect(await vis(page), tag).toBe(3);
    expect(await page.locator('#tl .tl-i[hidden]').count(), tag).toBe(N - 3);
    await expect(all).toHaveText(`Показати всю історію · ще ${N - 3}`); await expect(all).toHaveAttribute('aria-expanded', 'false');
    await expect(one).toContainText('Показати ще одну'); await expect(one.locator('.tl-pt')).toHaveText(await items.nth(3).locator('h3').textContent());
    await expect(page.locator('#tlFold')).toBeHidden();
    // one more: exactly one appears, takes the focus, and the button stays under the finger
    await one.scrollIntoViewIfNeeded(); await page.evaluate(() => document.querySelector('#tlOne').scrollIntoView({ block: 'center', behavior: 'instant' }));
    const y0 = (await one.boundingBox()).y;
    await one.click();
    expect(await moving(page) > 0, tag).toBe(!rm);                                                      // reduced motion: nothing moves
    expect(await vis(page), tag).toBe(4);
    expect(await focused(page, 3), tag).toBe(true);
    await page.waitForTimeout(700);
    expect(Math.abs((await one.boundingBox()).y - y0), tag).toBeLessThanOrEqual(2);
    await expect(page.locator('#tlSay')).toHaveText(`ще ${N - 4}`);
    await expect(all).toHaveText(`Показати всю історію · ще ${N - 4}`);
    await expect(page.locator('#tlFold')).toBeVisible();
    await page.keyboard.press('Tab'); await expect(one).toBeFocused();                                  // one Tab back to «Show one more»
    // the whole story: every entry (the newest too), still closed cards; «Collapse the story» floats
    await all.click();
    expect(await vis(page), tag).toBe(N);
    await expect(items.last()).toBeVisible();
    await expect(all).toHaveAttribute('aria-expanded', 'true'); await expect(all).toHaveText('Згорнути історію');
    await expect(page.locator('#tlSay')).toHaveText('ще 0');                                            // words, not a bare «+12»
    expect(await page.locator('.tl-tog[aria-expanded="true"]').count(), tag).toBe(0);
    expect(await page.locator('#tlMore').evaluate((e) => getComputedStyle(e).position), tag).toBe('sticky');
    await expect(one).toBeHidden(); await expect(page.locator('#tlFold')).toBeHidden();
    // fold back
    await page.waitForTimeout(500); await all.click();
    expect(await vis(page), tag).toBe(3);
    await expect(all).toBeFocused(); await expect(page.locator('#tlSay')).toHaveText(`ще ${N - 3}`);
    // a link to an entry, on a cold load: everything up to it shows, it opens, and it stands under the header
    for (const id of LINKS) {
      await page.goto('about:blank'); await page.goto(`./?lang=uk#${id}`);
      await expect(page.locator('html')).toHaveAttribute('data-words', 'uk');
      const li = page.locator('#' + id), i = await li.evaluate((e) => [...e.parentNode.children].indexOf(e));
      await expect(li).toHaveClass(/\bopen\b/);
      expect(await vis(page), `${tag} #${id}`).toBe(i + 1);
      await expect.poll(async () => Math.abs((await li.boundingBox()).y - 72), `${tag} #${id}`).toBeLessThanOrEqual(2);   // scroll-padding-top
    }
    // and a link followed on the page itself, to an entry that is still folded: everything up to it shows, it opens, under the header.
    // Without hidden="until-found" (Safari, Firefox) — Chrome's own find-and-reveal would otherwise do half the work for the script
    await page.addInitScript(() => { for (const o of [HTMLElement.prototype, Element.prototype, Node.prototype]) delete o.onbeforematch; });
    await page.goto('about:blank'); await page.goto('./?lang=uk');
    await expect(page.locator('html')).toHaveAttribute('data-words', 'uk');
    expect(await page.evaluate(() => 'onbeforematch' in document.body), tag).toBe(false);
    expect(await vis(page), tag).toBe(3);
    expect(await page.locator('#tl .tl-i[hidden="until-found"]').count(), tag).toBe(0);
    const sale = page.locator('#first-sale'), si = await sale.evaluate((e) => [...e.parentNode.children].indexOf(e));
    await page.evaluate(() => { location.hash = 'first-sale'; });
    await expect(sale).toHaveClass(/\bopen\b/);
    expect(await vis(page), tag).toBe(si + 1);
    await expect.poll(async () => Math.abs((await sale.boundingBox()).y - 72), tag).toBeLessThanOrEqual(2);
    // tapping «Show one more» in a steady rhythm to the very end never lands on «Collapse the story»: the last card takes the slot's place
    await page.evaluate(() => document.querySelector('#tlOne').scrollIntoView({ block: 'center', behavior: 'instant' }));
    const ob = await one.boundingBox(), fx = ob.x + ob.width / 2, fy = ob.y + ob.height / 2;
    for (let k = si + 1; k < N - 1; k++) { await page.mouse.click(fx, fy); await page.waitForTimeout(500); expect(await vis(page), `${tag} tap ${k}`).toBe(k + 1); }
    await page.mouse.click(fx, fy); await page.evaluate(() => document.querySelector('#tlAll').click());   // the last one, and at once «Collapse»:
    expect(await vis(page), `${tag} guard`).toBe(N);                                                    // it waits a moment
    await page.waitForTimeout(500);
    await expect(page.locator('#tlSay')).toHaveText('ще 0');
    expect(await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('#tlMore'), [fx, fy]), tag).toBe(false);
    await page.mouse.click(fx, fy); await page.waitForTimeout(500); await page.mouse.click(fx, fy);
    expect(await vis(page), tag).toBe(N);
    expect([...w.ext], tag).toEqual([]);
    expect(w.errs, tag).toEqual([]);
    await ctx.close();
  }
  // right to left: the line, the slot and the ring mirror; the count speaks Arabic
  { const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage(), w = watch(page);
    await page.goto('./?lang=ar');
    await expect(page.locator('html')).toHaveAttribute('data-words', 'ar'); await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    expect(await vis(page)).toBe(3);
    await page.locator('#tlOne').scrollIntoViewIfNeeded();
    const ring = await page.locator('.tl-ring').boundingBox(), slot = await page.locator('#tlOne').boundingBox();
    expect(ring.x).toBeGreaterThan(slot.x + slot.width);                                                 // the line is on the right
    await page.click('#tlOne');
    expect(await vis(page)).toBe(4);
    const N = await page.locator('#tl .tl-i').count();
    await expect(page.locator('#tlSay')).toHaveText(`${N - 4} أخرى`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    expect(w.errs).toEqual([]);
    await ctx.close(); }
  // a small phone: nothing scrolls sideways — folded, after one more, all of it
  { const ctx = await browser.newContext({ viewport: { width: 320, height: 568 } });
    const page = await ctx.newPage(), w = watch(page), sw = () => page.evaluate(() => document.documentElement.scrollWidth);
    await page.goto('./?lang=uk');
    await expect(page.locator('html')).toHaveAttribute('data-words', 'uk');
    await page.locator('#tlOne').scrollIntoViewIfNeeded(); expect(await sw()).toBeLessThanOrEqual(320);
    await page.click('#tlOne'); await page.waitForTimeout(500); expect(await sw()).toBeLessThanOrEqual(320);
    await page.click('#tlAll'); expect(await sw()).toBeLessThanOrEqual(320);
    expect(w.errs).toEqual([]);
    await ctx.close(); }
});

test('the loader credits — the Lewydo standard: a fourth phone on the brand page, its numbers, brand.json and the text for Claude', async ({ page, request }) => {
  const w = watch(page);
  await page.goto('./brand/?lang=uk');
  await expect(page.locator('.phones .ph')).toHaveCount(4);                                // splash, loader, About us, menu
  const cr = page.locator('.scr-loader .ld-credits span');
  await expect(cr).toHaveText(['Powered by LibGDX', 'Developed by Lewydo™', 'Version 1.0.0']);
  const st = await page.locator('.scr-loader .ld-credits').evaluate((e) => { const c = getComputedStyle(e);
    return [c.fontFamily.split(',')[0].replace(/"/g, ''), c.fontWeight, c.fontSize, c.lineHeight, c.color, e.offsetTop, e.offsetHeight, e.offsetWidth]; });
  expect(st).toEqual(['Inter', '500', '10px', '12px', 'rgba(255, 255, 255, 0.25)', 736, 36, 360]);   // Figma: 360×36, 28 above the bottom of 800
  expect(await page.evaluate(() => document.fonts.check('500 10px Inter'))).toBe(true);    // the page's own Inter, no third party
  await expect(page.locator('.ph').nth(1).locator('h3 span')).toHaveText('Хто створив');
  await expect(page.locator('[data-t="b.num.5"]')).toContainText('Powered by LibGDX');
  await expect(page.locator('#promptText')).toContainText('Loader: on the screen right after the splash');
  const B = await (await request.get('./brand/brand.json')).json();
  expect(B.loader.credits.lines).toEqual(['Powered by LibGDX', 'Developed by Lewydo™', 'Version {versionName}']);
  expect(B.loader.credits.box).toMatchObject({ width: 360, height: 36, bottom: 28 });
  expect(B.loader.credits.opacity).toBe(0.25);
  expect(w.errs).toEqual([]);
});

// docs/process/install-source.md: every link from the studio page to a game says where it came from, or Firebase shows (direct). And since
// 06.11.2026 each game is its own origin with its own memory of the language — so the link says that too: ?lang= of the page, English as well,
// after the mark, the anchor last; the language switcher keeps every one of them current
test('every link to a game carries the studio mark and the page\'s language', async ({ page }) => {
  const w = watch(page);
  const links = () => page.evaluate(([od, cp]) => [...document.querySelectorAll('a[href]')].map((a) => a.href)
    .filter((h) => h.startsWith(od + '/') || h.startsWith(cp + '/') || /details\?id=com\.lewydo\.(cubepix|orbitdash)\b/.test(h)), [OD, CP]);
  const check = async (L) => { const hs = await links(); expect(hs.length).toBeGreaterThan(14);
    for (const h of hs) { const u = new URL(h);
      if (u.hostname === 'play.google.com') { expect(h, h).toContain('referrer=utm_source%3Dlewydo%26utm_medium%3Dstudio_site'); continue; }   // the store: its own mark
      expect(u.searchParams.get('lang'), h).toBe(L);
      if (!u.pathname.endsWith('/privacy.html')) expect(u.search, h).toMatch(new RegExp(`^\\?${MARK}&lang=`)); } };   // the site, the web game, the holiday cards; privacy — the language only
  await page.goto('./?lang=en'); await check('en');
  await page.locator('#langBtn').click(); await page.locator('#langMenu button[data-lang="uk"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-words', 'uk'); await check('uk');
  await page.goto('./?lang=ar'); await expect(page.locator('html')).toHaveAttribute('data-words', 'ar'); await check('ar');
  await expect(page.locator('.pix-meet')).toHaveAttribute('href', `${CP}/?${MARK}&lang=ar#pix`);
  await expect(page.locator('.foot-links a[href="/brand/"]')).toHaveCount(1);                           // our own pages: plain paths, as before
  expect(w.errs).toEqual([]);
});

// What Pages serves is the build on disk (tests/serve.mjs swaps the game's origin for the local one only on the way out): the studio at
// https://lewydo.com/, each game at its own subdomain, nothing left of the old shared address (only the repository keeps its name), the mail —
// the domain's own
test('the built pages name the games by their own addresses: lewydo.com, orbitdash.lewydo.com, cubepix.lewydo.com', () => {
  const html = disk('index.html'), brand = disk('brand/index.html'), nf = disk('404.html');
  expect(disk('CNAME')).toBe('lewydo.com\n');
  for (const [f, s] of [['index.html', html], ['brand/index.html', brand], ['404.html', nf], ['brand/brand.json', disk('brand/brand.json')]]) {
    expect(s, f).not.toMatch(/\/Game-(Orbit-Dash|CubePix)\//);
    expect(s, f).not.toContain('roshevasternin@gmail.com');
    expect(s.replaceAll('github.com/RoShevasternin/roshevasternin.github.io', ''), f).not.toContain('roshevasternin.github.io'); }
  expect(html).toContain('<link rel="canonical" href="https://lewydo.com/">');
  expect(html).toContain('<meta property="og:url" content="https://lewydo.com/">');
  expect(html).toContain('<meta property="og:image" content="https://lewydo.com/assets/og.png">');
  expect(html).toContain('<link rel="alternate" hreflang="uk" href="https://lewydo.com/?lang=uk">');
  expect(brand).toContain('<link rel="canonical" href="https://lewydo.com/brand/">');
  expect(brand).toContain('<span class="ab-url">lewydo.com</span>');                                 // About us: the address under «Our website»
  expect(brand).toContain('<span data-t="b.where.4.d"><a href="/">lewydo.com</a>');                  // «On our site» — the site's own address
  expect(brand).toContain('https://lewydo.com/brand/brand.json — every number');                     // the text for Claude in another project
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
  expect([ld.url, ld.logo, ld.email]).toEqual(['https://lewydo.com/', 'https://lewydo.com/assets/icon-512.png', 'hello@lewydo.com']);
  expect(html.match(/mailto:[^"]+/g)).toEqual(['mailto:hello@lewydo.com', 'mailto:Lilyadesign05@gmail.com', 'mailto:hello@lewydo.com']);   // Vlad's card, Lilya's, «Write to us»
  expect(html).toContain(`SRC = '${OD_REAL}/play/embed.html'`);                                      // the live game, from its own site
  expect(html).toContain(`src="${OD_REAL}/assets/media/poster.webp"`);
  // every link to a game, before any script runs: the game's own address, the studio mark (not on the privacy pages), the page's language
  // (English) and data-lang-link, so src/lang.js keeps the language current
  const links = [...html.matchAll(/<a\b[^>]*\bhref="(https:\/\/(?:orbitdash|cubepix)\.lewydo\.com\/[^"]*)"[^>]*>/g)];
  expect(links.length).toBeGreaterThan(14);
  for (const [a, href] of links) { const h = href.replace(/&amp;/g, '&');
    expect(a, h).toMatch(new RegExp(`\\sdata-lang-link="${h.includes('cubepix') ? 'cp' : 'od'}"`));
    expect(new URL(h).searchParams.get('lang'), h).toBe('en');
    if (!h.includes('/privacy.html')) expect(h, h).toContain(`?${MARK}&lang=en`); }
  const B = JSON.parse(disk('brand/brand.json'));
  expect([B.page, B.about.links.site, B.about.layout.address.text, B.socials.email]).toEqual(['https://lewydo.com/brand/', 'https://lewydo.com/', 'lewydo.com', 'hello@lewydo.com']);
});

// Orbit Dash's live game is another origin (since 06.11.2026; the page's side — src/index.html, «Orbit Dash: сама гра»; the game's —
// Game-Orbit-Dash-PRIVATE site/src/embed.js). The page sends only to the game's origin and hears only its own frame from that origin; the
// game hears only its parent from the studio, its own origin or localhost. So: a frame that ends up on another origin is neither told nor
// heard, and a page on an origin the game doesn't know is not heard by the game (the stand-in here, the real game with OD_SITE).
test('the live game is its own origin: the page talks only to it, hears only it, and a wrong origin is ignored both ways', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const w = watch(page);
  const L = JSON.parse(disk('src/orbitdash.json')).levels, uk = JSON.parse(disk('src/i18n/uk.json')).site;
  const odd = L.find((l) => l.col === 'halloween');                                                  // a level the trailer never shows by itself
  await page.goto('./?lang=uk');
  await page.locator('#orbitdash').scrollIntoViewIfNeeded();
  await expect(page.locator('#odScreen iframe')).toHaveAttribute('src', `${OD}/play/embed.html?lang=uk`);   // the game's own origin, the page's language
  await expect(page.locator('#odScreen')).toHaveClass(/\bready\b/, { timeout: 30_000 });            // the handshake — across origins
  const game = () => page.frame({ url: /embed\.html/ });
  expect(await game().evaluate(() => location.origin)).toBe(OD);
  expect(new URL(page.url()).origin).not.toBe(OD);
  const tap = () => game().evaluate((real) => real ? (document.querySelector('#odx .tap span') || {}).textContent
    : (got.filter((m) => m.od === 'labels').pop() || {}).tap, REAL_OD).catch(() => null);
  await expect.poll(tap, { timeout: 15_000 }).toBe(uk['od.tap']);                                  // the page's words reached the game
  const level = () => (REAL_OD ? game().evaluate(() => { const i = window.__orbitDev.current.beatInfo(); return i && i.id; })
    : game().evaluate(() => (got.filter((m) => m.od === 'level').pop() || {}).id)).catch(() => null);
  await page.locator(`.od-pill[data-id="${L[1].id}"]`).click();                                        // a pill → that level in the game: the channel works
  await expect.poll(level, { timeout: 15_000 }).toBe(L[1].id);
  if (!REAL_OD) expect(await game().evaluate(() => refused)).toEqual([]);                            // …and the game heard the page (localhost)
  // the frame is taken to another origin (a link inside it, a redirect): what it says from there is not heard, and the page's messages,
  // addressed to the game's origin only, never reach it (the browser drops them)
  const ELSE = 'https://elsewhere.example';
  await page.route(`${ELSE}/**`, (r) => r.fulfill({ contentType: 'text/html', body: `<!doctype html><script>var got = [];
    addEventListener('message', function (e) { got.push(e.data); });
    parent.postMessage({ od: 'ready' }, '*'); parent.postMessage({ od: 'state', mode: 'watch', level: '${odd.id}' }, '*');
    setInterval(function () { parent.postMessage({ od: 'tick', t: 1, end: 9, level: '${odd.id}' }, '*'); }, 50);</script>` }));
  await game().goto(`${ELSE}/frame.html`);
  const other = page.frame({ url: /elsewhere\.example/ });
  await page.waitForTimeout(500);
  await expect(page.locator(`.od-pill[data-id="${odd.id}"]`)).not.toHaveClass(/\bnow\b/);            // its «state» and «tick» changed nothing
  await page.locator(`.od-pill[data-id="${L[2].id}"]`).click();                                        // a pill → a «level» message for the game
  await expect(page.locator(`.od-pill[data-id="${L[2].id}"]`)).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(500);
  expect(await other.evaluate(() => got)).toEqual([]);                                               // …which the other origin never got
  expect(w.errs.filter((e) => !/target origin provided .* does not match the recipient window's origin/.test(e))).toEqual([]);
  expect([...w.ext]).toEqual([ELSE]);                                                                 // nothing else left our own origins
  // the game's side: the studio page on an origin the game doesn't know (http://[::1] — not lewydo.com, not localhost / 127.0.0.1).
  // It still says ready (nothing private), but hears nothing: no words, no level
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }), p2 = await ctx.newPage();
  const STRANGER = `http://[::1]:${SITE_PORT}`;
  await p2.goto(`${STRANGER}/?lang=uk`);
  await p2.locator('#orbitdash').scrollIntoViewIfNeeded();
  await expect(p2.locator('#odScreen')).toHaveClass(/\bready\b/, { timeout: 30_000 });
  await p2.locator(`.od-pill[data-id="${odd.id}"]`).click();
  await p2.waitForTimeout(1500);
  const g2 = p2.frame({ url: /embed\.html/ });
  if (REAL_OD) {
    expect(await g2.evaluate(() => (document.querySelector('#odx .tap span') || {}).textContent)).toBe('TAP TO PLAY');   // its own words, not the page's
    expect(await g2.evaluate(() => { const i = window.__orbitDev.current.beatInfo(); return i && i.id; })).not.toBe(odd.id);
  } else {
    expect(await g2.evaluate(() => got)).toEqual([]);
    expect(await g2.evaluate(() => refused)).toContain(STRANGER);
  }
  await ctx.close();
});
