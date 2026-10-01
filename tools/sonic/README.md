# Lewydo sonic logo — how it was made (the owner chose **D «Бум-бум · Le-wy-do»**; it is in brand/kit/sound/)

- `make_sound.py` — synthesises the heartbeat sound in three directions: A «Тук-тук», B «Серце й сяйво» (recommended), C «Бум-бум»
  (`python3 tools/sonic/make_sound.py` → A_heartbeat.wav, B_heart_glow.wav, C_bum_bum.wav, timing.json; 48 kHz stereo; the «lub» hits 30 ms in).
- `make_sound2.py` — round 2 (the owner: B is beautiful but loud, C liked): every sound levelled to RMS −23 dBFS (peaks ≈ −10),
  B2 «B м'якше», C «Бум-бум», D «Бум-бум · Le-wy-do» (C + three kalimba notes C#5–E5–A5 in the rhythm of the name; the words light up on
  them), E «Тепле серце» (the second beat rises a fifth), F «Шепіт» → *.wav, timing2.json. Run from tools/sonic.
- `preview.template.html` — the preview page (new splash timeline: everything appears first, then the juicy heartbeat with two light waves
  and the words catching the light; the sound on the beats). Fill %BACK% %FRONT% %NAME% %SLOGAN% %LINE% (brand/kit/webp as data URIs),
  %SC% %SD% %SE% %SB2% %SF% (the round-2 WAVs as data URIs) and %PRE% (timing.json) → publish as an Artifact.
- Shown to the owner: https://claude.ai/artifact/QcPNM3UapHSBAN1ps62Bmv
- Done: D is in the kit (brand/kit/sound/: .ogg for LibGDX + a light web copy), the new timeline into
  lewydo-brand.css (.lw-splash), ABrandGroup/LewydoHeartbeat (Kotlin), brand.json, the brand page, CubePix (tools/brand/kit + build_brand.py).
