# Lewydo sonic logo — how it was made (the owner chose **D4 «Бум-бум · м'якше»** on 02.10.2026 — D's heart without the notes; it is in brand/kit/sound/)

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

## Round 5 (01.10.2026) — preview, awaiting the owner's pick
The owner: «треба новий звук — м'який пам-пам»; «візьми щось приємне, що подобається людям, і зроби пам-пам круто»; «це ж
серцебиття, не забувай». So two soft pitched «пам» on the two heartbeats, each played by a sound people already love, shaped like a
real heart: the «lub» lower, stronger and short (it lets go 140 ms in — a breath of quiet), the «dub» higher and softer, then it rings
home (E → A, a fourth up — a real heart's second sound is higher too; also the step of the games' «coin» sound). Under the notes a
soft warm low pulse on each beat (a pure sine, no click, no falling pitch — felt in headphones). Soft onsets (10–90 ms), almost
nothing above 3 kHz, levelled like round 4 (phone band −30 dB), peaks 7–12 dB under D.
- `make_sound5.py` (run from an empty folder with `PYTHONPATH=tools/sonic`; reuses round 4's helpers) → P «Фетр» (recommended:
  a felt piano, E4 → A4 with the octave below), Q «Маримба» (soft mallets, bar modes tuned 1 : 4 : 10; A3+E4 → C#4+A4 and a low A2),
  R «Лоу-фай» (a soft Rhodes, Dmaj9 → Aadd9, a little tape wobble, top rolled off), S «Та-дам» («та» on the lub, «дам» on the dub,
  then a warm A-major bloom like the light leaving the heart) — .wav + .mp3 + timing5.json. **First heartbeat at 0.40 s**, as round 4.
- Lessons: one hammer strikes all three strings of a piano note in phase (random phases made the note's loudness random); a wet
  room swells a pure tone after the hit and blurs two beats into one — keep it small (mix ≈ 0.2) for a heartbeat; pitch wobble
  sweeps the notes through the room's resonances and makes the fade pump — keep it to a few cents.
- `preview5.py <folder> <out.html>` fills `preview5.template.html`. Shown: https://claude.ai/artifact/MbVarxdby2eySozjZAnPww

## Round 6 (02.10.2026) — the owner chose **D4 «Бум-бум · м'якше»** (now in brand/kit/sound/)
The owner: «мені подобається, як звучить наш бум-бум, але треба варіанти такі ж, як наш бум-бум, без дзвінкого «Лев-вай-до»:
залишимо просто анімацію бум-бум серця і під неї відповідний звук». So every sound is D's own heart (two tuned thumps on a felt
mallet, A2 → E2), with D's timing (the lub 30 ms in → the splash keeps starting the sound at 2.09 s), no kalimba notes:
- `make_sound6.py [<kit D .wav>]` (run from an empty folder with `PYTHONPATH=tools/sonic`) → D0 «Бум-бум» (D without the notes —
  checked sample for sample against the kit's file before the first note, at D's level), D1 «Бум-бум і сяйво» (+ C's faint airy
  glow), **D2 «Бум-бум · чути на телефоні»** (recommended: the heart's own overtones brought up and its peaks softly saturated —
  on a phone speaker as loud as D was with its notes, ≈ 5 dB over D0; same peak, ≈ 1.5 dB louder in headphones), D3 «глибше»,
  D4 «м'якше» — .wav + .mp3 + timing6.json.
- Why D2: the heart is low (110 / 82 Hz) and a phone speaker plays almost nothing under 300 Hz — on a phone, D's notes were the
  audible part; without them D0 is ≈ 6 dB quieter there.
- `preview6.py <folder> <out.html>` fills `preview6.template.html` (heart-only animations). Shown: https://claude.ai/artifact/2yJ6fXcAw4KDrX187fHJwi

## Round 7 (06.10.2026) — «гітарне серцебиття», preview awaiting the owner's pick
The owner sent a 1.8 s cut of the intro of sombr — «12 to 12»: «ця мелодія мені подобається… там гітарне серцебиття… як би ти
це зробив під мій бренд, коли б'ється серце, і як би це виглядало». Measured from the cut (it is not kept anywhere — the song is
the artist's): ≈125 BPM; A major (A → D); 75 % of the energy under 250 Hz; the beat in pairs ≈0.11 s apart («та-ДУМ»). Nothing
of the song is used — no sample, riff or melody; every note is synthesised, so the sound is Lewydo's.
- `make_sound7.py <kit D4 .wav> <the game's D4 .wav>` (run from an empty folder; no other module needed) → T «Гітарне серце»
  (recommended: the kit's D4 heart untouched + a guitar on it — a muted A on the lub, an open Amaj7 over the low E on the dub),
  U «Як у пісні» (a muted «та» a 16th before the lub, muted chugs on both beats over a soft double kick, the open A blooms;
  **its lub is 0.15 s in → start it at 1.97 s**), V «Акустика» (thumb on a muted low A, a soft rolled A major, a wooden body),
  W «Додому» (a muted E → an open A, the bass goes up; a warm pulse under each beat), D4_game (the reference) — .wav + .mp3 +
  timing7.json. T, V and W keep D's timing (lub 0.03 s in, the dub 0.28 s later → the splash keeps 2.09 s).
- The guitar: an extended Karplus–Strong string — the delay line starts as the pulled string (a mix of its shape, a triangle
  with the corner at the pluck point, and its speed, a two-level pulse — what a pickup or a bridge passes on), plus a little
  finger noise, through a soft «finger» lowpass; a gentle lowpass in the loop; a linear fractional delay keeps every string in
  tune. Palm-muted = t60 ≈ 0.16 s, dark, a slight settle in pitch and the hand's thud. Strums go string by string (9–12 ms;
  V rolls at 20 ms), each a touch softer and a few cents off. Then a clean amp (soft drive, the neck pickup's warmth, the top
  rolled off at 4.8 kHz), a chorus **only above 280 Hz** (on the low strings a chorus swung the volume ±7 dB) and a hall.
  V is mono-safe (no Haas delay: a phone in portrait plays mono).
- Levels: every file has the same loudness on a phone speaker as the game's D4 (the phone version B, CubePix
  `cubepix-libgdx/assets/sound/lewydo-heartbeat.ogg`): 300 Hz – 3 kHz at −21 dB over the loudest 300 ms; peaks ≤ −1 dBFS
  (a soft ceiling). The ring lasts ≈1.5 s; the files are 2.4 s with a 0.45 s fade.
- `preview7.py <folder> <out.html>` fills `preview7.template.html` (from round 6's page): the five sounds, the splash «як зараз»
  and an idea, «+ струна»: the line under the slogan rings like a guitar string — a lens of light, a short muted twitch on the
  lub (2.12 s), a ringing pluck on the dub (2.40 s). Shown: https://claude.ai/artifact/CoFJYBUeWBF9SzUZFWkW8q
