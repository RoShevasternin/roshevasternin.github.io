// «•••» in the header (src/more.js — the same on every page, tools/build.mjs puts it into each page's script): a button that opens a small
// menu; a tap outside, Esc or a link closes it. The menu's words are the page's own (data-t), so they follow the language like the rest.
(() => { const btn = document.getElementById('moreBtn'), menu = document.getElementById('moreMenu'); if (!btn || !menu) return;
  const open = (on) => { menu.hidden = !on; btn.setAttribute('aria-expanded', String(on)); };
  btn.addEventListener('click', () => { const on = menu.hidden; open(on); if (on) { const a = [...menu.querySelectorAll('a')].find((x) => x.offsetParent); if (a) a.focus({ preventScroll: true }); } });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) open(false); });
  menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') { open(false); btn.focus(); } });
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.more')) open(false); }); })();
