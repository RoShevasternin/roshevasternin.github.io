// A tiny static server for this repo, the way GitHub Pages serves it at https://roshevasternin.github.io/ (a lost path → 404.html):
//   node tests/serve.mjs [port]   (npm run serve → http://localhost:5190/)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname, PORT = +(process.argv[2] || 5190);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.md': 'text/plain; charset=utf-8' };
createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(ROOT, url));
  if (!file.startsWith(ROOT) || /\/(node_modules|\.git)\//.test(file + '/')) { res.writeHead(403); return res.end(); }
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404, { 'content-type': TYPES['.html'] }); res.end(await readFile(join(ROOT, '404.html')).catch(() => 'not found')); }
}).listen(PORT, () => console.log(`site: http://localhost:${PORT}/`));
