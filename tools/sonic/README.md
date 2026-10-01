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

## Round 3 (01.10.2026) — preview, awaiting the owner's pick
The owner: D's three kalimba notes («тілілінь») «вдаряють у мозок»; wants something soft and not tiring, clear but pleasant like
a Mac start-up sound, and maybe only the heartbeat; the name, slogan and line should no longer light up — «просто тук-тук».
- `make_sound3.py` (run from an empty folder with `PYTHONPATH=tools/sonic`) → G «Бум-бум» (C's tuned heart, no notes),
  H «Тук-тук» (a natural lub-dub), I «Тук-тук і тепло» (the heart + a low warm A-major chord blooming under the second beat),
  J «Тепла нота» (closest to a Mac chime: one round A-major chord on the second beat) — .wav + .mp3. No high tines: nothing
  above ~2 kHz; RMS −24 dBFS, peaks ≤ −8; a soft wooden «tok» on A4/E4 in every heart so it is heard on a phone speaker.
- `preview3.py <folder> <out.html>` fills `preview3.template.html` (animations: «Серце й хвилі світла» / «Лише серце» / the current one
  with the words lighting up; the current D for comparison). Shown to the owner: https://claude.ai/artifact/GFU3uPSCt9fLNE1WUSpSF4

## Round 4 (01.10.2026) — preview, awaiting the owner's pick
The owner on round 3: «це ніби тук-тук помилки», and above all «не різко, а м'яко, щоб не злити юзера». A short dull thump that
falls (A2 → E2) is how phones say «error»; so round 4 is the opposite: soft major chords whose top voice rises, soft attacks
(15–400 ms), long calm fades, only harmonic tones (no metal), levelled by loudness in the phone band (300 Hz – 3 kHz, −30 dB;
quieter than D there, peaks 5–8 dB lower). No knock at all; the sound swells or strikes with the heart on the screen.
- `make_sound4.py` (run from an empty folder with `PYTHONPATH=tools/sonic`) → N «Серце в акорді» (recommended: a warm chord that
  itself beats twice with the heart and glows brighter on each beat), K «Світанок» (closest to a Mac chime), M «Струни» (strings
  swell into the heart, a fifth up on the dub), L «Та-да» (two soft electric-piano chords, open → full) — .wav + .mp3 + timing4.json.
  **Their first heartbeat sits 0.40 s into the file** (a swell starts before it): start the file at 2.12 − 0.40 = 1.72 s of the splash.
- `preview4.py <folder> <out.html>` fills `preview4.template.html`. Shown: https://claude.ai/artifact/D5PUn1MkP1b56tJaf6RBCU
