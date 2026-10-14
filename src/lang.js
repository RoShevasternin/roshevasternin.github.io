// ── languages (src/lang.js — the same on both pages; tools/build.mjs puts it into each page's script) ──
// ?lang= → the visitor's choice (lewydo:lang, shared with the game sites) → the device → English — decided before the page
// draws (the boot script in <head>, src/lang-boot.js). English rides in the page; every other language is one small file,
// D.base + <id>.json (the site: /lang/, the brand page: /brand/lang/), fetched when it is needed. No Russian, ever: a Russian
// device gets English, and the list ends with the row of Russia — not a language, not chosen, not a link (owner 14.10.2026).
const LB = window.__lang || { id: 'en', load: {} }, IDS = D.langs.map((L) => L.id), RTL = D.langs.filter((L) => L.dir === 'rtl').map((L) => L.id);
let lang = IDS.includes(LB.id) ? LB.id : 'en';
const DICT = { en: { S: D.S.en } };
const loadLang = (id) => (DICT[id] ? Promise.resolve(DICT[id]) : (LB.load[id] ??= fetch(D.base + id + '.json').then((r) => { if (!r.ok) throw new Error(id + ' ' + r.status); return r.json(); }))
  .then((d) => (DICT[id] = d)));
const words = () => (DICT[lang] || DICT.en).S;
const PR = {}; const plural = (n) => { try { return (PR[lang] ??= new Intl.PluralRules(lang)).select(n); } catch (e) { return 'other'; } };
const T = (k, n) => { let v = words()[k] ?? D.S.en[k] ?? ''; if (typeof v === 'object') v = v[plural(n ?? 0)] ?? v.other; return String(v).replace(/\{n\}/g, n ?? ''); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// names stay English even in CAPS: Turkish and Azerbaijani casing would give «KOTLİN»
const NAMES = /(<[^>]*>)|\b(Kotlin|LibGDX|Java|Box2D|Android|Lewydo|CubePix|Orbit Dash|Orbit III|Google Play|Telegram|UX\/UI|Team Lead|Idle|Nunito|Figma|Claude)\b/g;
const rich = (s) => { const h = esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u}"${/^https?:/.test(u) ? ' rel="noopener"' : ''}>${t}</a>`);
  return lang === 'tr' || lang === 'az' ? h.replace(NAMES, (m, tag, n) => tag || `<span lang="en">${n}</span>`) : h; };
const onLang = [];
const langName = (L) => (lang === 'en' ? L.en : (DICT[lang] && DICT[lang].names || {})[L.id]) || '';
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function applyLang() {
  const h = document.documentElement; h.lang = lang; h.dir = RTL.includes(lang) ? 'rtl' : 'ltr'; h.dataset.words = DICT[lang] ? lang : 'en';
  $$('[data-t]').forEach((el) => { const n = el.dataset.n ? D.counts[el.dataset.n] : undefined, v = T(el.dataset.t, n);
    if (el.tagName === 'TITLE') document.title = v; else el.innerHTML = rich(v); });
  $$('[data-ta]').forEach((el) => { const [a, k] = el.dataset.ta.split(/:(.+)/); el.setAttribute(a, T(k)); });
  // links to our other sites carry the language — CubePix's only when it speaks it (D.cpLangs), else it picks the visitor's own
  $$('[data-lang-link]').forEach((a) => { a.dataset.base ??= a.getAttribute('href'); const [b, hh] = a.dataset.base.split('#');
    const ok = lang !== 'en' && (a.dataset.langLink !== 'cp' || (D.cpLangs || []).includes(lang));
    a.setAttribute('href', b + (ok ? '?lang=' + lang : '') + (hh ? '#' + hh : '')); });
  $('#langFlag').innerHTML = D.langs.find((L) => L.id === lang).flag;
  $('#langCode').textContent = { 'zh-TW': '繁中', 'zh-CN': '简中' }[lang] || lang.toUpperCase();
  $$('#langList button').forEach((b) => { const L = D.langs.find((x) => x.id === b.dataset.lang), nm = langName(L), sm = $('small', b);
    b.setAttribute('aria-selected', String(L.id === lang)); sm.textContent = nm && fold(nm) !== fold(L.name) && L.id !== lang ? nm : ''; sm.lang = lang; });
  $('#langStop small').lang = lang; find.placeholder = T('lang.search'); find.setAttribute('aria-label', T('lang.search'));
  onLang.forEach((f) => f());
}
function setLang(id) {
  if (!IDS.includes(id) || id === lang) return;
  store.set('lewydo:lang', id); store.set('cubepix-site:lang', id);
  try { const u = new URL(location.href); u.searchParams.set('lang', id); history.replaceState(null, '', u); } catch (e) {}
  langBtn.setAttribute('aria-busy', 'true');
  loadLang(id).then(() => { lang = id; applyLang(); }, () => {}).finally(() => langBtn.removeAttribute('aria-busy'));
}
// the picker: type to find (the language's own name, its name in the page's language, in English, or its code); arrows, Enter, Esc
const menu = $('#langMenu'), list = $('#langList'), find = $('#langFind'), langBtn = $('#langBtn');
list.innerHTML = D.langs.map((L) => `<button type="button" role="option" data-lang="${L.id}"><span class="flag">${L.flag}</span>` +
  `<span class="lang-nm"><span lang="${L.id}" dir="auto">${esc(L.name)}</span><small></small></span></button>`).join('');
$('#langStop').innerHTML = `<span class="flag">${D.stop.flag}</span><span><b lang="ru">${esc(D.stop.text)}</b><small data-t="lang.stop"></small></span>`;
const shown = () => $$('button', list).filter((b) => !b.hidden);
function filter() { const q = fold(find.value.trim());
  $$('button', list).forEach((b) => { const L = D.langs.find((x) => x.id === b.dataset.lang);
    b.hidden = !!q && ![L.name, L.en, langName(L), L.id].some((s) => fold(s).includes(q)); });
  $('#langNone').hidden = !q || shown().length > 0; }
find.addEventListener('input', filter);
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const openMenu = (on) => { menu.hidden = !on; langBtn.setAttribute('aria-expanded', String(on)); if (!on) return;
  find.value = ''; filter(); const cur = list.querySelector('[aria-selected="true"]') || list.firstChild;
  cur.scrollIntoView({ block: 'center' }); (fine ? find : cur).focus({ preventScroll: true }); };
langBtn.addEventListener('click', () => openMenu(menu.hidden));
list.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; setLang(b.dataset.lang); openMenu(false); langBtn.focus(); });
menu.addEventListener('keydown', (e) => { const bs = shown(), i = bs.indexOf(document.activeElement);
  if (e.key === 'Escape') { openMenu(false); langBtn.focus(); return; }
  if (!bs.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); bs[(i + 1) % bs.length].focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); (i < 0 ? bs[bs.length - 1] : i === 0 ? find : bs[i - 1]).focus(); }
  else if (e.key === 'Enter' && document.activeElement === find) { e.preventDefault(); setLang(bs[0].dataset.lang); openMenu(false); langBtn.focus(); }
  else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && document.activeElement !== find) find.focus(); });   // typing goes to the search
document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.langsel')) openMenu(false); });
// the first paint is English (the page itself); the visitor's language arrives with its file — or English stays if it can't
function startLang() { applyLang(); if (lang === 'en') return;
  loadLang(lang).then(applyLang, () => { lang = 'en'; applyLang(); }); }
