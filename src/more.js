// «•••» in the header (src/more.js — the same on every page, tools/build.mjs puts it into each page's script): a button that opens a small
// menu; a tap outside, Esc or a link closes it. The menu's words are the page's own (data-t), so they follow the language like the rest.
(() => { const btn = document.getElementById('moreBtn'), menu = document.getElementById('moreMenu'); if (!btn || !menu) return;
  const open = (on) => { menu.hidden = !on; btn.setAttribute('aria-expanded', String(on)); };
  btn.addEventListener('click', () => { const on = menu.hidden; open(on); if (on) { const a = [...menu.querySelectorAll('a')].find((x) => x.offsetParent); if (a) a.focus({ preventScroll: true }); } });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) open(false); });
  menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') { open(false); btn.focus(); } });
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.more')) open(false); }); })();
// /brand/ and /press/: the page's badge by the sign («Brand», «Press kit») stays whole in every language — when the header has no room, the sign
// steps back to its heart, then the badge takes two lines, then a smaller size (never cut, never under «•••»)
(() => { const t = document.querySelector('.top-in'), b = t && t.querySelector('.home > b'); if (!b) return;
  const home = b.parentElement, over = () => [t, home, b].some((e) => e.scrollWidth > e.clientWidth + .5);
  const fit = () => { t.classList.remove('sig-ico', 'badge-2'); b.style.fontSize = '';
    for (const c of ['sig-ico', 'badge-2']) if (over()) t.classList.add(c);
    for (let fs = parseFloat(getComputedStyle(b).fontSize); over() && fs > 8.5;) { fs -= .5; b.style.fontSize = fs + 'px'; } };
  fit(); onLang.push(fit); addEventListener('resize', fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); })();
