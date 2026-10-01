// npm run build — src/ → index.html, brand/ (the brand page, brand.json, the kit zip), 404.html, robots.txt, sitemap.xml: the pages GitHub Pages serves at https://roshevasternin.github.io/
// English is written into the pages themselves (search engines, no JavaScript); all 15 languages ride along inside the page and
// its script swaps in the visitor's. The build is deterministic (no dates, no randomness): the same sources → the same files.
//   npm run build            warns about missing translations (English is shown there)
//   npm run build -- --strict   fails on them instead (what npm test runs)
import { readFileSync, writeFileSync } from 'node:fs';
import { brandJson, zip, kitFiles, beatGraph, codeParts, dlCards } from './brand.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8'), json = (p) => JSON.parse(read(p));
const SITE = 'https://roshevasternin.github.io/', YEAR = 2026;
const SS = json('src/strings.json'), BS = json('src/brand-strings.json'), G = json('src/games.json'), CP = json('src/cubepix.json'), LANGS = json('src/langs.json');
const IDS = LANGS.map((L) => L.id);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── words: the site's own (src/strings.json) + CubePix's own (src/cubepix.json, as cp:…) ──
const problems = [], S = {};
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
  for (const [k, v] of Object.entries(CP.S[L] || CP.S.en)) S[L]['cp:' + k] = v;
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
const gpIcon = '<svg class="gp" viewBox="0 0 24 24" aria-hidden="true"><path fill="#00D7FE" d="M3.6 1.8 13.6 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1z"/>' +
  '<path fill="#FFCE00" d="m17 8.6 3.3 1.9c.9.5.9 1.8 0 2.4L17 15.4 13.6 12z"/><path fill="#FF3A44" d="M17 15.4 5 22.3c-.5.3-1 .2-1.4 0L13.6 12z"/><path fill="#00F076" d="M3.6 1.8c.4-.2.9-.3 1.4 0l12 6.8L13.6 12z"/></svg>';
const ICONS = {
  insta: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.8.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.3.7-.3 1.8-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.8.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.7.3 1.8.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.8-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.3-.7.3-1.8.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.8-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.7-.3-1.8-.3-1.3-.1-1.7-.1-4.8-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.1-2.9a1.1 1.1 0 1 1 0 2.3 1.1 1.1 0 0 1 0-2.3z',
  tg: 'M21.9 4.6c.3-1.2-.7-1.8-1.6-1.4L2.8 10.1c-1.1.4-1.1 1.1-.2 1.4l4.5 1.4 10.4-6.6c.5-.3.9-.1.6.2l-8.4 7.6-.3 4.6c.5 0 .7-.2 1-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3-14.1z',
  mail: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
};
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
const cubeIcon = '<svg viewBox="0 0 100 100" width="74" height="74" style="background:#1a1540;border-radius:20px"><polygon points="50,14 84,32 50,50 16,32" fill="#ff8fd2"/><polygon points="16,32 50,50 50,88 16,70" fill="#FF3CAC"/><polygon points="84,32 50,50 50,88 84,70" fill="#99245f"/></svg>';
const ogGames = cubeIcon + [G.orbitdash.icon, ...G.more.map((g) => g.icon)].map((s) => `<img src="${s}" alt="" width="74" height="74">`).join('');

const counts = { people: 2, games: 2 + G.more.length, langs: IDS.length, pics: CP.counts.pics, floors: CP.counts.floors, cpLangs: CP.counts.langs };
const SMAIN = Object.fromEntries(IDS.map((L) => [L, Object.fromEntries(Object.entries(S[L]).filter(([k]) => !k.startsWith('b.')))]));   // the brand page's words stay on the brand page
const DATA = { langs: LANGS, S: SMAIN, counts, cp: { hero: CP.hero, puzzle: CP.puzzle, art: CP.art, pics: CP.pics } };
const ld = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Lewydo', slogan: 'Love What You Do', url: SITE, logo: SITE + 'assets/icon-512.png',
  founder: [{ '@type': 'Person', name: 'Vlad' }, { '@type': 'Person', name: 'Liliia Overchenko' }], foundingLocation: 'Poltava region, Ukraine',
  sameAs: [G.devPage, 'https://instagram.com/___vel__dan___', 'https://instagram.com/lilya.design'] };

const fill = (html) => {
  html = html
    .replace(/\{\{brandCss\}\}/g, () => brandCss).replace(/\{\{lockup\}\}/g, lockup).replace(/\{\{mark\}\}/g, mark).replace(/\{\{mark:(\w+)\}\}/g, (m, id) => logo(id))
    .replace(/\{\{lockup:(\w+)\}\}/g, (m, id) => W.lockup(id)).replace(/\{\{splash:(\w+)\}\}/g, (m, id) => W.lockup(id, 'lw-splash'))
    .replace(/\{\{png:lockup\}\}/g, () => P.lockup()).replace(/\{\{png:sig\}\}/g, () => P.sig()).replace(/\{\{sig:(\w+)\}\}/g, (m, id) => W.sig(id))
    .replace(/\{\{sig\}\}/g, sig).replace(/\{\{go\}\}/g, go).replace(/\{\{gpIcon\}\}/g, gpIcon).replace(/\{\{ico:(\w+)\}\}/g, (m, n) => ico(n))
    .replace('{{code}}', () => code).replace('{{games}}', () => G.more.map(card).join('\n')).replace('{{ogGames}}', () => ogGames).replace('{{cp.logo}}', () => CP.logo)
    .replace(/\{\{(url|year|devPage|cp\.site|cp\.demo|cp\.privacy|od\.site|od\.play|od\.privacy|od\.icon)\}\}/g, (m, k) => ({
      url: SITE, year: YEAR, devPage: G.devPage, 'cp.site': G.cubepix.site, 'cp.demo': G.cubepix.demo, 'cp.privacy': G.cubepix.privacy,
      'od.site': G.orbitdash.site, 'od.play': G.orbitdash.play, 'od.privacy': G.orbitdash.privacy, 'od.icon': G.orbitdash.icon }[k]))
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
out('index.html', fill(read('src/index.html')));
const NF = Object.fromEntries(IDS.map((L) => [L, Object.fromEntries(['nf.title', 'nf.text', 'nf.home'].map((k) => [k, S[L][k]]))]));
out('404.html', fill(read('src/404.html').replace('{{lockup404}}', lockup).replace('{{DATA404}}', JSON.stringify(NF).replace(/</g, '\\u003c'))));
// the brand page (/brand/, English): the standard with the kit itself — brand.json and the zip are made from brand/kit/ (tools/brand.mjs)
const BJ = JSON.stringify(brandJson({ SITE, YEAR, G, CP, IDS }), null, 1) + '\n', ZIP = zip(kitFiles(BJ)), bcode = codeParts();
out('brand/brand.json', BJ); out('brand/lewydo-brand-kit.zip', ZIP);
const BKEYS = ['skip', 'lang.title', 'say.btn', 'say.spell', 'say.aria', ...Object.keys(BS.en).map((k) => 'b.' + k)];
const BDATA = { langs: LANGS, S: Object.fromEntries(IDS.map((L) => [L, Object.fromEntries(BKEYS.map((k) => [k, S[L][k]]))])), about: Object.fromEntries(IDS.map((L) => { const T = CP.S[L] || CP.S.en; return [L, { title: T.aboutTitle, text: T.about, site: T.site, games: T.games }]; })) };
out('brand/index.html', fill(read('src/brand.html')
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
console.log(`✓ index.html ${kb('index.html')} KB · brand/ (index.html ${kb('brand/index.html')} KB, brand.json, lewydo-brand-kit.zip ${Math.round(ZIP.length / 1024)} KB) · 404.html · robots.txt · sitemap.xml — ${IDS.length} languages${problems.length ? `, ${problems.length} translation problems (see above)` : ''}`);
