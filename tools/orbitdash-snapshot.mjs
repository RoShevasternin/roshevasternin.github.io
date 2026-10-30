// Orbit Dash на сайті студії: його рівні (палітри, темпи, жанри) — з власного сайту гри,
// щоб студія показувала рівно те, що показує гра, і нічого не дублювалось руками.
//   node tools/orbitdash-snapshot.mjs <клон github.com/RoShevasternin/Game-Orbit-Dash>/index.html → src/orbitdash.json
// Перезапускати, коли в грі змінились рівні (палітра, темп, жанр, складність); далі npm run build.
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('✗ node tools/orbitdash-snapshot.mjs <клон Game-Orbit-Dash>/index.html'); process.exit(1); }
const html = readFileSync(src, 'utf8');

const m = html.match(/window\.OD_LEVELS\s*=\s*(\[[\s\S]*?\]);/);
if (!m) throw new Error('у ' + src + ' немає window.OD_LEVELS — це точно сайт Orbit Dash?');
const levels = JSON.parse(m[1]);
if (!levels.length) throw new Error('порожній список рівнів');

for (const L of levels) {
  for (const k of ['id', 'name', 'bpm', 'palette']) {
    if (!L[k]) throw new Error(`рівень ${L.id || '?'}: немає «${k}»`);
  }
}

// Свята гри (власник 29.10.2026: HALLOWEEN 29.10–30.11, 1 грудня тема гасне сама): вікно — те саме, що сайт гри вшиває зі
// prototype/haunt.mjs (`"haunt":{"season":{on, from, to}}`; `on: false` — сайт гри тему вимкнув, тоді й картки не буде).
// Сайт студії показує картку свята лише в ці дні за годинником відвідувача; слова картки — od.ev_<свято>, od.evText_<свято>.
const events = {};
const hs = html.match(/"haunt":\{"season":(\{[^}]*\})/);
if (hs) {
  const e = JSON.parse(hs[1]), D = /^\d{4}-\d{2}-\d{2}$/;
  if (!D.test(e.from || '') || !D.test(e.to || '')) throw new Error('вікно HALLOWEEN без дат yyyy-mm-dd: ' + hs[1]);
  events.halloween = { from: e.from, to: e.to, on: e.on !== false };
}

// Беремо лише те, що потрібно вітрині на сайті студії: без адрес на звук — його тут не граємо.
const out = levels.map((L) => ({
  id: L.id, name: L.name, genre: L.genre, dots: L.dots, bpm: L.bpm,
  palette: L.palette, sky: L.sky || {},
}));

writeFileSync('src/orbitdash.json', JSON.stringify({
  _about: 'Рівні Orbit Dash — знімок із сайту гри (tools/orbitdash-snapshot.mjs). Руками не правити.',
  levels: out,
  events,
}, null, 1) + '\n');
console.log(`✓ src/orbitdash.json — ${out.length} рівнів: ${out.map((L) => L.name).join(', ')}` +
  (Object.keys(events).length ? `; свята: ${Object.entries(events).map(([k, e]) => `${k} ${e.from}…${e.to}${e.on ? '' : ' (вимкнено)'}`).join(', ')}` : ''));
