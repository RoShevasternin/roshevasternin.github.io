// A tiny static server for this repo, the way GitHub Pages serves it at https://lewydo.com/ (a lost path → 404.html), and next to it
// Orbit Dash's site the way it lives since 06.11.2026 — on its own origin (https://orbitdash.lewydo.com/), not under this one:
//   node tests/serve.mjs [port]   (npm run serve → the studio http://localhost:5190/, the game http://localhost:5191/)
// The game: on port+1 (OD_PORT=… — another one), from its root —
//   OD_SITE=<a build of the Orbit Dash site (Game-Orbit-Dash-PRIVATE/site/dist or a clone of Game-Orbit-Dash)> — the real one, so the live
//   game in the Orbit Dash block plays here too (npm run look; npm test checks it then);
//   without it — a stand-in: play/embed.html speaks the live-game protocol by the same rules (STAND_IN below), the pictures are one pixel.
// The studio's pages name the game by its real address; served from here, that origin becomes the local game's (the files on disk keep the
// real one — npm test reads them too). So here, as on the web, the page and the game are two origins, and their handshake is the real,
// cross-origin one.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url)),   // a file path (a clone in a folder with a space works too)
  PORT = +(process.argv[2] || 5190), OD_PORT = +(process.env.OD_PORT || PORT + 1);
const OD = process.env.OD_SITE ? normalize(process.env.OD_SITE + '/') : null;
const OD_REAL = 'https://orbitdash.lewydo.com', OD_HERE = `http://localhost:${OD_PORT}`;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.md': 'text/plain; charset=utf-8',
  '.zip': 'application/zip', '.kt': 'text/plain; charset=utf-8', '.atlas': 'text/plain; charset=utf-8', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.mp4': 'video/mp4',
  '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.ico': 'image/x-icon', '.jpg': 'image/jpeg', '.wasm': 'application/wasm', '.webmanifest': 'application/manifest+json' };
const TEXT = new Set(['.html', '.js', '.json']);   // where the studio's pages carry addresses

// The stand-in for Orbit Dash's play/embed.html (Game-Orbit-Dash-PRIVATE, site/src/embed.js) — the same protocol and the same rule:
// it hears its parent only, and only from the studio (https://lewydo.com), its own origin or localhost (tests, a local preview);
// it answers with "*" (ready, state, tick — nothing private). `got` — what it heard, `refused` — the origins it would not hear.
const STAND_IN = `<!doctype html><meta charset="utf-8"><title>Orbit Dash · stand-in</title><body style="margin:0;background:#04050f"><script>
var STUDIO = ["https://lewydo.com"], LOCAL = /^http:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d{1,5})?$/, got = [], refused = [];
addEventListener('message', function (e) {
  if (e.source !== parent || !(e.origin === location.origin || STUDIO.indexOf(e.origin) >= 0 || LOCAL.test(e.origin))) { refused.push(e.origin); return; }
  var m = e.data; if (!m || typeof m !== 'object' || typeof m.od !== 'string') return; got.push(m);
  if (m.od === 'level') parent.postMessage({ od: 'state', mode: 'watch', level: m.id || 'first-light', trailer: !m.id }, '*'); });
parent.postMessage({ od: 'ready' }, '*');
setTimeout(function () { parent.postMessage({ od: 'tick', t: 56, end: 72, bg: '#06071a', level: 'first-light' }, '*'); }, 60);
</script>`;
const PIXEL = Buffer.from('UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=', 'base64');
const PAGE = (what) => `<!doctype html><meta charset="utf-8"><title>Orbit Dash · stand-in</title><p>Orbit Dash — ${what} (a stand-in: OD_SITE=… serves the real site)</p>`;
const standIn = (url) => url === '/play/embed.html' ? [TYPES['.html'], STAND_IN]
  : /^\/assets\/media\/[\w-]+\.webp$/.test(url) ? [TYPES['.webp'], PIXEL]
  : ['/', '/index.html', '/play/', '/play/index.html', '/privacy.html'].includes(url) ? [TYPES['.html'], PAGE(url)] : null;

const send = (res, code, type, body) => { res.writeHead(code, { 'content-type': type }); res.end(body); };
// a folder of files, as Pages serves it: a folder → its index.html, a lost path → that site's own 404.html
const files = (base, edit) => async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(base, url));
  if (!file.startsWith(base) || /\/(node_modules|\.git)\//.test(file + '/')) return send(res, 403, TYPES['.txt'], '');
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); let body = await readFile(file);
    if (edit && TEXT.has(extname(file))) body = edit(body.toString('utf8'));
    send(res, 200, TYPES[extname(file)] || 'application/octet-stream', body); }
  catch { send(res, 404, TYPES['.html'], await readFile(join(base, '404.html')).catch(() => 'not found')); }
};
const game = OD ? files(OD) : (req, res) => {
  const hit = standIn(new URL(req.url, 'http://x').pathname);
  return hit ? send(res, 200, ...hit) : send(res, 404, TYPES['.html'], PAGE('404'));
};
const studio = files(ROOT, (s) => s.replaceAll(OD_REAL, OD_HERE));

createServer(game).listen(OD_PORT, () => {
  console.log(`Orbit Dash: ${OD_HERE}/ (${OD ? OD : 'a stand-in'})`);
  createServer(studio).listen(PORT, () => console.log(`site: http://localhost:${PORT}/`));
});
