// The brand page's own pieces, for tools/build.mjs: brand/brand.json (the standard in numbers, for code and for Claude),
// brand/lewydo-brand-kit.zip (the whole kit in one file) and the parts of brand/index.html made from the kit (downloads, code, the beat graph).
// The kit in brand/kit/ is the source; all of this only describes it. Deterministic like the rest of the build: the same kit → the same bytes.
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const buf = (p) => readFileSync(new URL(p, ROOT)), has = (p) => existsSync(new URL(p, ROOT));
const list = (dir) => readdirSync(new URL(dir, ROOT)).filter((f) => !f.startsWith('.')).sort();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pngSize = (p) => { const b = buf(p); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const kb = (p) => { const n = buf(p).length; return n < 1024 ? n + ' B' : Math.round(n / 1024) + ' KB'; };

// ── the standard in numbers (dp = the design size; the pictures are @3x of it) ──
export const PARTS = [
  { id: 'brand_back', what: 'The glow — fills the 208×208 logo box, under the heart', dp: [208, 208] },
  { id: 'brand_front', what: 'The heart — 140×140 in the middle of the logo box', dp: [140, 140] },
  { id: 'lewydo', what: 'The name «Lewydo» (Nunito Black, white, soft shadow)', dp: [208, 74] },
  { id: 'slogan', what: 'The slogan «Love What You Do» — never translated', dp: [208, 19] },
  { id: 'brand_line', what: 'The line under the slogan, 20 below it', dp: [146, 1] },
];
// whole pictures exported from Figma (the owner's own exports, like the parts above)
export const RENDERS = [
  { id: 'lockup', what: 'The whole Lockup in one picture (Figma «Lewydo / Lockup») — for places without code (stores, videos, slides)', dp: [208, 322] },
  { id: 'pill', what: 'The menu Signature pill in one picture (Figma «Lewydo / Signature»), with its capsule and ›', dp: [118, 36] },
];
export const CODE = [
  ['libgdx/LewydoHeartbeat.kt', 'kt', 'The one heartbeat (package com.lewydo.brand) — the same in every game'],
  ['libgdx/ABrandLogo.kt', 'kt', 'The heart in its glow (208×208) + beat()'],
  ['libgdx/ABrandGroup.kt', 'kt', 'The Lockup 208×322 + the splash animation'],
  ['libgdx/BrandScreen.kt', 'kt', 'The first screen of every game → LoaderScreen'],
  ['web/lewydo-brand.css', 'css', 'The mark, the pill, the heartbeat and the splash for the web'],
  ['web/example.html', 'html', 'A working web example'],
];
const HEART = [[1.13, 0.10, 'sineOut'], [1.0, 0.12, 'sineIn'], [1.07, 0.10, 'sineOut'], [1.0, 0.12, 'sineIn']];
const GLOW = { delay: 0.05, steps: [[1.15, 0.12, 'sineOut'], [1.05, 0.28, 'sineIn']] };

export function brandJson({ SITE, YEAR, G, CP, IDS }) {
  const B = SITE + 'brand/', K = B + 'kit/';
  const part = (p) => ({ what: p.what, dp: p.dp, png: K + 'png/' + p.id + '.png', px: pngSize(`brand/kit/png/${p.id}.png`), webp: K + 'webp/' + p.id + '.webp' });
  const about = Object.fromEntries(IDS.map((L) => { const T = CP.S[L] || CP.S.en; return [L, { title: T.aboutTitle, text: T.about, thanks: T.thanks, site: T.site, games: T.games }]; }));
  return {
    _about: 'The Lewydo™ brand standard in numbers — for game code and for Claude. The same as the page ' + B + ' (rules, live previews). ' +
      'Take the pictures and the code as they are; never redraw the mark. Sizes are dp (the design size, 360×800 screens); the PNGs are @3x of them.',
    name: 'Lewydo', trademark: 'Lewydo™', slogan: 'Love What You Do',
    sloganNote: 'Always in English — a trademark. Its bold letters (L, e, W, Y, Do) spell the name: Lewydo.',
    page: B, json: B + 'brand.json', zip: B + 'lewydo-brand-kit.zip',
    repo: { url: 'https://github.com/RoShevasternin/roshevasternin.github.io', folder: 'brand/',
      clone: 'git clone --depth 1 https://github.com/RoShevasternin/roshevasternin.github.io', note: 'If the web is blocked in a sandbox, clone the repo: the kit is in brand/kit/, this file is brand/brand.json.' },
    colors: { background: '#0E1024', glow: '#6DF593', action: '#3DDC84', actionText: '#04120A', mint: '#9DF5C2', name: '#FFFFFF' },
    font: { family: 'Nunito', license: 'SIL Open Font License 1.1', url: 'https://fonts.google.com/specimen/Nunito',
      name: 'Nunito Black 54.17 / 74, white, shadow 0 4.17 2.08 rgba(0,0,0,.25)', slogan: 'Nunito 13.54 / 19: L, e, W, Y, Do — Black, the rest Regular',
      body: 'Nunito Medium 15 / 23', note: 'In apps the name and the slogan are pictures (lewydo.png, slogan.png): no font needed for the mark.' },
    images: Object.fromEntries(PARTS.map((p) => [p.id, part(p)])),
    renders: Object.fromEntries(RENDERS.filter((r) => has(`brand/kit/png/${r.id}.png`)).map((r) => [r.id, { what: r.what, dp: r.dp, png: K + 'png/' + r.id + '.png', px: pngSize(`brand/kit/png/${r.id}.png`) }])),
    atlas: { atlas: K + 'atlas/brand.atlas', png: K + 'atlas/brand.png', px: pngSize('brand/kit/atlas/brand.png'), regions: PARTS.map((p) => p.id),
      note: 'LibGDX TextureAtlas of the five pictures (@3x). assets/atlas/brand.atlas + brand.png → your assetsBrand (EnumAtlas.BRAND).' },
    lockup: { size: [208, 322], stack: 'vertical, centred: logo, name, slogan; the line 20 below the slogan',
      logo: { size: [208, 208], back: 'brand_back fills the box', front: 'brand_front 140×140, centred' },
      name: { size: [208, 74] }, slogan: { size: [208, 19] }, line: { size: [146, 1], gapAbove: 20 } },
    signature: { logo: [24, 24], gap: 1, name: [46.1, 16.4], note: 'The Lockup\'s logo and name, small: nothing else.' },
    pill: { height: 28, radius: 999, padding: { left: 3, right: 10 }, gap: 5, border: '1px #3DDC84 at 24%', fill: '#3DDC84 at 4%',
      arrow: { size: [5, 8], color: '#9DF5C2', opacity: 0.65 }, pressedScale: 0.96, tapArea: 48,
      place: 'the bottom of every game menu, centred, 34 from the bottom', tap: 'opens About us', beat: 'once, when the menu appears' },
    splash: { screen: 'BrandScreen', first: 'The first screen of every Lewydo game', size: [360, 800], lockupAt: [76, 239], seconds: 3.8,
      idea: 'Everything arrives first, top to bottom; then the heart beats as the finale, with the Lewydo sound.',
      timeline: [
        { part: 'logo', from: 0.15, to: 0.85, fadeIn: true, scale: [0.94, 1], interpolation: 'pow3Out' },
        { part: 'name', from: 0.55, to: 1.1, fadeIn: true, scale: [1.06, 1], interpolation: 'fade' },
        { part: 'slogan', from: 0.85, to: 1.4, fadeIn: true, scale: [1.06, 1], interpolation: 'fade' },
        { part: 'line', from: 1.15, to: 1.85, fadeIn: 0.3, scaleX: [0, 1], interpolation: 'exp5Out', origin: 'center' },
        { part: 'heartbeat finale', from: 2.0, lub: 2.17, dub: 2.45, to: 2.9, code: 'LewydoHeartbeat.finale' },
        { part: 'waves of light', at: [2.12, 2.4], what: 'two copies of brand_back: alpha 0.55 → 0, scale 1 → 1.9; alpha 0.32 → 0, scale 1 → 1.55' },
        { part: 'sound', at: 2.09, file: 'kit/sound/lewydo-heartbeat.*', note: 'the heart only; its first beat is 0.03 s in — on the lub' },
        { part: 'onComplete', at: 3.8 }],
      then: 'the game\'s LoaderScreen', theme: 'The background and the ambient light may follow the game. The Lockup, its numbers, its timeline and its sound never change.' },
    sound: { name: 'The Lewydo sound', what: 'The heart only: two soft, round tuned heartbeats (A2 → E2, a felt mallet), lub and dub, on the heart\'s two beats.',
      files: { ogg: K + 'sound/lewydo-heartbeat.ogg', mp3: K + 'sound/lewydo-heartbeat.mp3', wav: K + 'sound/lewydo-heartbeat.wav' },
      seconds: 2.2, firstBeat: 0.03, beats: [0.03, 0.31], level: 'RMS ≈ −23 dBFS, peaks ≈ −11 dBFS',
      startInSplash: 2.09, rules: ['Once per launch, with the splash — never in a loop.', 'At the game\'s sound volume; sounds off = silence.',
        'Never change, cut, speed up or layer it under music.', 'Browsers allow sound only after a tap: a web splash that opens by itself stays silent.'],
      generator: 'tools/sonic/make_sound6.py (variant D4 «Бум-бум · м\'якше»: D\'s heart without its notes, rounder)' },
    pronunciation: { ipa: '/lɛv.waɪ.doʊ/', say: 'Lev-why-do', uk: 'Лев-вай-до', from: 'Love What You Do — said quickly' },
    heartbeat: { once: true, when: ['the splash shows', 'About us opens (every time)', 'the menu pill appears'], never: 'in a loop (no Actions.forever, no infinite)',
      front: HEART.map(([scale, seconds, ease]) => ({ scale, seconds, ease })), back: { delay: GLOW.delay, steps: GLOW.steps.map(([scale, seconds, ease]) => ({ scale, seconds, ease })), stays: 1.05 },
      css: { sineOut: 'cubic-bezier(.61,1,.88,1)', sineIn: 'cubic-bezier(.12,0,.39,0)' }, reducedMotion: 'no beat' },
    about: { size: [360, 800], beat: 'every time it opens',
      layout: { back: { at: [16, 44], size: [40, 40] }, title: { at: [80, 53], font: 'Nunito ExtraBold 16, uppercase, white 70%' }, backRadius: 12, glow: { at: [30, 62], size: [300, 300], color: '#6DF593', opacity: 0.08 },
        lockup: { at: [76, 108] }, column: 'from the text down, one centred column: each part follows the one above (the text\'s length differs by language)',
        text: { at: [24, 452], width: 312, font: 'Nunito Medium 15 / 23, centred' },
        thanks: { below: 'text', gap: 8, width: 312, font: 'Nunito ExtraBold 15 / 23, white, centred',
          rule: '«Thank you for playing!» is the text\'s own last line: centred, one line in every language — a long one gets smaller, it never wraps; never the end of the paragraph' },
        siteButton: { below: 'thanks', gap: 14, size: [296, 52], radius: 16, style: 'green #3DDC84, text #04120A' }, address: { below: 'siteButton', gap: 12, text: 'roshevasternin.github.io' },
        gamesButton: { below: 'address', gap: 16, size: [296, 52], radius: 16, style: 'outlined' },
        copyright: { at: [32, 764], text: `© ${YEAR} Lewydo™`, note: 'at least 18 below the games button' } },
      links: { site: SITE, games: G.devPage }, texts: about },
    rules: {
      do: ['Use the pictures and the code of the kit as they are.', 'Keep the colours, the font and the proportions.',
        'Let the heart beat once when the brand appears.', 'Theme the background and the ambient light to your game.', 'Keep the mark on a dark background.'],
      dont: ['Redraw, recolour, stretch, squash, rotate or add effects to the mark.', 'Translate the slogan or set the name in another font.',
        'Loop the heartbeat.', 'Put the mark on a light or busy background.'] },
    code: Object.fromEntries(CODE.map(([f, , what]) => [f.split('/').pop(), { url: K + 'code/' + f, what }])),
  };
}

// ── the zip: stored (no compression — the pictures are compressed already), a fixed date, sorted names → the same bytes every time ──
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
export function zip(files) {                                  // files: [[name, Buffer]]
  const DATE = ((2026 - 1980) << 9) | (1 << 5) | 1, parts = [], dir = [];
  let off = 0;
  for (const [name, data] of files) {
    const n = Buffer.from(name, 'utf8'), crc = crc32(data), h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(10, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(0, 8); h.writeUInt16LE(0, 10); h.writeUInt16LE(DATE, 12);
    h.writeUInt32LE(crc, 14); h.writeUInt32LE(data.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(n.length, 26); h.writeUInt16LE(0, 28);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(0x0314, 4); c.writeUInt16LE(10, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(0, 10); c.writeUInt16LE(0, 12); c.writeUInt16LE(DATE, 14);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(data.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(n.length, 28);
    c.writeUInt32LE((0o100644 << 16) >>> 0, 38); c.writeUInt32LE(off, 42);
    parts.push(h, n, data); dir.push(c, n); off += 30 + n.length + data.length;
  }
  const cd = Buffer.concat(dir), e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(files.length, 8); e.writeUInt16LE(files.length, 10); e.writeUInt32LE(cd.length, 12); e.writeUInt32LE(off, 16);
  return Buffer.concat([...parts, cd, e]);
}
export function kitFiles(jsonText) {
  const F = [['README.md', buf('brand/README.md')], ['brand.json', Buffer.from(jsonText)]];
  for (const d of ['png', 'webp', 'atlas', 'sound', 'code/libgdx', 'code/web']) for (const f of list(`brand/kit/${d}`)) F.push([`${d}/${f}`, buf(`brand/kit/${d}/${f}`)]);
  F.push(['icon/icon-512.png', buf('assets/icon-512.png')], ['icon/icon-180.png', buf('assets/icon-180.png')], ['icon/favicon-64.png', buf('assets/favicon.png')]);
  return F.map(([n, b]) => ['lewydo-brand-kit/' + n, b]);
}

// ── the page's pieces ──
// the heartbeat as a graph: scale over time, the same easings as LibGDX (Interpolation.sineIn / sineOut)
export function beatGraph() {
  const E = { sineOut: (a) => Math.sin(a * Math.PI / 2), sineIn: (a) => 1 - Math.cos(a * Math.PI / 2) };
  const track = (delay, steps, t) => { let v = 1, t0 = delay; if (t < t0) return 1;
    for (const [to, d, ease] of steps) { if (t <= t0 + d) return v + (to - v) * E[ease]((t - t0) / d); v = to; t0 += d; } return v; };
  const W = 600, H = 250, L = 46, R = 30, T = 14, Bm = 34, T1 = 0.5, lo = 0.98, hi = 1.17;
  const x = (t) => L + (t / T1) * (W - L - R), y = (s) => T + (hi - s) / (hi - lo) * (H - T - Bm);
  const path = (f) => { let d = ''; for (let i = 0; i <= 250; i++) { const t = (i / 250) * T1; d += (i ? 'L' : 'M') + x(t).toFixed(1) + ' ' + y(f(t)).toFixed(1); } return d; };
  const grid = [1, 1.05, 1.1, 1.15].map((s) => `<line x1="${L}" x2="${W - R}" y1="${y(s).toFixed(1)}" y2="${y(s).toFixed(1)}" stroke="rgba(255,255,255,.08)"/>` +
    `<text x="${L - 8}" y="${(y(s) + 4).toFixed(1)}" text-anchor="end">${s.toFixed(2)}</text>`).join('');
  const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((t) => `<text x="${x(t).toFixed(1)}" y="${H - 12}" text-anchor="middle">${t ? t.toFixed(1) : '0'}${t === 0.5 ? ' s' : ''}</text>`).join('');
  return `<svg class="beatgraph" viewBox="0 0 ${W} ${H}" role="img" aria-label="The heart and the glow: scale over time" font-family="ui-monospace,monospace" font-size="12" fill="rgba(242,255,247,.55)">` +
    grid + ticks + `<path d="${path((t) => track(GLOW.delay, GLOW.steps, t))}" fill="none" stroke="#9DF5C2" stroke-width="2.5" stroke-dasharray="7 5"/>` +
    `<path d="${path((t) => track(0, HEART, t))}" fill="none" stroke="#3DDC84" stroke-width="3.5" stroke-linecap="round"/>` +
    `<line class="playhead" x1="${L}" x2="${L}" y1="${T}" y2="${H - Bm}" stroke="#fff" stroke-width="2" style="--run:${(W - L - R)}px"/></svg>`;
}

// the code, lightly coloured (Kotlin: keywords, strings, numbers, calls, comments · CSS / HTML: comments)
const escT = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KW = 'package|import|object|class|const|val|var|fun|return|override|private|protected|internal|open|by|when|if|else|for|in|true|false|null|this';
const hlKt = (line) => line.replace(new RegExp(`(\\/\\/.*$)|("[^"]*")|\\b(${KW})\\b|(\\b\\d+(?:\\.\\d+)?f?\\b)|\\b([a-zA-Z_]\\w*)(?=\\()|([^/"\\w]+|\\w+|.)`, 'g'),
  (m, com, str, kw, num, fn) => (com ? `<span class="c">${escT(com)}</span>` : str ? `<span class="s">${escT(str)}</span>` : kw ? `<span class="k">${kw}</span>`
    : num ? `<span class="n">${num}</span>` : fn ? `<span class="f">${fn}</span>` : escT(m)));
const colour = (src, lang) => {
  const block = lang === 'html' ? /(<!--[\s\S]*?-->)/ : /(\/\*[\s\S]*?\*\/)/;
  return src.split(block).map((part, i) => (i % 2 ? `<span class="c">${escT(part)}</span>` : lang === 'kt' ? part.split('\n').map(hlKt).join('\n') : escT(part))).join('');
};
export function codeParts() {
  const tabs = CODE.map(([f, , what], i) => `<button type="button" role="tab" id="tab${i}" aria-controls="pane${i}" aria-selected="${!i}" data-file="/brand/kit/code/${f}" title="${esc(what)}">${f.split('/').pop()}</button>`).join('');
  const panes = CODE.map(([f, lang], i) => `<pre class="src" id="pane${i}" role="tabpanel" aria-labelledby="tab${i}" tabindex="0"${i ? ' hidden' : ''}><code>${colour(buf('brand/kit/code/' + f).toString('utf8').trimEnd(), lang)}</code></pre>`).join('\n');
  return { tabs, panes };
}

// the download cards: every picture at its real size, straight from the kit (texts: b.c.* in src/brand-strings.json)
export function dlCards({ W }) {
  const a = (href, label) => `<a href="${href}" download>${label}</a>`;
  const png = (id) => { const p = `brand/kit/png/${id}.png`, [w, h] = pngSize(p); return a('/' + p, `${id}.png · ${w}×${h} · ${kb(p)}`); };
  const webp = (id) => a(`/brand/kit/webp/${id}.webp`, `${id}.webp`);
  const card = (key, pv, links) => `<div class="dl panel"><div class="pv">${pv}</div><h3 data-t="b.c.${key}"></h3><small data-t="b.c.${key}.d"></small><div class="links">${links.join('')}</div></div>`;
  const img = (src, w, h, extra = '') => `<img src="${src}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async"${extra}>`;
  return [
    card('heart', `<span style="--lw-s:.62;display:block">${W.logo()}</span>`, [png('brand_front'), webp('brand_front'), png('brand_back'), webp('brand_back')]),
    card('name', img('/brand/kit/webp/lewydo.webp', 208, 74), [png('lewydo'), webp('lewydo')]),
    card('slogan', img('/brand/kit/webp/slogan.webp', 208, 19, ' style="width:208px"'), [png('slogan'), webp('slogan')]),
    card('line', img('/brand/kit/webp/brand_line.webp', 146, 1, ' style="width:146px;height:2px"'), [png('brand_line'), webp('brand_line')]),
    card('lockup', img('/brand/kit/png/lockup.png', 624, 966, ' style="height:130px;width:auto"'), [png('lockup')]),
    card('pill', img('/brand/kit/png/pill.png', ...pngSize('brand/kit/png/pill.png'), ' style="width:auto;height:54px"'), [png('pill')]),
    card('atlas', img('/brand/kit/webp/brand_front.webp', 420, 420, ' style="width:90px"'),
      [a('/brand/kit/atlas/brand.atlas', 'brand.atlas'), a('/brand/kit/atlas/brand.png', `brand.png · ${pngSize('brand/kit/atlas/brand.png').join('×')} · ${kb('brand/kit/atlas/brand.png')}`)]),
    card('sound', '<span class="pv-code">♥ ♪</span>', ['ogg', 'mp3', 'wav'].map((x) => a(`/brand/kit/sound/lewydo-heartbeat.${x}`, `lewydo-heartbeat.${x} · ${kb(`brand/kit/sound/lewydo-heartbeat.${x}`)}`))),
    card('code', '<span class="pv-code">&lt;/&gt;</span>', CODE.map(([f]) => a('/brand/kit/code/' + f, f.split('/').pop()))),
    card('icon', img('/assets/icon-512.png', 512, 512, ' style="width:110px;border-radius:24px"'),
      [a('/assets/icon-512.png', 'icon 512×512'), a('/assets/icon-180.png', 'icon 180×180'), a('/assets/favicon.png', 'favicon 64×64')]),
  ].join('\n');
}
