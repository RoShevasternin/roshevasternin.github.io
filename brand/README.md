# Lewydo™ brand kit — Love What You Do

The one source of the Lewydo brand for every Lewydo project: the pictures, the LibGDX atlas, the code of the splash screen
and the heartbeat, the menu signature and About us.

- **The page** (every language of our games; rules, live previews, the splash, About us): https://roshevasternin.github.io/brand/
- **The numbers** (every size, colour, timing, text and file address — for code and for Claude): https://roshevasternin.github.io/brand/brand.json
- **Everything in one file:** https://roshevasternin.github.io/brand/lewydo-brand-kit.zip
- **If the web is blocked** (a sandbox): `git clone --depth 1 https://github.com/RoShevasternin/roshevasternin.github.io` → the `brand/` folder.

## What is inside

| | |
|---|---|
| `kit/png/` | The originals, **@3x** of the design sizes: `brand_back` 624×624 (the glow), `brand_front` 420×420 (the heart), `lewydo` 624×222 (the name), `slogan` 624×57, `brand_line` 438×3. Plus `lockup.png` (the whole Lockup, 624×966) and `pill.png` (the menu Signature pill, 354×108) — all exported from Figma, the same files the games use. |
| `kit/webp/` | The same five pictures, lighter, for websites. |
| `kit/atlas/` | `brand.atlas` + `brand.png` — the LibGDX atlas of the five pictures (`assets/atlas/`, `EnumAtlas.BRAND`). |
| `kit/code/libgdx/` | `LewydoHeartbeat.kt` (package `com.lewydo.brand`), `ABrandLogo.kt`, `ABrandGroup.kt`, `BrandScreen.kt` — replace `yourgame` with your game's package. They use the Lewydo LibGDX base (AdvancedScreen, AConstraintLayout, AAutoLayout). |
| `kit/code/web/` | `lewydo-brand.css` (the mark, the pill, the heartbeat, the splash) and `example.html`. |
| `brand.json` | The standard in numbers. |

## The standard in short

- **Lockup 208×322** (dp): the logo box 208×208 — `brand_back` fills it, `brand_front` 140×140 in the middle — then the name 208×74,
  the slogan 208×19, and the line 146×1, 20 below the slogan.
- **Colours:** background `#0E1024` · glow `#6DF593` · action `#3DDC84` (text on it `#04120A`) · mint `#9DF5C2` · name `#FFFFFF`. Font: **Nunito**.
- **The splash (BrandScreen)** — the first screen of every game, ≈ 3 s: the heart fades in 0.3→1.1 s and beats once at 1.1;
  «Lewydo» comes into focus 0.9→1.5 (scale 1.06→1), the slogan 1.3→1.9; the line opens from the middle 1.7→2.4 (exp5Out);
  0.6 s to take it in → the game's LoaderScreen. The Lockup is in the middle of the screen (76, 239 on 360×800).
- **The loader credits (LoaderScreen)** — on the screen right after the splash (never on the splash itself; only there, not in About us), at the bottom:
  «Powered by LibGDX» / «Developed by Lewydo™» / «Version» + the app's own version name, **read at run time** (Android:
  `BuildConfig.VERSION_NAME`) — never typed in, so it follows every release. Inter Medium 10, line height 12, white 25 %, centred;
  a 360×36 block, 28 above the bottom (+ the safe area). English in every language. The loader itself is the game's own.
  (`brand.json` → `loader.credits`.)
- **The menu signature** — a 28-high pill at the bottom of every menu, centred, 34 from the bottom: the logo 24 + the name, and a ›.
  Tap → About us. It beats once when the menu appears.
- **About us** — the Lockup at top 108, the studio text (every language of our games in `brand.json`), then **«Thank you for playing!» as its own
  last line**: centred, one line in every language (a long one gets smaller, it never wraps; never the end of the paragraph —
  `brand.json` → `about.texts.<lang>.thanks`). «Our website» → https://roshevasternin.github.io/, «Our games on Google Play» → our
  developer page, «© 2026 Lewydo™». The heart beats every time it opens.
- **The heartbeat** — the heart 1.13 → 1 → 1.07 → 1 (0.10 / 0.12 / 0.10 / 0.12 s, sineOut / sineIn); the glow waits 0.05, then
  1.15 → 1.05 (0.12 / 0.28 s) and stays at 1.05. **Once**, when the brand appears — never in a loop. No beat with «reduce motion».

## How we work: prototype first, then the game

- **New things start in the prototype.** A screen, a mechanic, a text or a number is made and tried in the game's web prototype
  first — it's quick to test in a browser.
- **The game is ported from it.** The game (LibGDX: Android, later iOS) takes everything from the prototype, numbers and words one
  to one: the prototype is the reference.
- **Never the other way round.** Something new made only in the game is unknown to the prototype, and the two drift apart. Even a
  fix: first in the prototype, then in the game. (`brand.json` → `workflow`.)

## Rules

- Use the pictures and the code **as they are**. Never redraw, recolour, stretch, rotate or add effects to the mark.
- The slogan is always in English (a trademark); its bold letters spell the name: **L**ov**e** **W**hat **Y**ou **Do** → Lewydo.
- A game may theme **the background and the ambient light** behind the mark to its own world — never the mark itself.
- Keep the mark on a dark background.

## Screen bottom: edge to edge (every game, from 28.10.2026)

The iPhone Home indicator and the Android navigation bar never take space from the game — no empty strip at the bottom.

- **The ad banner sits at the very bottom of the screen, full width** (inline / anchored adaptive). The rounded screen corners may clip it —
  that is fine; never make it narrower. The game content sits right above the banner. On iPhone the banner lies over the Home indicator.
- **No banner** (ads removed or not loaded): the background and everything that scrolls (lists, grids, boards, settings, sheets) goes to the
  very bottom, under the Home indicator / navigation bar, with **a bottom inset of the same height inside the scroll** — the last row can
  always be scrolled above the bar, to be seen and tapped.
- **Buttons that do not scroll stay above the bar**, so the swipe home never lands on a button.
- **iOS:** the Home indicator hides by itself (`prefersHomeIndicatorAutoHidden`; libGDX `hideHomeIndicator = true`) and the first swipe from
  the bottom only shows it (`preferredScreenEdgesDeferringSystemGestures = .bottom`). iOS still shows it after any touch and hides it a few
  seconds later — there is no public API to keep it hidden, do not promise it. **Android:** immersive mode.
- The top stays as before: titles and buttons below the notch / Dynamic Island / status bar.
- **Dims cover the whole screen** (owner 28.10.2026): a window's dim or dark backdrop goes from the very top to the very bottom, under the
  Home indicator / navigation bar too; only the window's content stays in the room above the banner. The banner itself is never dimmed
  (on the phone it is the system's own view over the game).

The full prompt to paste into a game's `CLAUDE.md` — `docs/ux/bottom-edge.md` in the studio site repo.

## Rewarded ads: the button is honest about the ad (every game, from 28.10.2026)

A rewarded ad is loaded before it can play, and after every show the next one loads. A player who sees a dead button leaves — and
the ad was only loading. So every «watch an ad» button shows **three states**:
- **Ready** — the button itself.
- **Loading** — three small cubes lighting up in turn and «Ad is loading…» (`ads.loading`). **Not dimmed** (wait, it is coming), not
  tappable; the moment the ad is there the button comes alive by itself with a small hop.
- **None** — dimmed «No ad right now» (`ads.none`) when there is no ad (offline, no fill); the game keeps trying.
- Both lines share one cell: the button keeps its width in every state. A small button shows only the cubes (loading) or «–» (none).
- The state comes from the ad SDK itself, polled every frame. The daily limit is a separate screen, not a button state.

The full prompt to paste into a game's `CLAUDE.md` — `docs/ux/rewarded-ads.md` in the studio site repo.

© 2026 Lewydo™. The Lewydo mark is ours: use it only in Lewydo projects, and only as this kit shows it.
Nunito is free under the SIL Open Font License.
