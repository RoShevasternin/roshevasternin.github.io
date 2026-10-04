// A tiny static server for this repo, the way GitHub Pages serves it at https://roshevasternin.github.io/ (a lost path → 404.html):
//   node tests/serve.mjs [port]   (npm run serve → http://localhost:5190/)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname, PORT = +(process.argv[2] || 5190);
// OD_SITE=<a build of the Orbit Dash site (Game-Orbit-Dash-PRIVATE/site/dist or a clone of Game-Orbit-Dash)> — served at
// /Game-Orbit-Dash/, as on Pages, so the live game in the Orbit Dash block plays here too (npm run look; npm test checks it then)
const OD = process.env.OD_SITE ? normalize(process.env.OD_SITE + '/') : null, ODP = '/Game-Orbit-Dash/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.md': 'text/plain; charset=utf-8',
  '.zip': 'application/zip', '.kt': 'text/plain; charset=utf-8', '.atlas': 'text/plain; charset=utf-8', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };
createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const od = OD && url.startsWith(ODP), base = od ? OD : ROOT;
  let file = normalize(join(base, od ? url.slice(ODP.length) : url));
  if (!file.startsWith(base) || /\/(node_modules|\.git)\//.test(file + '/')) { res.writeHead(403); return res.end(); }
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404, { 'content-type': TYPES['.html'] }); res.end(await readFile(join(ROOT, '404.html')).catch(() => 'not found')); }
}).listen(PORT, () => console.log(`site: http://localhost:${PORT}/`));
