// ── [HALLOWEEN] the season's decor (src/halloween.js — tools/build.mjs puts it into the page's script; its look — src/halloween.css) ──
// Built only while <html> has .halloween (the script in <head>: Orbit Dash's Halloween window, src/orbitdash.json → events.halloween, by the
// visitor's local date — on December 1 nothing here is built and the page is as it always is). Everything is aria-hidden and takes no tap.
// The figures are the games' own (Game-Orbit-Dash-PRIVATE prototype/haunt.mjs: WITCH_D, BAT_*, PUMPKIN_*, GHOST_D) — the same ones the
// Orbit Dash site and the game draw. The Lewydo sign is never touched: nothing goes on the heart, the word, the slogan, the line or the pill.
// To remove (December): this file, src/halloween.css, every [HALLOWEEN] line (src/index.html, tools/build.mjs, tests/), the key hw.pill.
(() => {
  if (!document.documentElement.classList.contains('halloween')) return;
  const F = {
    witch: 'M10 53.2L106.2 40.2C107.8 39.8 109 40.8 108.6 42.2C108.4 43.2 107.6 43.6 106.6 43.7L10.8 56.4Z M24.2 50.4L31 49.4C31.8 51.6 32 54.2 31.6 56.6L25 57.6C24.4 55.2 24.2 52.8 24.2 50.4Z M25.4 57.4C18.6 59.6 13.2 62.4 9.2 66.2C9.4 63.6 10.6 61.2 13 58.8C10.4 59.4 7.2 60.6 3.4 62.8C4.4 60 6.6 57.6 10 55.6C7.6 55.6 4.6 56 0.6 57C2.4 54.6 5.4 52.8 9.4 51.6C7.6 50.8 4.4 50.2 0 50C2.4 48.4 5.4 47.6 9.6 47.8C8.4 46.8 6.4 45.6 2.6 43.4C11.4 45 18.6 47.8 24.8 50.8Z M18.4 48.2C13.8 45.2 9.2 42.4 4.4 40.6C9.6 41.4 14.6 43.6 19.2 47.2Z M20.4 59C17.6 62 15.2 65.4 13.2 69.2C13.6 65.4 15.4 61.8 18.6 58.2Z M59.6 35.6L54.2 45.8C47.2 45.8 40.8 46.4 34.6 47.4C33.8 45.6 34.2 43.8 35.8 41.8C32.6 42.6 28.8 43.2 25 42.6C25.6 40.2 24.4 37.8 21.4 35.4C24 36.4 26.8 36.8 29.8 36.4C30.4 34.2 29 32 25.8 29.8C31 31.2 36.4 31.2 42 30C49.4 28.4 56.4 27.2 62.6 27.4Z M61 27.2C59 30 55.8 31.6 51.6 31.2C54.2 30.4 56.2 28.8 57.6 27C54.2 28.8 49.6 29.4 45 27.8C48.8 27.8 51.8 26.8 54.2 25C51.6 25.4 48.6 24.8 45.8 23C51 23.2 55.4 20.8 60.4 20.4Z M54 47C51.4 41 52.2 33.6 56.8 29.2C59.4 26.8 63.4 26.6 66 28.4C68.4 30.2 69.6 33.2 70 36.2L71.6 45Z M52.6 44.4L72.4 41.8C75 45.4 76.2 49.4 76.2 53.2L67.4 55.4L64.6 58.4L61.4 56.4L57.2 59L55.6 56.2L50.2 57.6C51.4 55.4 51.8 53.2 51.6 50.8C51.6 48.6 52 46.4 52.6 44.4Z M71.2 49L76.8 47.6C78.8 50.6 80.4 53.6 81.8 56.4L87.4 55.2C89.4 54.8 90.8 53.6 91.4 51.8C92.8 54.6 91.8 57.8 88.6 59L79.4 61C77.8 57.4 75 53.8 71 51.6Z M62 31.2C66.6 32.2 72 35.2 77.2 38.8L81.6 40.4C83.4 41 84.2 42.6 83.6 44C83 45 81.2 45.2 79.6 44.4L77.4 43.6C71.6 41.2 65.6 38.6 60.4 36Z M65.6 36.4C67.4 39.8 69.2 42.4 72.6 43.6C69.4 44.6 66.2 43.6 63.8 40.6Z M63.4 16.8C66.6 16.8 68.8 18.8 69.2 21.4L73.8 23.2C74.4 23.6 74.2 24.2 73.4 24.2L69 24.4C68.6 25.4 68.8 26.4 69.6 27.4C68.4 28 67.2 28 66.2 27.6C65.2 28.4 64 28.8 62.8 28.6C60 28.2 58.4 25.6 58.6 22.6C58.8 19.4 60.8 16.8 63.4 16.8Z M51.2 19.4C56 16.4 66 15.4 75.6 16.6C76.8 16.8 76.8 17.8 75.6 18.2C66.4 20 57.6 20.6 51.6 20.6C50.6 20.4 50.4 19.8 51.2 19.4Z M56 18C56.4 11.6 54.6 7.8 51.6 6.2C48.6 4.8 44.6 4.8 41.6 6C43.4 3.6 46.4 2 50 1.6C56.6 1 61.6 2.6 64.8 5.6C67.8 8.4 69.6 12.4 70.4 16.8Z',
    band: 'M56.3 15.2L69.8 14.1L70.3 16.6L56.1 17.8Z',
    vb: [128,72],
    batB: 'M0 -4.8C1 -4.8 1.8 -4.5 2.4 -4L3.6 -8.2L4.6 -3.1C5.4 -1.8 5.6 0.2 5.2 2.2C4.7 4.8 3 7 0.9 8.2L1.6 9.2L0 8.6L-1.6 9.2L-0.9 8.2C-3 7 -4.7 4.8 -5.2 2.2C-5.6 0.2 -5.4 -1.8 -4.6 -3.1L-3.6 -8.2L-2.4 -4C-1.8 -4.5 -1 -4.8 0 -4.8Z',
    batW: 'M1.6 -1.8C3.6 -5.4 6.2 -7.6 9.2 -8.2C13.2 -9 17.8 -10.4 22.6 -11C21.4 -8.6 20.8 -5.8 21 -2.6C18.6 -3.6 16.4 -3 15.2 -1.2C15.4 1.2 15 3.2 13.8 4.8C11.2 2.8 8.2 2.4 5.4 3.6C4.6 1.8 3.4 0.2 1.4 -0.4Z',
    pump: 'M32 10.4C37 8.6 43.4 8.4 48.4 10.6C57.4 12.8 63.4 21 63.4 31.6C63.4 44.6 55.2 54.4 44.6 54.6C40.6 55.6 35.8 56 32 55.4C28.2 56 23.4 55.6 19.4 54.6C8.8 54.4 0.6 44.6 0.6 31.6C0.6 21 6.6 12.8 15.6 10.6C20.6 8.4 27 8.6 32 10.4Z M14.4 27.6L24.4 22.4L25.2 32.4Z M49.6 27.6L39.6 22.4L38.8 32.4Z M32 31.2L35.4 37.2L28.6 37.2Z M11.6 39C18 42.6 24.4 44 32 44C39.6 44 46 42.6 52.4 39C51 45.6 45.6 50 39.4 50.6L38.2 47.2L35.4 50.8L32 47.2L28.6 50.8L25.8 47.2L24.6 50.6C18.4 50 13 45.6 11.6 39Z',
    face: 'M14.4 27.6L24.4 22.4L25.2 32.4Z M49.6 27.6L39.6 22.4L38.8 32.4Z M32 31.2L35.4 37.2L28.6 37.2Z M11.6 39C18 42.6 24.4 44 32 44C39.6 44 46 42.6 52.4 39C51 45.6 45.6 50 39.4 50.6L38.2 47.2L35.4 50.8L32 47.2L28.6 50.8L25.8 47.2L24.6 50.6C18.4 50 13 45.6 11.6 39Z',
    stem: 'M29.4 11.2C29.4 7.4 30.2 3.6 32.6 0.6C34.2 0 35.6 0.6 36 1.8C34.6 4.2 34.2 7.4 34.6 11.4C33 12 31 12 29.4 11.2Z',
    ribs: 'M22 11.4C14.6 18 13 42 20.6 54.2 M42 11.4C49.4 18 51 42 43.4 54.2 M32 10.6C29.6 22 29.6 40 32 55',
    ghost: 'M20 0.6C30.6 0.6 38.4 8.8 38.4 19.4L38.4 38.6C38.4 42.6 39.4 45.2 40 47.4C37.2 46.8 34.6 44.8 32.4 43.4C30.4 42.2 28.4 42.6 27 44.6C25.2 47.2 21.8 47.4 20 44.8C18.2 47.4 14.8 47.2 13.2 44.6C11.8 42.4 9.4 42.2 7.4 43.8C4.8 46 1.6 44.8 1.6 41.2L1.6 19.4C1.6 8.8 9.4 0.6 20 0.6Z M14.4 15.8C15.8 15.8 16.7 17.3 16.7 19.3C16.7 21.3 15.8 22.8 14.4 22.8C13 22.8 12.1 21.3 12.1 19.3C12.1 17.3 13 15.8 14.4 15.8Z M25.6 15.8C27 15.8 27.9 17.3 27.9 19.3C27.9 21.3 27 22.8 25.6 22.8C24.2 22.8 23.3 21.3 23.3 19.3C23.3 17.3 24.2 15.8 25.6 15.8Z M17 26.2C18.8 27.8 21.2 27.8 23 26.2C22.8 29 21.6 30.6 20 30.6C18.4 30.6 17.2 29 17 26.2Z'
  };
  const svg = (vb, inner, cls) => `<svg viewBox="${vb}"${cls ? ` class="${cls}"` : ''} aria-hidden="true" focusable="false">${inner}</svg>`;
  const el = (cls, html) => { const d = document.createElement('div'); d.className = 'hw ' + cls; d.setAttribute('aria-hidden', 'true'); d.innerHTML = html; return d; };
  let uid = 0;
  // the jack-o'-lantern: the face glows through the cut body (the game's two layers), shaded ribs, the stem
  const pump = (cls) => { const id = 'hwp' + (++uid);
    return svg('0 0 64 56', `<defs><radialGradient id="${id}" cx="40%" cy="40%" r="70%"><stop offset="0" stop-color="#ff9a3a"/><stop offset=".7" stop-color="#d9530f"/><stop offset="1" stop-color="#7a2a06"/></radialGradient>` +
      `<clipPath id="${id}c"><path clip-rule="evenodd" fill-rule="evenodd" d="${F.pump}"/></clipPath></defs>` +
      `<path fill="#ffd27a" d="${F.face}"/><path fill="url(#${id})" fill-rule="evenodd" d="${F.pump}"/>` +
      `<path clip-path="url(#${id}c)" fill="none" stroke="rgba(80,18,0,.45)" stroke-width="1.3" d="${F.ribs}"/><path fill="#3f6212" d="${F.stem}"/>`, 'hw-pump' + (cls ? ' ' + cls : '')); };
  const candle = (h) => `<span class="hw-candle" style="height:${h}px"><i></i></span>`;
  // a bat: its body and its wings are two <svg>s — the wings flap by their own <svg>'s transform (never a <path> inside: page layout every frame)
  const bat = (st) => `<span class="hb" style="${st}">` + svg('-24 -16 48 28', `<path fill="#1c1030" d="${F.batB}"/>`) +
    svg('-24 -16 48 28', `<path fill="#1c1030" d="${F.batW}"/><path fill="#1c1030" transform="scale(-1,1)" d="${F.batW}"/>`, 'w') + '</span>';
  // a spider (the abdomen's centre is 0,0): legs, body, orange eyes
  const spider = '<g fill="#0d0716" stroke="#0d0716" stroke-width="1.1" stroke-linecap="round">' +
    '<path fill="none" d="M0 0Q-5 -6 -9 -3M0 0Q-6 -2 -10 2M0 0Q-6 2 -9 7M0 0Q-5 5 -7 10M0 0Q5 -6 9 -3M0 0Q6 -2 10 2M0 0Q6 2 9 7M0 0Q5 5 7 10"/>' +
    '<ellipse cx="0" cy="1.6" rx="5" ry="5.8"/><circle cx="0" cy="-4.6" r="3.2"/><circle cx="-1.3" cy="-4.8" r=".75" fill="#ff8a1f" stroke="none"/><circle cx="1.3" cy="-4.8" r=".75" fill="#ff8a1f" stroke="none"/></g>';
  // a cobweb into the corner (0,0): spokes over 0..90°, rings sagging towards the corner — the game's bakeWeb; the spider is its own <svg>
  const web = (() => { const R = 100, sp = [3, 17, 31, 45, 59, 73, 87], rad = (a) => a * Math.PI / 180, p = (a, r) => (Math.cos(rad(a)) * r).toFixed(1) + ' ' + (Math.sin(rad(a)) * r).toFixed(1);
    let d = sp.map((a) => 'M0 0L' + p(a, R)).join('');
    for (let k = 1; k <= 6; k++) { const r = R * Math.pow(k / 6.4, .92); d += 'M' + p(sp[0], r); for (let i = 1; i < sp.length; i++) d += 'Q' + p((sp[i] + sp[i - 1]) / 2, r * .86) + ' ' + p(sp[i], r); }
    return svg('0 0 104 104', `<path d="${d}" fill="none" stroke="#e8e4ff" stroke-width=".8" stroke-linecap="round"/>`) +
      svg('0 0 104 104', `<path d="M44 -60V62" stroke="#e8e4ff" stroke-opacity=".5" stroke-width=".6"/><g transform="translate(44 67)">${spider}</g>`, 'sp'); })();
  // a cloud: circles and a cushion as one shape; first the same shape lighter, 1.3 higher — its moonlit rim
  const cloud = (puff) => svg('0 0 100 36', `<g fill="#ffd9a6" opacity=".42" transform="translate(0 -1.2)">${puff}</g><g fill="#24163f">${puff}</g>`);
  const cloudA = cloud('<circle cx="22" cy="23" r="10"/><circle cx="40" cy="16" r="13.5"/><circle cx="59" cy="19" r="11.5"/><circle cx="76" cy="25" r="8.5"/><rect x="12" y="21" width="74" height="12" rx="6"/>');
  const cloudB = cloud('<circle cx="17" cy="26" r="7"/><circle cx="31" cy="20" r="10"/><circle cx="50" cy="15" r="12.5"/><circle cx="68" cy="21" r="9.5"/><circle cx="83" cy="26" r="6.5"/><rect x="10" y="22" width="80" height="10" rx="5"/>');
  // bats out of the moon: [dx px, dy px, scale, delay s] — a fan up and out past the screen's edge (src/halloween.css .hw-mbats)
  const MB = [[150, -150, 1, 3], [230, -90, .85, 3.25], [105, -205, .72, 3.5], [262, -176, .9, 3.15], [40, -196, .66, 3.6], [190, -36, .78, 3.7]];
  const mbats = MB.map(([x, y, s, d]) => bat(`--x:${x}px;--y:${y}px;--s:${s};--d:${d}s`)).join('');

  // the moon: its halo and light, clouds drifting across it, bats leaving it now and then — and, in the sky's moon, the witch crossing it
  const moon = (witch) => '<div class="hw-mbox"><span class="hw-moon"></span>' + (witch ? '<div class="hw-witch"><div class="fly"><div class="bob">' +
    svg(`0 0 ${F.vb[0]} ${F.vb[1]}`, `<path fill="#0c0616" d="${F.witch}"/><path fill="#ff8a1f" d="${F.band}"/>`) + '</div></div></div>' : '') +
    `<div class="hw-clouds"><span class="hw-cloud a">${cloudA}</span><span class="hw-cloud b">${cloudB}</span></div><div class="hw-mbats">${mbats}</div></div>`;
  // the sky: the night's tint, the mist, the moon (a wide screen's) and the ghost — behind everything, after the sparks
  const sky = el('hw-sky', '<i class="hw-night"></i><i class="hw-mist"></i>' + moon(true) +
    '<div class="hw-ghost">' + svg('0 0 40 48', `<path fill="#eef0ff" fill-opacity=".9" fill-rule="evenodd" d="${F.ghost}"/>`) + '</div>');
  $('#sky').after(sky);
  $('#lock').before(el('hw-hmoon', moon(false)));   // a narrower screen's moon: in the hero, beside the heart's top (it scrolls away with it)
  // cobwebs in the header's corners (under its links and the language button)
  const top = $('.top'); top.prepend(el('hw-web l', web), el('hw-web r', web));
  // pumpkins and candles in the hero: either side of its two buttons (wide) or of the scroll cue on its floor (narrower) — CSS picks one
  // (each pumpkin has its own gradient id: the hidden one's <defs> must not be the one the shown one points to)
  const props = () => `<div class="hw-side">${candle(22)}${pump()}${candle(34)}</div><div class="hw-side">${candle(28)}${pump('s')}${candle(16)}</div>`;
  $('#top .ctas').append(el('hw-flank', props())); $('#top').append(el('hw-ground', props()));
  // the festive line: a little pumpkin before the words and a chevron after them (the words — hw.pill, in the template)
  const pill = $('.hw-pill');
  if (pill) { pill.insertAdjacentHTML('afterbegin', svg('0 0 64 56', `<path fill="#ffe08a" d="${F.face}"/><path fill="#ff8a1f" fill-rule="evenodd" d="${F.pump}"/><path fill="#65a30d" d="${F.stem}"/>`, 'hw hw-ico'));
    pill.insertAdjacentHTML('beforeend', svg('0 0 7 12', '<path d="M1.5 1.5 6 6l-4.5 4.5" fill="none" stroke="#ffb347" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>', 'hw hw-go')); }
  // the contact card: candles and a pumpkin in its bottom corner
  $('.contact-card').append(el('hw-porch', candle(24) + pump('s') + candle(16)));
  // the footer: a spider on a thread from its line
  $('.foot').append(el('hw-hang', svg('-12 0 24 64', `<path d="M0 0V46" stroke="#e8e4ff" stroke-opacity=".45" stroke-width=".7"/><g transform="translate(0 51)">${spider}</g>`)));
  // the little pumpkin for three section labels (CSS --hw-pump): the same figure, its face lit
  document.documentElement.style.setProperty('--hw-pump', 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 56">' +
    `<path fill="#ffe08a" d="${F.face}"/><path fill="#ff8a1f" fill-rule="evenodd" d="${F.pump}"/><path fill="#65a30d" d="${F.stem}"/></svg>`) + '")');
})();
