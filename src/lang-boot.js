// the visitor's language, decided before the page draws (src/lang-boot.js; both pages, in <head>): ?lang= → the visitor's choice
// (lewydo:lang — shared with the game sites; CubePix's own key too) → the device → English. Russian is not ours: a Russian device
// gets the next language it lists, or English. The language's file starts loading at once (src/lang.js picks it up).
(() => {
  const B = __BOOT__, has = (l) => B.ids.includes(l), get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  // old and other codes for our languages (the same as the games): iw → he, in → id, tl → fil, no / nn → nb, prs → fa; Chinese by its script
  const ALIAS = { iw: 'he', in: 'id', tl: 'fil', no: 'nb', nn: 'nb', prs: 'fa' };
  const pick = (tag) => { if (!tag) return null; const p = String(tag).replace(/_/g, '-').toLowerCase().split('-');
    if (p[0] === 'zh') return p.includes('hant') || p.some((x) => x === 'tw' || x === 'hk' || x === 'mo') ? 'zh-TW' : 'zh-CN';
    const b = ALIAS[p[0]] || p[0]; return has(b) ? b : null; };
  const url = new URLSearchParams(location.search).get('lang');
  const id = (has(url) && url) || [get('lewydo:lang'), get('cubepix-site:lang')].find(has) || (navigator.languages || [navigator.language]).map(pick).find(Boolean) || 'en';
  const h = document.documentElement; h.lang = id; h.dir = B.rtl.includes(id) ? 'rtl' : 'ltr';
  window.__lang = { id, load: {} };
  if (id !== 'en') (window.__lang.load[id] = fetch(B.base + id + '.json').then((r) => { if (!r.ok) throw new Error(id + ' ' + r.status); return r.json(); })).catch(() => {});
})();
