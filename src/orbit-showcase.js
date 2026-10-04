/* Копія site/src/showcase.js з RoShevasternin/Game-Orbit-Dash-PRIVATE —
   щоб сайт студії показував сцену Orbit Dash рівно так, як її сайт.
   Міняєш там — перенеси сюди (інакше блоки розійдуться). */
/* ─────────────────────────────────────────────────────────────────────────────
   ВІТРИНА ORBIT DASH — сцена гри, що танцює під біт рівня.
   Джерело: Game-Orbit-Dash-PRIVATE / site/src/showcase.js. Копія стоїть на сайті
   студії; міняєш тут — онови й там.

   Це НЕ гра, у яку треба грати, а показ: м'яч перестрибує орбіти рівно в біт,
   збирає кристали й пролітає впритул біля шипів. Перемкнув рівень — уся сцена
   перефарбувалась у його палітру й пішла на його темпі (як картина в CubePix).

   Чому швидко (стара міні-гра підвисала на телефоні):
     · жодного shadowBlur у кадрі — усі світні фігури спечені в спрайти один раз;
     · фон і зорі — на окремій канві, перемальовуються лише на зміну палітри чи розміру;
     · DPR обмежено 2, кадри стоять, коли блок поза екраном або вкладка схована.

   Хореографія детермінована: кристал стоїть рівно там, де м'яч буде на долю,
   тож стрибок завжди лягає в біт — сцена читається як рівень гри, а не як хаос.
   ───────────────────────────────────────────────────────────────────────────── */
(function (root) {
  "use strict";

  var TAU = Math.PI * 2;
  var BEATS_PER_LAP = 8;        // коло за 8 долей
  var PATTERN = 16;             // два такти, далі візерунок повторюється
  var RATIO = 190 / 320;        // внутрішнє кільце до зовнішнього — як у грі

  function hex(c) {
    c = String(c).replace("#", "");
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  }
  function rgba(c, a) { var v = hex(c); return "rgba(" + v[0] + "," + v[1] + "," + v[2] + "," + a + ")"; }

  /** Світна фігура, спечена в окрему канву: у кадрі лишається самий drawImage. */
  function sprite(size, paint) {
    var c = document.createElement("canvas");
    c.width = c.height = size;
    paint(c.getContext("2d"), size);
    return c;
  }

  function ballSprite(size, color) {
    return sprite(size, function (x, s) {
      var r = s / 2, core = s * 0.17;
      var g = x.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, rgba(color, 1));
      g.addColorStop(core / r, rgba(color, 0.95));
      g.addColorStop(0.45, rgba(color, 0.35));
      g.addColorStop(1, rgba(color, 0));
      x.fillStyle = g; x.beginPath(); x.arc(r, r, r, 0, TAU); x.fill();
      x.fillStyle = "#fff"; x.globalAlpha = 0.9;
      x.beginPath(); x.arc(r, r, core * 0.62, 0, TAU); x.fill();
    });
  }

  function gemSprite(size, color) {
    return sprite(size, function (x, s) {
      var r = s / 2;
      var g = x.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, rgba(color, 0.75)); g.addColorStop(0.5, rgba(color, 0.22)); g.addColorStop(1, rgba(color, 0));
      x.fillStyle = g; x.fillRect(0, 0, s, s);
      var k = s * 0.21;
      x.translate(r, r); x.rotate(Math.PI / 4);
      x.fillStyle = color; x.fillRect(-k, -k, k * 2, k * 2);
      x.fillStyle = "rgba(255,255,255,.55)"; x.fillRect(-k, -k, k * 2, k * 0.5);
    });
  }

  function spikeSprite(size, color) {
    return sprite(size, function (x, s) {
      var r = s / 2;
      var g = x.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, rgba(color, 0.6)); g.addColorStop(0.5, rgba(color, 0.16)); g.addColorStop(1, rgba(color, 0));
      x.fillStyle = g; x.fillRect(0, 0, s, s);
      var k = s * 0.26;
      x.translate(r, r);
      x.fillStyle = color;
      x.beginPath(); x.moveTo(0, -k * 1.15); x.lineTo(k * 0.82, k * 0.72); x.lineTo(-k * 0.82, k * 0.72);
      x.closePath(); x.fill();
    });
  }

  /** Стабільний «випадок» із рядка — щоб кожен рівень мав свій візерунок, але завжди той самий. */
  function seeded(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
  }

  /**
   * Візерунок на PATTERN долей: на парних — кристал (кільце чергується),
   * на непарних — шип на СУСІДНЬОМУ кільці, щоб м'яч пролітав упритул.
   */
  function makePattern(id) {
    var rnd = seeded(id), out = [], ring = 1, i;
    for (i = 0; i < PATTERN; i++) {
      if (i % 2 === 0) {
        if (i > 0 && rnd() > 0.35) ring = ring ? 0 : 1;      // стрибок у біт
        out.push({ beat: i, ring: ring, gem: true });
      } else {
        out.push({ beat: i, ring: ring ? 0 : 1, gem: false });
      }
    }
    return out;
  }

  root.OrbitShowcase = function (canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    var bg = document.createElement("canvas"), bgx = bg.getContext("2d");
    var levels = opts.levels || [];
    var idx = 0, pal = null, pat = [], beatSec = 0.5;
    var S = 0, W = 0, H = 0, cx = 0, cy = 0, rOut = 0, rIn = 0, dpr = 1;
    var art = {};                      // спечені спрайти поточної палітри
    var stars = [];
    var t = 0, last = 0, live = false, raf = 0;
    var pops = [];                     // спалахи підбору й польоту впритул
    var combo = 0, comboT = 0;
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function level() { return levels[idx] || { id: "x", bpm: 120, palette: { bg: "0e1024", ring: "2b3060", player: "00e5ff", gem: "ffd54a", spike: "ff3d68" }, sky: {} }; }

    function bake() {
      var L = level();
      pal = L.palette;
      beatSec = 60 / (L.bpm || 120);
      pat = makePattern(L.id);
      var k = Math.max(48, Math.round(S * 0.26));
      art = {
        ball: ballSprite(k, "#" + pal.player),
        gem: gemSprite(Math.round(k * 0.78), "#" + pal.gem),
        spike: spikeSprite(Math.round(k * 0.86), "#" + pal.spike),
      };
      var rnd = seeded(L.id + "sky"), n = Math.round(42 * ((L.sky && L.sky.fill) || 0.5) + 18);
      stars = [];
      for (var i = 0; i < n; i++) stars.push([rnd(), rnd(), 0.6 + rnd() * 1.6, 0.25 + rnd() * 0.6]);
      paintBg();
    }

    /** Фон і зорі — окрема канва: у кадрі це один drawImage. */
    function paintBg() {
      if (!S) return;
      bg.width = Math.round(W * dpr); bg.height = Math.round(H * dpr);
      bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bgx.clearRect(0, 0, W, H);
      bgx.fillStyle = "#" + pal.bg; bgx.fillRect(0, 0, W, H);
      var g = bgx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.78);
      g.addColorStop(0, rgba("#" + pal.player, 0.1));
      g.addColorStop(0.55, rgba("#" + pal.ring, 0.18));
      g.addColorStop(1, "rgba(0,0,0,0)");
      bgx.fillStyle = g; bgx.fillRect(0, 0, W, H);
      bgx.fillStyle = "#fff";
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        bgx.globalAlpha = s[3];
        bgx.beginPath(); bgx.arc(s[0] * W, s[1] * H, s[2], 0, TAU); bgx.fill();
      }
      bgx.globalAlpha = 1;
    }

    /** Канва може бути й не квадратна (екран «телефона»): сцену беремо за меншою
     *  стороною, а центр ставимо вище середини — як поле в самій грі. */
    function size() {
      var r = canvas.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height || r.width;
      S = Math.min(W, H);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H * (opts.cy || 0.5);
      rOut = S * 0.40; rIn = rOut * RATIO;
      bake();
    }

    var angleAt = function (beat) { return -Math.PI / 2 + beat * (TAU / BEATS_PER_LAP); };
    var ringR = function (i) { return i ? rOut : rIn; };

    /** Що стоїть на долі b (візерунок повторюється). */
    function slot(b) { return pat[((b % PATTERN) + PATTERN) % PATTERN]; }

    function ballRing(beat) {
      // м'яч завжди на кільці найближчого кристала попереду
      var b = Math.ceil(beat / 2) * 2;
      return slot(b).ring;
    }

    function step(dt) {
      t += dt;
      if (opts.cycle && levels.length > 1 && t > opts.cycle) {
        var n = (idx + 1) % levels.length;
        idx = n; t = 0; step.last = -1; combo = 0; pops = []; bake();
        if (opts.onLevel) opts.onLevel(n);
      }
      var beat = t / beatSec;
      comboT -= dt;
      if (comboT <= 0) combo = 0;

      // підбір кристала й проліт біля шипа — рівно на долі
      var b = Math.floor(beat);
      if (b !== step.last) {
        step.last = b;
        var s = slot(b);
        var a = angleAt(b), r = ringR(s.ring);
        if (s.gem) { combo = (b % PATTERN === 0) ? 1 : combo + 1; comboT = beatSec * 3.2; pops.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, t: 0, gem: true }); }
        else pops.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, t: 0, gem: false });
      }
      for (var i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > 0.55) pops.splice(i, 1); }
    }
    step.last = -1;

    function draw() {
      var beat = t / beatSec, pulse = Math.pow(1 - (beat % 1), 3);   // дихання в біт
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(bg, 0, 0, W, H);

      // кільця
      var lw = Math.max(2, S * 0.014);
      ctx.lineWidth = lw;
      ctx.strokeStyle = rgba("#" + pal.ring, 0.95);
      ctx.beginPath(); ctx.arc(cx, cy, rOut * (1 + pulse * 0.004), 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, rIn * (1 + pulse * 0.006), 0, TAU); ctx.stroke();
      ctx.strokeStyle = rgba("#" + pal.player, 0.1 + pulse * 0.16);
      ctx.beginPath(); ctx.arc(cx, cy, ringR(ballRing(beat)), 0, TAU); ctx.stroke();

      // те, що попереду: малюємо кілька найближчих долей
      var b0 = Math.floor(beat);
      for (var k = -1; k <= 5; k++) {
        var b = b0 + k, s = slot(b), a = angleAt(b), r = ringR(s.ring);
        var away = b - beat;
        if (away < -0.6 || away > 5) continue;
        var al = away < 0 ? Math.max(0, 1 + away / 0.6) : Math.min(1, (5 - away) / 1.6);
        var img = s.gem ? art.gem : art.spike;
        var px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        ctx.save(); ctx.globalAlpha = al; ctx.translate(px, py);
        if (!s.gem) ctx.rotate(a + Math.PI / 2);
        else ctx.rotate(t * 1.1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
      }

      // спалахи
      for (var i = 0; i < pops.length; i++) {
        var p = pops[i], q = p.t / 0.55;
        ctx.save(); ctx.globalAlpha = (1 - q) * (p.gem ? 0.9 : 0.55);
        ctx.strokeStyle = p.gem ? "#" + pal.gem : "#" + pal.spike;
        ctx.lineWidth = Math.max(1.5, S * 0.006);
        ctx.beginPath(); ctx.arc(p.x, p.y, S * (0.02 + q * 0.07), 0, TAU); ctx.stroke();
        ctx.restore();
      }

      // м'яч: між кільцями їде за 0.22 долі до біта
      var cur = ballRing(beat), nxt = ballRing(beat + 0.5);
      var hop = 1;
      if (cur !== nxt) { var left = (Math.ceil(beat / 2) * 2) - beat; hop = Math.min(1, Math.max(0, 1 - left / 0.45)); }
      var from = ringR(cur), to = ringR(nxt);
      var e = hop < 1 ? 1 - Math.pow(1 - hop, 3) : 1;
      var rr = cur === nxt ? from : from + (to - from) * e;
      var aa = angleAt(beat);
      var bx = cx + Math.cos(aa) * rr, by = cy + Math.sin(aa) * rr;

      // слід
      for (var j = 1; j <= 5; j++) {
        var ta = angleAt(beat - j * 0.055), tr = cur === nxt ? from : rr;
        ctx.save(); ctx.globalAlpha = 0.1 * (1 - j / 6);
        var sc = 0.7 - j * 0.07;
        ctx.drawImage(art.ball, cx + Math.cos(ta) * tr - art.ball.width * sc / 2,
          cy + Math.sin(ta) * tr - art.ball.height * sc / 2, art.ball.width * sc, art.ball.height * sc);
        ctx.restore();
      }
      var bs = 1 + pulse * 0.07;
      ctx.drawImage(art.ball, bx - art.ball.width * bs / 2, by - art.ball.height * bs / 2,
        art.ball.width * bs, art.ball.height * bs);

      // комбо по центру — як у грі
      if (combo > 1) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, comboT / (beatSec * 1.2));
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = rgba("#" + pal.player, 0.9);
        ctx.font = "900 " + Math.round(S * 0.085) + "px Unbounded, system-ui, sans-serif";
        ctx.fillText("x" + combo, cx, cy);
        ctx.restore();
      }
    }

    function frame(now) {
      if (!live) return;
      raf = requestAnimationFrame(frame);
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      step(dt); draw();
    }

    function start() { if (live || reduced) return; live = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop() { live = false; cancelAnimationFrame(raf); }

    var io = new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: 0.1 });
    var onVis = function () { document.hidden ? stop() : start(); };
    var onResize = function () { size(); draw(); };

    size(); draw();
    if (reduced) { /* «менше руху» — одна статична сцена */ } else { io.observe(canvas); }
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);

    return {
      setLevel: function (i) {
        if (!levels[i] || i === idx) return;
        idx = i; t = 0; step.last = -1; combo = 0; pops = [];
        bake(); draw();
      },
      index: function () { return idx; },
      destroy: function () {
        stop(); io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("resize", onResize);
      },
    };
  };
})(window);
