/* Lewydo — our anonymous visit counter (owner 12.11.2026; the same as on orbitdash.lewydo.com and cubepix.lewydo.com).
   One small message to our own counter at stats.lewydo.com (Cloudflare Worker lewydo-site-stats → Workers Analytics Engine) when a page
   opens: {s, p, e, c, src} and nothing else — no cookies, no storage, no ids; the IP address is not stored, Workers logs are off.
   The contract and the server: Game-Orbit-Dash-PRIVATE/server/site-stats/README.md. Privacy: /privacy.html#visit-counter.
     s   "st" — this site (lewydo.com)
     p   the page: home · privacy · other (brand, 404)
     e   "view" — this site has no analytics and no consent bar, so it never sends allow / decline
     c   "none" — no consent choice exists here
     src a coarse source label, worked out here on the device: utm_source (lower case, not an id) → the kind of site in the referrer
         (only its host) → the TikTok / Instagram / Facebook in-app browser (the TikTok bio links to the bare lewydo.com/, and that
         browser often sends no referrer; the user agent itself is never sent) → "none".
   {{page}} is set by tools/build.mjs for each page. */
(function () {
  "use strict";
  var STATS = "https://stats.lewydo.com/h", PAGE = "{{page}}";
  var REF = [
    // youtube before google: com.google.android.youtube is the YouTube app, not the search
    ["youtube", /(^|\.)youtube\.com$|(^|\.)youtu\.be$|^com\.google\.android\.youtube$/],
    ["google", /(^|\.)google\.[a-z.]+$|^com\.google\.android\./],
    ["bing", /(^|\.)bing\.com$/],
    ["duckduckgo", /(^|\.)duckduckgo\.com$/],
    ["tiktok", /(^|\.)tiktok\.com$|(^|\.)tiktokv\.com$|^com\.zhiliaoapp\.musically/],
    ["instagram", /(^|\.)instagram\.com$|^com\.instagram\./],
    ["facebook", /(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)messenger\.com$|^com\.facebook\./],
    ["x", /(^|\.)x\.com$|(^|\.)twitter\.com$|^t\.co$/],
    ["reddit", /(^|\.)reddit\.com$|(^|\.)redd\.it$/],
    ["discord", /(^|\.)discord\.com$|(^|\.)discord\.gg$|(^|\.)discordapp\.com$/],
    ["telegram", /^t\.me$|(^|\.)telegram\.org$|(^|\.)telegram\.me$|^org\.telegram\./],
  ];
  // the in-app browser (when there is no referrer): the user agent is read ONLY here, to pick one of three labels — it goes nowhere
  var APP = [
    ["tiktok", /musical_ly|TikTok|Bytedance|trill_/i],
    ["instagram", /Instagram/],
    ["facebook", /FBAN|FBAV|FB_IAB|FBIOS/],
  ];
  function inApp() {
    var ua = String(navigator.userAgent || "");
    for (var i = 0; i < APP.length; i++) if (APP[i][1].test(ua)) return APP[i][0];
    return "none";
  }
  function refKind(h) {
    if (h === location.hostname) return "self";                       // a step inside this site
    if (h === "lewydo.com" || h === "www.lewydo.com") return "studio";
    if (h === "orbitdash.lewydo.com") return "orbitdash";
    if (h === "cubepix.lewydo.com") return "cubepix";
    if (/(^|\.)lewydo\.com$/.test(h)) return "studio";
    for (var i = 0; i < REF.length; i++) if (REF[i][1].test(h)) return REF[i][0];
    return "other";
  }
  function source() {
    try {
      // a campaign tag, lower case; anything that looks like an identifier (long hex / digits) is not taken: a label never points at a person
      var u = (new URLSearchParams(location.search).get("utm_source") || "").toLowerCase();
      if (u && /^[a-z0-9_.-]{1,32}$/.test(u) && !/^[0-9a-f]{12,}$|\d{6,}/.test(u)) return u;
      if (document.referrer) {
        var h = new URL(document.referrer).hostname.toLowerCase();
        if (h) return refKind(h);
      }
      return inApp();
    } catch (e) { return "none"; }
  }
  var sent = false;
  function view() {
    if (sent) return;
    sent = true;
    try {
      if (!navigator.sendBeacon) return;
      navigator.sendBeacon(STATS, JSON.stringify({ s: "st", p: PAGE, e: "view", c: "none", src: source() }));
    } catch (e) { /* the counter never matters more than the page */ }
  }
  try {
    if (document.prerendering) document.addEventListener("prerenderingchange", view, { once: true });   // counted when really opened
    else view();
  } catch (e) { /* */ }
})();
