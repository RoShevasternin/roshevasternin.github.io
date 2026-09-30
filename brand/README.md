# Lewydo™ brand kit — Love What You Do

The one source of the Lewydo brand for every Lewydo project: the pictures, the LibGDX atlas, the code of the splash screen
and the heartbeat, the menu signature and About us.

- **The page** (rules, live previews, the splash, About us in 15 languages): https://roshevasternin.github.io/brand/
- **The numbers** (every size, colour, timing, text and file address — for code and for Claude): https://roshevasternin.github.io/brand/brand.json
- **Everything in one file:** https://roshevasternin.github.io/brand/lewydo-brand-kit.zip
- **If the web is blocked** (a sandbox): `git clone --depth 1 https://github.com/RoShevasternin/roshevasternin.github.io` → the `brand/` folder.

## What is inside

| | |
|---|---|
| `kit/png/` | The originals, **@3x** of the design sizes: `brand_back` 624×624 (the glow), `brand_front` 420×420 (the heart), `lewydo` 624×222 (the name), `slogan` 624×57, `brand_line` 438×3. Plus pictures made from them: `lockup.png` (the whole Lockup), `signature.png`, `pill.png` (the menu signature). |
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
- **The menu signature** — a 28-high pill at the bottom of every menu, centred, 34 from the bottom: the logo 24 + the name, and a ›.
  Tap → About us. It beats once when the menu appears.
- **About us** — the Lockup at top 108, the studio text (15 languages in `brand.json`), «Our website» → https://roshevasternin.github.io/,
  «Our games on Google Play» → our developer page, «© 2026 Lewydo™». The heart beats every time it opens.
- **The heartbeat** — the heart 1.13 → 1 → 1.07 → 1 (0.10 / 0.12 / 0.10 / 0.12 s, sineOut / sineIn); the glow waits 0.05, then
  1.15 → 1.05 (0.12 / 0.28 s) and stays at 1.05. **Once**, when the brand appears — never in a loop. No beat with «reduce motion».

## Rules

- Use the pictures and the code **as they are**. Never redraw, recolour, stretch, rotate or add effects to the mark.
- The slogan is always in English (a trademark); its bold letters spell the name: **L**ov**e** **W**hat **Y**ou **Do** → Lewydo.
- A game may theme **the background and the ambient light** behind the mark to its own world — never the mark itself.
- Keep the mark on a dark background.

© 2026 Lewydo™. The Lewydo mark is ours: use it only in Lewydo projects, and only as this kit shows it.
Nunito is free under the SIL Open Font License.
