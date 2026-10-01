# Lewydo sonic logo + splash v2 — PREVIEW (waiting for the owner's choice; not part of the kit yet)

- `make_sound.py` — synthesises the heartbeat sound in three directions: A «Тук-тук», B «Серце й сяйво» (recommended), C «Бум-бум»
  (`python3 tools/sonic/make_sound.py` → A_heartbeat.wav, B_heart_glow.wav, C_bum_bum.wav, timing.json; 48 kHz stereo; the «lub» hits 30 ms in).
- `preview.template.html` — the preview page (new splash timeline: everything appears first, then the juicy heartbeat with two light waves
  and the words catching the light; the sound on the beats). Fill %BACK% %FRONT% %NAME% %SLOGAN% %LINE% (brand/kit/webp as data URIs),
  %SA% %SB% %SC% (the WAVs as data URIs) and %PRE% (timing.json) → publish as an Artifact.
- Shown to the owner: https://claude.ai/artifact/QcPNM3UapHSBAN1ps62Bmv
- When the owner picks a sound: put it in the kit (brand/kit/sound/: .ogg for LibGDX + a light web copy), the new timeline into
  lewydo-brand.css (.lw-splash), ABrandGroup/LewydoHeartbeat (Kotlin), brand.json, the brand page, CubePix (tools/brand/kit + build_brand.py).
