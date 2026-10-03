// CubePix on the studio site: its paintings (the live reveal), their names in every language, its counts, its words
// and its pixel logo — all taken from the game's own public site, so the studio site says what the game says.
//   node tools/cubepix-snapshot.mjs <a clone of github.com/RoShevasternin/Game-CubePix>/index.html   → src/cubepix.json
// Run it again when CubePix changes in a way the studio site should show (new counts, words); npm run build after.
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('✗ node tools/cubepix-snapshot.mjs <Game-CubePix clone>/index.html'); process.exit(1); }
const html = readFileSync(src, 'utf8');
const D = JSON.parse(html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)[1]);

// the pixel logo: the <div class="plogo">…</div> element, found by counting nested divs
const at = html.indexOf('<div class="plogo"'); if (at < 0) throw new Error('no CubePix logo in ' + src);
let depth = 0, i = at, end = -1;
for (const m of html.slice(at).matchAll(/<\/?div\b/g)) { depth += m[0] === '<div' ? 1 : -1; if (!depth) { end = at + m.index + '</div>'.length; break; } }
const logo = html.slice(at, end);

const KEYS = { tagline: 'g:menu.tagline', lead: 'hero.lead', play: 'cta.play', soon: 'cta.gpSoon', demoNote: 'cta.demoNote',
  pics: 'chip.pics', floors: 'chip.floors', langs: 'chip.langs', free: 'chip.free', layer: 'g:game.layer', revealed: 'g:game.revealed',
  about: 'g:set.aboutText', thanks: 'g:set.aboutThanks', langTitle: 'g:lang.title', site: 'g:set.site', games: 'g:set.games', fact: 'g:fact.tag', how: 'how.1.d',
  demo: 'hero.demo', gp: 'cta.gp', aboutTitle: 'g:set.about',
  pixTitle: 'pix.title', pixName: 'pix.name.d', pixHi: 'pix.say.hi' };   // Pix, the game's mascot (its site's «Meet Pix»)
const S = Object.fromEntries(Object.keys(D.S).map((L) => [L, Object.fromEntries(Object.entries(KEYS).map(([k, g]) => [k, D.S[L][g]]))]));
const hero = D.hero, puzzle = D.how;                                   // the showcase paintings; the small picture to play
const out = {
  _about: 'Made by tools/cubepix-snapshot.mjs from the CubePix site (github.com/RoShevasternin/Game-CubePix). Do not edit by hand.',
  counts: { pics: D.counts.pics, floors: D.counts.floors, langs: D.counts.langs },
  hero, puzzle,
  art: Object.fromEntries([...hero, puzzle].map((k) => [k, { w: D.art[k].w, h: D.art[k].h, rows: D.art[k].rows, pal: D.art[k].pal }])),
  pics: Object.fromEntries([...hero, puzzle].map((k) => [k, Object.fromEntries(Object.entries(D.pics[k].t).map(([L, t]) =>
    [L, k === puzzle ? { n: t.n, a: t.a, y: t.y, f: t.f } : { n: t.n, a: t.a, y: t.y }]))])),
  S, logo,
};
writeFileSync(new URL('../src/cubepix.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
// the languages (the same 15 as the game) with the game's pixel flags — only written the first time
const langsFile = new URL('../src/langs.json', import.meta.url);
try { readFileSync(langsFile); } catch { writeFileSync(langsFile, JSON.stringify(D.langs.map((L) => ({ ...L, flag: D.flags[L.id] })), null, 1) + '\n'); console.log('✓ src/langs.json'); }
console.log(`✓ src/cubepix.json: ${hero.length} paintings, ${Object.keys(S).length} languages, logo ${logo.length} chars`);
