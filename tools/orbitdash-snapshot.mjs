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

// Беремо лише те, що потрібно вітрині на сайті студії: без адрес на звук — його тут не граємо.
const out = levels.map((L) => ({
  id: L.id, name: L.name, genre: L.genre, dots: L.dots, bpm: L.bpm,
  palette: L.palette, sky: L.sky || {},
}));

writeFileSync('src/orbitdash.json', JSON.stringify({
  _about: 'Рівні Orbit Dash — знімок із сайту гри (tools/orbitdash-snapshot.mjs). Руками не правити.',
  levels: out,
}, null, 1) + '\n');
console.log(`✓ src/orbitdash.json — ${out.length} рівнів: ${out.map((L) => L.name).join(', ')}`);
