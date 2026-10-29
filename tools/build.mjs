// npm run build — src/ → index.html, brand/ (the brand page, brand.json, the kit zip), 404.html, robots.txt, sitemap.xml, and one small
// words file per language for each page (lang/<id>.json, brand/lang/<id>.json): what GitHub Pages serves at https://roshevasternin.github.io/
// English is written into the pages themselves (search engines, no JavaScript); every other language (src/langs.json — our games'
// languages) is fetched by the page when the visitor needs it (src/lang-boot.js, src/lang.js). The build is deterministic
// (no dates, no randomness): the same sources → the same files.
//   npm run build            warns about missing translations (English is shown there)
//   npm run build -- --strict   fails on them instead (what npm test runs)
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { brandJson, zip, kitFiles, beatGraph, codeParts, dlCards } from './brand.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8'), json = (p) => JSON.parse(read(p));
const SITE = 'https://roshevasternin.github.io/', YEAR = 2026;
const G = json('src/games.json'), CP = json('src/cubepix.json'), LANGS = json('src/langs.json'), NAMES = json('src/langnames.json');
const OD = json('src/orbitdash.json');   // рівні Orbit Dash — знімок із сайту гри (tools/orbitdash-snapshot.mjs)
const IDS = LANGS.map((L) => L.id), RTL = LANGS.filter((L) => L.dir === 'rtl').map((L) => L.id);
// no Russian, anywhere (owner 13–14.10.2026): not a language of ours — the lists end with the row «Россия, останови войну в Украине» instead
if (IDS.includes('ru') || readdirSync(new URL('src/i18n/', ROOT)).includes('ru.json')) { console.error('✗ Russian is never a language of Lewydo (CLAUDE.md, «Мови»)'); process.exit(1); }
for (const f of readdirSync(new URL('src/i18n/', ROOT))) if (!IDS.includes(f.replace(/\.json$/, ''))) { console.error(`✗ src/i18n/${f}: not in src/langs.json`); process.exit(1); }
// the words, one file per language (src/i18n/<id>.json): site — the main page, brand — the brand page, cubepix — the CubePix supplement
const I18N = Object.fromEntries(IDS.map((L) => { try { return [L, json(`src/i18n/${L}.json`)]; } catch (e) { return [L, {}]; } }));
const SS = Object.fromEntries(IDS.map((L) => [L, I18N[L].site || {}])), BS = Object.fromEntries(IDS.map((L) => [L, I18N[L].brand || {}]));
const STOP = { flag: '<img src="/assets/flags/ru-stained.svg" alt="" width="28" height="21" loading="lazy" decoding="async">', text: 'Россия, останови войну в Украине' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── words: the site's own (src/i18n/<id>.json → site, brand) + CubePix's own (src/cubepix.json, as cp:…) ──
const problems = [], notes = [], S = {}, PICS = {};
const forms = (v) => (typeof v === 'object' ? Object.values(v) : [v]);
for (const L of IDS) {
  S[L] = {};
  for (const [k, en] of Object.entries(SS.en)) {
    const v = SS[L]?.[k];
    if (v == null) { problems.push(`${L}: «${k}» is missing (English is shown)`); S[L][k] = en; continue; }
    if ((typeof en === 'object') !== (typeof v === 'object')) problems.push(`${L}: «${k}» must be ${typeof en === 'object' ? 'plural forms {one, …, other}' : 'a plain string'}`);
    if (typeof v === 'object' && v.other == null) problems.push(`${L}: «${k}» has no «other» form`);
    if (typeof en === 'object' && forms(v).some((f) => !f.includes('{n}'))) problems.push(`${L}: «${k}» lost its {n}`);
    if (forms(v).some((f) => !String(f).trim())) problems.push(`${L}: «${k}» is empty`);
    S[L][k] = v;
  }
  for (const k of Object.keys(SS[L] || {})) if (!(k in SS.en)) problems.push(`${L}: «${k}» is not an English key`);
  // CubePix's words: the CubePix site's own (the snapshot) → our supplement for a language it does not speak yet → a problem
  const snap = CP.S[L], sup = I18N[L].cubepix || {};
  if (snap && (sup.S || sup.pics)) notes.push(`${L}: the CubePix site speaks it now — its supplement (src/i18n/${L}.json → cubepix) is no longer used; delete it`);
  for (const [k, en] of Object.entries(CP.S.en)) {
    const v = snap?.[k] ?? sup.S?.[k];
    if (v == null) { problems.push(`${L}: CubePix «${k}» is neither on the CubePix site nor in the supplement (src/i18n/${L}.json → cubepix.S)`); S[L]['cp:' + k] = en; continue; }
    // the game's words may say a small number as a word (ar «يوم واحد», he «יומיים» — «one day», «two days»): {n} is a must in «other» only
    if ((typeof en === 'object') !== (typeof v === 'object') || (typeof v === 'object' && (v.other == null || !String(v.other).includes('{n}')))) problems.push(`${L}: CubePix «${k}» must be plural forms {one, …, other}, «other» with {n}`);
    if (forms(v).some((f) => !String(f).trim())) problems.push(`${L}: CubePix «${k}» is empty`);
    S[L]['cp:' + k] = v;
  }
  for (const k of Object.keys(sup.S || {})) if (!(k in CP.S.en)) problems.push(`${L}: CubePix supplement «${k}» is not a key of src/cubepix.json`);
  PICS[L] = Object.fromEntries(Object.keys(CP.pics).map((p) => { const v = CP.pics[p][L] ?? sup.pics?.[p];
    if (!v || !v.n) { problems.push(`${L}: the painting «${p}» has no name (src/i18n/${L}.json → cubepix.pics)`); return [p, CP.pics[p].en]; }
    if (p === CP.puzzle && !v.f) problems.push(`${L}: the puzzle «${p}» has no fun fact (cubepix.pics.${p}.f)`);
    return [p, v]; }));
  // the brand page's own words (src/brand-strings.json) → b.…
  for (const [k, en] of Object.entries(BS.en)) {
    const v = BS[L]?.[k];
    if (v == null || !String(v).trim()) { problems.push(`${L}: brand «${k}» is missing (English is shown)`); S[L]['b.' + k] = en; continue; }
    const marks = (x) => [(x.match(/`/g) || []).length, (x.match(/\]\(/g) || []).length, (x.match(/\*\*/g) || []).length].join();
    if (marks(v) !== marks(en)) problems.push(`${L}: brand «${k}» lost some code marks, [link](…) or **bold**`);
    S[L]['b.' + k] = v;
  }
  for (const k of Object.keys(BS[L] || {})) if (!(k in BS.en)) problems.push(`${L}: brand «${k}» is not an English key`);
}
// French typography: a no-break space before : ; ! ? » and after « (the game's own French does the same)
const nb = (s) => s.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ');
for (const [k, v] of Object.entries(S.fr)) if (!k.startsWith('cp:')) S.fr[k] = typeof v === 'string' ? nb(v) : Object.fromEntries(Object.entries(v).map(([f, s]) => [f, nb(s)]));
// a dash never starts a line: it holds on to the word before it (every language)
const dash = (s) => s.replace(/ ([—–]) /g, '\u00a0$1 ');
for (const L of IDS) for (const [k, v] of Object.entries(S[L])) if (!k.startsWith('cp:')) S[L][k] = typeof v === 'string' ? dash(v) : Object.fromEntries(Object.entries(v).map(([f, x]) => [f, dash(x)]));
for (const L of IDS) if (!NAMES[L]) problems.push(`${L}: no language names (src/langnames.json)`);
if (notes.length) console.log('· ' + notes.join('\n· '));
if (problems.length) { console.warn('⚠ ' + problems.join('\n⚠ ')); if (process.argv.includes('--strict')) process.exit(1); }

// ── the pieces ──
// the Lewydo mark: the games' own pictures (brand/kit, WebP copies for the web) in the brand kit's composition — never redrawn
// (W — the WebP copies the pages show; P — the @3x PNG originals, for the kit pictures npm run kit makes)
const art = (fmt) => {
  const K = `/brand/kit/${fmt}/`, x = '.' + fmt;
  const aura = `<img class="lw-aura" src="${K}brand_back${x}" alt="" width="208" height="208">`;      // the splash's two waves of light
  const logo = (id, waves) => `<span class="lw-logo"${id ? ` id="${id}"` : ''}>${waves ? aura + aura : ''}<img class="lw-back" src="${K}brand_back${x}" alt="" width="208" height="208">` +
    `<img class="lw-front" src="${K}brand_front${x}" alt="" width="140" height="140"></span>`;
  const name = `<img class="lw-name" src="${K}lewydo${x}" alt="" width="208" height="74">`;
  const lockup = (id, cls) => `<span class="lw-lockup${cls ? ' ' + cls : ''}"${id ? ` id="${id}"` : ''} role="img" aria-label="Lewydo — Love What You Do">${logo('', /lw-splash/.test(cls || ''))}${name}` +
    `<img class="lw-slogan" src="${K}slogan${x}" alt="" width="208" height="19"><img class="lw-line" src="${K}brand_line${x}" alt="" width="146" height="1"></span>`;
  return { logo, lockup, sig: (id) => `<span class="lw-sig">${logo(id)}${name}</span>` };
};
const W = art('webp'), P = art('png');
const logo = W.logo, mark = W.logo(), lockup = W.lockup(), sig = W.sig();
const go = '<svg class="lw-go" viewBox="0 0 5 8" aria-hidden="true"><path d="M1 1l3 3-3 3" fill="none" stroke="#9DF5C2" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const brandCss = read('brand/kit/code/web/lewydo-brand.css');
// languages, the same on both pages: the boot script (<head>), the picker and the words (src/lang.js), the CSS (src/lang.css)
const langCss = read('src/lang.css'), langFonts = langCss.slice(langCss.indexOf("/* the scripts' own fonts"));
const langBoot = (base) => '<script>' + read('src/lang-boot.js').replace(/^\/\/.*\n/gm, '').replace('__BOOT__', () => JSON.stringify({ ids: IDS, rtl: RTL, base })) + '</script>';
const langJs = read('src/lang.js');
const gpIcon = '<svg class="gp" viewBox="0 0 24 24" aria-hidden="true"><path fill="#00D7FE" d="M3.6 1.8 13.6 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1z"/>' +
  '<path fill="#FFCE00" d="m17 8.6 3.3 1.9c.9.5.9 1.8 0 2.4L17 15.4 13.6 12z"/><path fill="#FF3A44" d="M17 15.4 5 22.3c-.5.3-1 .2-1.4 0L13.6 12z"/><path fill="#00F076" d="M3.6 1.8c.4-.2.9-.3 1.4 0l12 6.8L13.6 12z"/></svg>';
const ICONS = {
  insta: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.8.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.3.7-.3 1.8-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.8.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.7.3 1.8.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.8-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.3-.7.3-1.8.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.8-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.7-.3-1.8-.3-1.3-.1-1.7-.1-4.8-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.1-2.9a1.1 1.1 0 1 1 0 2.3 1.1 1.1 0 0 1 0-2.3z',
  tg: 'M21.9 4.6c.3-1.2-.7-1.8-1.6-1.4L2.8 10.1c-1.1.4-1.1 1.1-.2 1.4l4.5 1.4 10.4-6.6c.5-.3.9-.1.6.2l-8.4 7.6-.3 4.6c.5 0 .7-.2 1-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3-14.1z',
  link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',   // a link page (the first streamer's, in the story)
  mail: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  discord: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
};
// Lewydo's own pages (owner 03.10.2026: «the brand's networks»; Discord — 09.10.2026; YouTube is Vlad's channel @veldan1202, where he posts about Lewydo's games)
const SOCIAL = [['tiktok', 'TikTok', 'https://www.tiktok.com/@lewydo_game'], ['insta', 'Instagram', 'https://www.instagram.com/lewydo_game/'],
  ['youtube', 'YouTube', 'https://www.youtube.com/channel/UCn2SbibS30OyiUPHBFhvFpw'], ['facebook', 'Facebook', 'https://www.facebook.com/profile.php?id=61594804110096'],
  ['discord', 'Discord', 'https://discord.gg/PvUA3DwSP'],   // the studio's server, «general» (owner 09.10.2026); each game's site links its own channel
  ['x', 'X', 'https://x.com/lewydo_game']];   // the studio's X (owner 14.10.2026)
const social = (cls) => SOCIAL.map(([i, n, u]) => `<a class="${cls}" href="${u}" target="_blank" rel="noopener" aria-label="Lewydo — ${n}">${ico(i)}<span>${n}</span></a>`).join('');
const ico = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]}"/></svg>`;
// the heart as Vlad's Kotlin (src/heart.kt), lightly coloured
const escT = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hl = (line) => line.replace(/(\/\/.*$)|("[^"]*")|\b(package|object|const|val|fun|return)\b|(\b0x[0-9A-F]+\b|\b\d+(?:\.\d+)?f?\b)|\b([a-zA-Z_]\w*)(?=\()|([^/"\w]+|\w+|.)/g,
  (m, com, str, kw, num, fn) => (com ? `<span class="c">${escT(com)}</span>` : str ? `<span class="s">${escT(str)}</span>` : kw ? `<span class="k">${kw}</span>`
    : num ? `<span class="n">${num}</span>` : fn ? `<span class="f">${fn}</span>` : escT(m)));
const kt = read('src/heart.kt').trimEnd().split('\n'), code = [...kt, '', ...kt].map(hl).join('\n');   // twice, so it fills the whole heart
const card = (g) => `<article class="gcard rv" style="--c:${g.color}">` +
  `<div class="ban"${g.bg ? ` style="background-color:${g.bg}"` : ''}><img src="${g.banner}" alt="" width="800" height="391" loading="lazy" decoding="async"${g.fit ? ` style="object-fit:${g.fit}"` : ''}></div>` +
  `<img class="ico" src="${g.icon}" alt="" width="64" height="64" loading="lazy" decoding="async">` +
  `<div class="body"><span class="genre" data-t="game.${g.id}.genre"></span><h3>${esc(g.name)}</h3><p data-t="game.${g.id}.d"></p>` +
  `<a class="btn btn-sm" href="${g.play}" rel="noopener">${gpIcon}<span>Google Play</span></a></div><i class="shine"></i></article>`;
const ogGames = [G.cubepix.icon, G.orbitdash.icon, ...G.more.map((g) => g.icon)].map((s) => `<img src="${s}" alt="" width="74" height="74">`).join('');

const counts = { people: 2, games: 2 + G.more.length, langs: IDS.length, pics: CP.counts.pics, floors: CP.counts.floors, cpLangs: CP.counts.langs };
const SMAIN = Object.fromEntries(IDS.map((L) => [L, Object.fromEntries(Object.entries(S[L]).filter(([k]) => !k.startsWith('b.')))]));   // the brand page's words stay on the brand page
const enPics = Object.fromEntries(Object.keys(CP.pics).map((p) => [p, CP.pics[p].en]));
const DATA = { langs: LANGS, base: '/lang/', S: { en: SMAIN.en }, stop: STOP, cpLangs: Object.keys(CP.S), counts,
  cp: { hero: CP.hero, puzzle: CP.puzzle, art: CP.art, pics: enPics, events: CP.events || {} }, od: OD.levels };
// a CubePix holiday (its site's own dates and words, src/cubepix.json → events): a card in the CubePix world, shown by the page only
// while the holiday is on (the visitor's clock, like the game) → the holiday on the CubePix site; its picture — assets/games/cubepix-<event>.webp
const cpEvents = Object.keys(CP.events || {}).map((ev) => { const pic = `assets/games/cubepix-${ev}.webp`;
  return `<a class="cp-ev" href="${G.cubepix.site}#event" data-lang-link="cp" data-ev="${ev}" hidden>` +
    (existsSync(new URL(pic, ROOT)) ? `<img src="/${pic}" alt="" width="480" height="270" loading="lazy" decoding="async">` : '') +
    `<span class="cp-ev-tx"><b data-t="cp:ev_${ev}"></b><span data-t="cp:evText_${ev}"></span>` +
    (CP.S.en && CP.S.en['evDress_' + ev] ? `<span class="cp-ev-dress" data-t="cp:evDress_${ev}"></span>` : '') + `<em><span class="cp-ev-left"></span> →</em></span></a>`; }).join('\n');
// one words file per language and page — the page fetches the visitor's (English rides in the page itself)
const langFiles = (dir, make) => { mkdirSync(new URL(dir, ROOT), { recursive: true });
  for (const f of readdirSync(new URL(dir, ROOT))) if (!IDS.includes(f.replace(/\.json$/, ''))) rmSync(new URL(dir + f, ROOT));
  for (const L of IDS) writeFileSync(new URL(`${dir}${L}.json`, ROOT), JSON.stringify(make(L))); };
langFiles('lang/', (L) => ({ S: SMAIN[L], pics: PICS[L], names: NAMES[L] }));
const ld = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Lewydo', slogan: 'Love What You Do', url: SITE, logo: SITE + 'assets/icon-512.png',
  founder: [{ '@type': 'Person', name: 'Vlad' }, { '@type': 'Person', name: 'Liliia' }], foundingLocation: 'Poltava region, Ukraine',
  sameAs: [G.devPage, ...SOCIAL.map(([, , u]) => u)] };

// the record from our games (CubePix's pixel vinyl, with the Lewydo green on its label) — the site's music button (src/music.html)
const VINYL = (() => { const pal = { d: '#151833', g: '#2b3061', s: '#525a9c', l: '#3DDC84', h: '#070816' }; let r = '';
  for (let y = 0; y < 16; y++) { let row = ''; for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 7.5);
      row += d > 7.7 ? '.' : d < 1.2 ? 'h' : d < 3.4 ? 'l' : (Math.abs(d - 5.1) < .42 || Math.abs(d - 6.7) < .36) ? 'g' : (x < y + 1 && x + y < 12 && d > 4.2) ? 's' : 'd'; }
    for (let x = 0; x < 16;) { const c = row[x]; let x2 = x + 1; while (x2 < 16 && row[x2] === c) x2++; if (c !== '.') r += `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${pal[c]}"/>`; x = x2; } }
  return `<svg class="vinyl" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`; })();
const fill = (html) => {
  html = html
    .replace('{{music}}', () => read('src/music.html')).replace(/\{\{vinyl\}\}/g, () => VINYL)
    .replace(/\{\{brandCss\}\}/g, () => brandCss).replace(/\{\{lockup\}\}/g, lockup).replace(/\{\{mark\}\}/g, mark).replace(/\{\{mark:(\w+)\}\}/g, (m, id) => logo(id))
    .replace(/\{\{lockup:(\w+)\}\}/g, (m, id) => W.lockup(id)).replace(/\{\{splash:(\w+)\}\}/g, (m, id) => W.lockup(id, 'lw-splash'))
    .replace(/\{\{png:lockup\}\}/g, () => P.lockup()).replace(/\{\{png:sig\}\}/g, () => P.sig()).replace(/\{\{sig:(\w+)\}\}/g, (m, id) => W.sig(id))
    .replace(/\{\{sig\}\}/g, sig).replace(/\{\{go\}\}/g, go).replace(/\{\{gpIcon\}\}/g, gpIcon).replace(/\{\{ico:(\w+)\}\}/g, (m, n) => ico(n))
    .replace(/\{\{social:(\w+)\}\}/g, (m, cls) => social(cls)).replace('{{code}}', () => code).replace('{{games}}', () => G.more.map(card).join('\n')).replace('{{ogGames}}', () => ogGames).replace('{{cp.logo}}', () => CP.logo).replace('{{cp.events}}', () => cpEvents)
    .replace('{{od.trails}}', () => G.orbitdash.trails.map(([n, r]) => `<li class="${r}">${n}</li>`).join(''))
    .replace(/\{\{(url|year|devPage|cp\.site|cp\.demo|cp\.privacy|cp\.icon|od\.site|od\.web|od\.embed|od\.poster|od\.play|od\.privacy|od\.icon|od\.version)\}\}/g, (m, k) => ({
      url: SITE, year: YEAR, devPage: G.devPage, 'cp.site': G.cubepix.site, 'cp.demo': G.cubepix.demo, 'cp.privacy': G.cubepix.privacy, 'cp.icon': G.cubepix.icon,
      'od.site': G.orbitdash.site, 'od.web': G.orbitdash.demo, 'od.embed': G.orbitdash.embed, 'od.poster': G.orbitdash.poster,
      'od.play': G.orbitdash.play, 'od.privacy': G.orbitdash.privacy, 'od.icon': G.orbitdash.icon, 'od.version': G.orbitdash.version }[k]))
    .replace(/\{\{langCss\}\}/g, () => langCss).replace('{{langFonts}}', () => langFonts).replace('{{langJs}}', () => langJs)
    .replace('{{hreflang}}', () => [...IDS.map((L) => `<link rel="alternate" hreflang="${L}" href="${SITE}?lang=${L}">`), `<link rel="alternate" hreflang="x-default" href="${SITE}">`].join('\n'))
    .replace('{{ldjson}}', () => JSON.stringify(ld).replace(/</g, '\\u003c'))
    .replace('{{DATA}}', () => JSON.stringify(DATA).replace(/</g, '\\u003c'));
  const PR = new Intl.PluralRules('en');
  const tx = (k, n) => { let v = S.en[k]; if (v && typeof v === 'object') v = v[PR.select(n ?? 0)] ?? v.other; if (v == null) throw new Error('no string ' + k); return v; };
  const fmt = (v, n) => esc(String(v).replace(/\{n\}/g, n ?? '')).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u}"${/^https?:/.test(u) ? ' rel="noopener"' : ''}>${t}</a>`);
  html = html.replace(/(<(\w+)[^>]*\sdata-t="([^"]+)"[^>]*>)(<\/\2>)/g, (m, open, tag, k, close) => {
    const nv = (open.match(/\sdata-n="(\w+)"/) || [])[1]; return open + fmt(tx(k, nv ? counts[nv] : undefined), nv ? counts[nv] : undefined) + close; });
  html = html.replace(/\sdata-ta="([\w-]+):([^"]+)"/g, (m, attr, k) => ` ${attr}="${fmt(tx(k))}"${m}`);
  const left = html.match(/\{\{[^}]*\}\}/); if (left) throw new Error('unfilled ' + left[0]);
  return html;
};
const out = (p, s) => writeFileSync(new URL(p, ROOT), s);
out('index.html', fill(read('src/index.html').replace('{{langBoot}}', () => langBoot('/lang/'))));
const NF = Object.fromEntries(IDS.map((L) => [L, Object.fromEntries(['nf.title', 'nf.text', 'nf.home'].map((k) => [k, S[L][k]]))]));
out('404.html', fill(read('src/404.html').replace('{{lockup404}}', lockup).replace('{{DATA404}}', JSON.stringify({ S: NF, rtl: RTL }).replace(/</g, '\\u003c'))));
// the brand page (/brand/, English): the standard with the kit itself — brand.json and the zip are made from brand/kit/ (tools/brand.mjs)
const BJ = JSON.stringify(brandJson({ SITE, YEAR, G, S, IDS }), null, 1) + '\n', ZIP = zip(kitFiles(BJ)), bcode = codeParts();
out('brand/brand.json', BJ); out('brand/lewydo-brand-kit.zip', ZIP);
const BKEYS = ['skip', 'lang.title', 'lang.search', 'lang.none', 'lang.stop', 'say.btn', 'say.spell', 'say.aria', 'music.fav', 'music.label', 'music.close', 'music.hint', 'music.thanks', ...Object.keys(BS.en).map((k) => 'b.' + k)];
const bWords = (L) => Object.fromEntries(BKEYS.map((k) => [k, S[L][k]]));
// About us in every language rides in the page (its own language picker shows any of them): the games' own words
const BDATA = { langs: LANGS, base: '/brand/lang/', S: { en: bWords('en') }, stop: STOP,
  about: Object.fromEntries(IDS.map((L) => [L, { title: S[L]['cp:aboutTitle'], text: S[L]['cp:about'], thanks: S[L]['cp:thanks'], site: S[L]['cp:site'], games: S[L]['cp:games'] }])) };
langFiles('brand/lang/', (L) => ({ S: bWords(L), names: NAMES[L] }));
out('brand/index.html', fill(read('src/brand.html').replace('{{langBoot}}', () => langBoot('/brand/lang/'))
  .replace('{{langOptions}}', () => LANGS.map((L) => `<option value="${L.id}"${L.id === 'en' ? ' selected' : ''}>${esc(L.name)}</option>`).join(''))
  .replace('{{beatGraph}}', () => beatGraph()).replace('{{codeTabs}}', () => bcode.tabs).replace('{{codePanes}}', () => bcode.panes)
  .replace('{{dlCards}}', () => dlCards({ W })).replace(/\{\{zipMb\}\}/g, () => (ZIP.length / 1048576).toFixed(1))
  .replace('{{DATA}}', () => JSON.stringify(BDATA).replace(/</g, '\\u003c'))
  .replace('{{hreflangBrand}}', () => [...IDS.map((L) => `<link rel="alternate" hreflang="${L}" href="${SITE}brand/?lang=${L}">`), `<link rel="alternate" hreflang="x-default" href="${SITE}brand/">`].join('\n'))));
out('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
const pages = ['', 'brand/', 'Game-CubePix/', 'Game-CubePix/play/', 'Game-CubePix/privacy.html', 'Game-Orbit-Dash/', 'Game-Orbit-Dash/privacy.html'];
out('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n') + '\n</urlset>\n');
const kb = (p) => Math.round(read(p).length / 1024);
console.log(`✓ index.html ${kb('index.html')} KB · lang/ · brand/ (index.html ${kb('brand/index.html')} KB, lang/, brand.json, lewydo-brand-kit.zip ${Math.round(ZIP.length / 1024)} KB) · 404.html · robots.txt · sitemap.xml — ${IDS.length} languages${problems.length ? `, ${problems.length} translation problems (see above)` : ''}`);
