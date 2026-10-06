# Lewydo sonic logo — round 7 (06.10.2026). The owner sent a 1.8 s cut of the intro of sombr — «12 to 12»: «ця мелодія мені
# подобається… її вступи, там гітарне серцебиття… як би ти це зробив під мій бренд, коли б'ється серце, і як би це виглядало».
# What we took from the song (measured, see README): ≈125 BPM; A major (A → D); the low end carries it (75 % of its energy is
# under 250 Hz); the beat comes in pairs a 16th apart (≈0.11 s) — «ta-DUM» — the guitar heartbeat. What we did NOT take: no
# sample of the song, no riff, no melody. Every sound here is synthesised (numpy/scipy), so it is ours and can go into every game.
# The guitar: an extended Karplus–Strong string (a delay line one period long with a gentle lowpass in the loop, plucked by a
# soft finger at a set point on the string), strummed string by string. Palm-muted is the same string with a hand on it (it
# dies in ~0.15 s and loses its top: the «dum»); open, it rings for seconds. Then a clean amp (warm, a little drive, the cab
# rolls the top off), a slow chorus (the indie shimmer) and a hall.
# The brand rules from rounds 3–6 hold: two clear beats, the lub stronger, a breath of quiet, then the dub that rings; major;
# soft onsets (fingers, no pick); nothing metallic, almost nothing above 4 kHz; heard on a phone speaker — a guitar lives
# exactly where a phone plays (100 Hz – 3 kHz). Every file is levelled to the game's own Lewydo sound on a phone (the phone
# version B of D4: 300 Hz – 3 kHz at −21 dB over the loudest 300 ms), peaks ≤ −1 dBFS.
#   · T «Гітарне серце» (recommended) — our D4 heart exactly as in the kit (A2 → E2) and a guitar on it: a muted A on the lub,
#     an open Amaj7 over the low E on the dub (the heart's own E2) that rings. Timing as now: lub 0.03 s in → the splash keeps 2.09 s.
#   · U «Як у пісні» — the song's feel: a muted pick-up a 16th before the lub («та-ДУМ», like the song's paired hits; it falls on
#     the heart's breath in), the lub and the dub as muted chugs over a soft double kick, then the open A blooms from the dub.
#     Its lub is 0.15 s in → start it at 1.97 s.
#   · V «Акустика» — a warm steel-string acoustic, thumb and fingers: the thumb on a muted low A (lub), a soft rolled A-major
#     chord (dub), the wooden body, a small room. Timing as now.
#   · W «Додому» — the bass goes UP: a muted E (lub) → an open A (dub) — V → I, the oldest «home» in music; a soft warm pulse
#     under both. Timing as now.
# Run from an empty folder:  python3 <repo>/tools/sonic/make_sound7.py <kit D4 .wav> <game D4 .wav>
#   (the kit's brand/kit/sound/lewydo-heartbeat.wav; the game's phone version — e.g. CubePix cubepix-libgdx/assets/sound/
#    lewydo-heartbeat.ogg decoded to .wav — is only the loudness reference)  →  T/U/V/W .wav + .mp3, D4_game.mp3, timing7.json
import json, sys, wave
import numpy as np
from scipy.signal import lfilter, fftconvolve, iirpeak

SR = 48000
PRE, GAP = 0.03, 0.28                 # D's timing: the lub 30 ms into the file, the dub 0.28 s later (splash: 2.12 / 2.40 s)
LEN = 2.4                             # the dub rings ~1.5 s and is gone by ≈ 4.5 s of the splash (it hands over at 3.8 s)
NOTE = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}


def hz(n):
    return 440.0 * 2 ** ((NOTE[n[:-1]] + 12 * (int(n[-1]) - 4)) / 12)


def place(buf, sig, at):
    i = int(round(at * SR)); j = min(len(buf), i + len(sig)); buf[i:j] += sig[:j - i]


def lp(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** (2 * order)), len(x))


def hp(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); f[0] = 1e-3
    return np.fft.irfft(X / np.sqrt(1 + (fc / f) ** (2 * order)), len(x))


# ── the string ────────────────────────────────────────────────────────────────
def pluck(f0, dur=LEN, t60=2.8, bright=0.6, pos=0.2, soft=2800.0, seed=0, cents=0.0, grit=0.25, edge=0.6):
    """One guitar string (extended Karplus–Strong). t60 — seconds to fade by 60 dB (open ≈ 2–4 s, palm-muted ≈ 0.15 s);
    bright 0…1 — how long the upper partials live; pos — where the finger plucks (0.5 = the middle, round; 0.1 = near the
    bridge, twangy); soft — the finger's cutoff (a thumb ≈ 1500 Hz, a fingertip ≈ 2200 Hz — no pick, no click); grit — how
    much of the finger's noise is in the pluck; edge 0…1 — what we hear of the string: 0 its shape (a triangle with the
    corner at the pluck point, partials falling as 1/n² — round, dull), 1 its speed (what a pickup and a guitar's bridge
    pass on: a two-level pulse, partials as 1/n — clear). In between, plus a little noise of the finger."""
    rng = np.random.default_rng(seed)
    f = f0 * 2 ** (cents / 1200)
    D = SR / f
    S = 0.5 * (1 - bright)                           # loop smoothing (two-point average at 0.5: the darkest)
    N = int(np.floor(D - S)); d = D - S - N          # + a linear fractional delay, so every string is in tune
    c = np.convolve([1 - d, d], [1 - S, S])          # taps N, N+1, N+2 behind
    g = 10 ** (-3 / (f * t60))                       # the loop's loss per period
    u = np.arange(N + 2) / (N + 2); p = float(np.clip(pos, 0.05, 0.5))
    tri = np.where(u < p, u / p, (1 - u) / (1 - p)); tri -= tri.mean()   # the pulled string, its corner at the pluck point
    vel = np.where(u < p, 1 - p, -p)                                     # its speed: a two-level pulse (zero mean)
    nz = rng.standard_normal(N + 2); k = max(1, int(round(p * N))); nz[k:] = nz[k:] - nz[:-k]   # the finger's noise, same point
    e = (1 - edge) * tri / np.abs(tri).max() + edge * vel / np.abs(vel).max() + grit * nz / (np.abs(nz).max() + 1e-12)
    a = np.exp(-2 * np.pi * soft / SR); e = lfilter([1 - a], [1, -a], e)   # a finger: no top, no click
    x = np.zeros(int(dur * SR)); x[:len(e)] = e
    A = np.zeros(N + 3); A[0] = 1.0; A[N:N + 3] -= g * c
    y = lfilter([1.0], A, x)
    y = lfilter([1, -1], [1, -0.995], y)             # no DC
    return y / (np.abs(y).max() + 1e-12)


def glide(x, cents=14.0, tau=0.03):
    """A hard-plucked string starts a little sharp and settles (its tension relaxes): the «chug» of a muted note."""
    t = np.arange(len(x)) / SR
    r = 2 ** (cents * np.exp(-t / tau) / 1200)
    return np.interp(np.cumsum(r) - r[0], np.arange(len(x)), x, right=0.0)


def muted(notes, vel=1.0, seed=0, t60=0.16, soft=1700.0, thud=0.35):
    """A palm-muted stroke: the strings die fast and dark, a slight settle in pitch, and the hand's thud in the body."""
    out = np.zeros(int(0.7 * SR))
    for i, n in enumerate(notes):
        s = glide(pluck(hz(n), 0.7, t60=t60, bright=0.12, pos=0.13, soft=soft, seed=seed + i, cents=RNG.normal(0, 2)))
        place(out, s * (1 - 0.12 * i), 0.004 * i)
    t = np.arange(len(out)) / SR
    f = hz(notes[0])
    out += thud * np.sin(2 * np.pi * f * t) * np.minimum(t / 0.004, 1) * np.exp(-t / 0.05)
    return out * vel / len(notes) ** 0.5


def strum(notes, vel=1.0, seed=0, spread=0.010, t60=2.8, bright=0.6, soft=2800.0, pos=0.22, up=False, roll=None):
    """Strings one after another (a downstroke goes low → high; `up` the other way; `roll` = a slow harp-like roll),
    each a touch softer and slightly out of tune with the others — a real hand on six strings."""
    order = notes[::-1] if up else notes
    gap = roll if roll else spread
    out = np.zeros(int(LEN * SR))
    for i, n in enumerate(order):
        s = pluck(hz(n), LEN, t60=t60 * (1.15 if hz(n) < 120 else 1.0), bright=bright, pos=pos + 0.03 * np.sin(i),
                  soft=soft, seed=seed + 10 * i, cents=RNG.normal(0, 2.5))
        place(out, s * (1 - 0.05 * i) * (0.9 + 0.1 * RNG.random()), gap * i)
    return out * vel / len(notes) ** 0.5


# ── the instrument and the room ───────────────────────────────────────────────
def amp(x, drive=1.25, top=4800.0):
    """A clean amp: a little warmth (soft drive), the cab rolls off the top, nothing under 70 Hz."""
    pk = np.abs(x).max() + 1e-12
    y = np.tanh(drive * x / pk) / np.tanh(drive) * pk
    b, a = iirpeak(230, 1.2, SR); y = y + 0.35 * lfilter(b, a, y)            # the neck pickup's warmth
    return hp(lp(y, top, 2), 70, 1)


def body(x):
    """A steel-string acoustic's wooden box: the air (≈100 Hz), the top (≈200 / 390 Hz), a little of the box (≈1 kHz)."""
    y = x * 0.6
    for f, q, g in ((98, 4, 0.55), (196, 5, 0.45), (390, 4, 0.35), (1050, 3, 0.15)):
        b, a = iirpeak(f, q, SR); y += g * lfilter(b, a, x)
    return hp(lp(y, 5200, 2), 60, 1)


def chorus(x, rate=0.7, depth=0.0018, base=0.0085, mix=0.42, split=280.0):
    """Two slowly moving copies, opposite in phase left and right: the shimmer and width of an indie clean guitar. Only
    above `split`: on the low strings a chorus swirls the volume up and down (it was ±7 dB on the low E) — they stay dry."""
    n = np.arange(len(x)); t = n / SR; hi = hp(x, split, 2); low = x - hi; out = []
    for ph in (0.0, np.pi):
        dl = (base + depth * np.sin(2 * np.pi * rate * t + ph)) * SR
        out.append(low + (1 - mix) * hi + mix * np.interp(n - dl, n, hi, left=0.0))
    return out


def hall(L, R, secs=2.2, mix=0.26, pre=0.016, damp=3600, seed=1):
    """A soft hall: early reflections, then a dense dark tail, different left and right."""
    rng = np.random.default_rng(seed); n = int(secs * SR); t = np.arange(n) / SR; out = []
    for ch, x in enumerate((L, R)):
        ir = rng.standard_normal(n) * np.exp(-t * 6.9 / secs) * np.minimum(t / 0.03, 1)
        ir = lp(ir, damp, 1); ir = np.concatenate([np.zeros(int(pre * SR)), ir])
        for ms, g in ((11 + 3 * ch, .5), (19 - 2 * ch, .35), (29 + 4 * ch, .25), (41, .18)):
            ir[int(ms / 1000 * SR)] += g * np.abs(ir).max()
        ir /= np.sqrt((ir ** 2).sum())
        out.append((1 - mix) * x + mix * fftconvolve(x, ir)[:len(x)] * 1.6)
    return out


def pulse(t, at, f, amp=1.0, d=0.1):
    """A soft warm low pulse on a beat (a pure sine, a 14 ms rise, no click): the chest of the heartbeat in headphones."""
    tt = np.maximum(t - at, 0)
    return np.sin(2 * np.pi * f * tt) * np.clip(tt / 0.014, 0, 1) * np.exp(-tt / d) * amp * (t >= at)


def kick(t, at, amp=1.0):
    """A soft round kick (the song's paired hits, but gentle): a sine falling 95 → 50 Hz, no click."""
    tt = np.maximum(t - at, 0)
    f = 50 + 45 * np.exp(-tt / 0.035)
    ph = 2 * np.pi * np.cumsum(f * (t >= at)) / SR
    return np.sin(ph) * np.clip(tt / 0.003, 0, 1) * np.exp(-tt / 0.11) * amp * (t >= at)


# ── loudness: the same as the game's sound on a phone ─────────────────────────
def phone_db(m, lo=300, hi=3000, win=0.3):
    X = np.fft.rfft(m); f = np.fft.rfftfreq(len(m), 1 / SR); X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, len(m)); w = int(win * SR)
    return 10 * np.log10(np.convolve(y ** 2, np.ones(w) / w, 'valid').max())


def read(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, w.getnchannels()) / 32768
    assert w.getframerate() == SR, p
    return x[:, 0], x[:, -1]


def write(L, R, name, target_db=None):
    """Pad to LEN, fade the tail, level to `target_db` on a phone (None: leave the file as it is — the reference)."""
    n = int(LEN * SR); L, R = (np.pad(v, (0, max(0, n - len(v))))[:n] for v in (L, R))
    if target_db is not None:
        fade = int(0.45 * SR); w = np.ones(n); w[-fade:] = np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
        L, R = L * w, R * w
        g = 10 ** ((target_db - phone_db((L + R) / 2)) / 20); L, R = L * g, R * g
    pk = max(np.abs(L).max(), np.abs(R).max()); ceil = 10 ** (-1 / 20)
    if target_db is not None and pk > ceil * 0.85:            # a soft ceiling: the transients round off, the body stays
        k = ceil * 0.85
        L, R = [np.where(np.abs(v) > k, np.sign(v) * (k + (ceil - k) * np.tanh((np.abs(v) - k) / (ceil - k))), v) for v in (L, R)]
    pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
    with wave.open(name + '.wav', 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
    import lameenc
    e = lameenc.Encoder(); e.set_bit_rate(192); e.set_in_sample_rate(SR); e.set_channels(2); e.set_quality(2)
    open(name + '.mp3', 'wb').write(e.encode(pcm.tobytes()) + e.flush())
    m = (L + R) / 2
    print(f'{name:16s} phone {phone_db(m):6.1f} dB  peak {20 * np.log10(max(np.abs(L).max(), np.abs(R).max())):5.1f} dBFS  '
          f'full {10 * np.log10(np.convolve(m ** 2, np.ones(int(.3 * SR)) / int(.3 * SR), "valid").max()):6.1f} dB')


RNG = np.random.default_rng(12)
AMAJ7_E = ['E2', 'A2', 'E3', 'G#3', 'C#4', 'E4']       # 0-0-2-1-2-0: Amaj7 over the open low E — dreamy, the heart's E2 in the bass
A_OPEN = ['A2', 'E3', 'A3', 'C#4', 'E4']               # x-0-2-2-2-0
A5 = ['A2', 'E3']                                      # the muted «dum»: root and fifth
E5 = ['E2', 'B2', 'E3']


def T(kit):
    """«Гітарне серце»: the kit's D4 heart, untouched, and the guitar on it — muted A on the lub, open Amaj7/E on the dub."""
    n = int(LEN * SR); t = np.arange(n) / SR
    g = np.zeros(n)
    place(g, muted(A5, 1.0, seed=1), PRE - 0.002)
    place(g, strum(AMAJ7_E, 0.95, seed=2, spread=0.009, t60=2.2), PRE + GAP - 0.012)   # the bulk of the strum lands on the dub
    gL, gR = chorus(amp(g))
    gL, gR = hall(gL, gR, 2.2, 0.24, seed=3)
    hL, hR = (np.pad(v, (0, n - len(v))) for v in kit)
    k = 0.9 * max(np.abs(hL).max(), np.abs(hR).max()) / max(np.abs(gL).max(), np.abs(gR).max())   # the guitar ≈ the heart's peak
    return hL + gL * k, hR + gR * k


def U():
    """«Як у пісні»: та-ДУМ … ДУМ — a muted pick-up a 16th before the lub, muted chugs on both beats over a soft double kick,
    and from the dub the open A blooms (an up-stroke, quieter, into a bigger hall)."""
    pre = PRE + 0.12; n = int(LEN * SR); t = np.arange(n) / SR
    g = np.zeros(n)
    place(g, muted(['A3', 'E3'], 0.42, seed=11, t60=0.09, thud=0.1), pre - 0.12)       # «та» — light, high, short
    place(g, muted(A5, 1.0, seed=12), pre)                                            # «ДУМ» — the lub
    place(g, muted(['A2', 'E3', 'A3'], 0.78, seed=13), pre + GAP)                     # the dub, a chug too
    place(g, strum(A_OPEN, 0.62, seed=14, spread=0.012, t60=2.0, bright=0.6, up=True), pre + GAP + 0.03)   # and it opens
    gL, gR = chorus(amp(g, drive=1.35), rate=0.6, mix=0.48)
    k = kick(t, pre - 0.12, 0.45) + kick(t, pre, 1.0) + kick(t, pre + GAP, 0.75)
    L, R = gL + 0.55 * k, gR + 0.55 * k
    return hall(L, R, 2.4, 0.3, seed=15), pre


def V():
    """«Акустика»: the thumb on a muted low A (lub), then a soft rolled A major with the fingers (dub); a wooden body, a small room."""
    n = int(LEN * SR); t = np.arange(n) / SR
    g = np.zeros(n)
    place(g, muted(['A2'], 1.0, seed=21, t60=0.2, soft=1300, thud=0.55), PRE)
    place(g, strum(A_OPEN, 0.9, seed=22, roll=0.02, t60=1.9, bright=0.5, soft=1900, pos=0.3), PRE + GAP - 0.03)   # rolled around the dub
    b = body(g)
    L, R = b.copy(), b.copy()                                     # mono-safe (a phone in portrait plays mono); the room adds width
    L = L + pulse(t, PRE, hz('A1'), 0.25, 0.09); R = R + pulse(t, PRE, hz('A1'), 0.25, 0.09)
    return hall(L, R, 1.4, 0.18, damp=3000, seed=23)


def W():
    """«Додому»: the bass goes up — a muted E (lub) → an open A (dub), V → I; a warm pulse under each beat (E1 → A1)."""
    n = int(LEN * SR); t = np.arange(n) / SR
    g = np.zeros(n)
    place(g, muted(E5, 1.0, seed=31), PRE - 0.002)
    place(g, strum(A_OPEN, 0.95, seed=32, spread=0.010, t60=2.2), PRE + GAP - 0.012)
    gL, gR = chorus(amp(g))
    p = pulse(t, PRE, hz('E2'), 0.5, 0.11) + pulse(t, PRE + GAP, hz('A2'), 0.38, 0.12)
    return hall(gL + p, gR + p, 2.2, 0.24, seed=33)


if __name__ == '__main__':
    kit, game = sys.argv[1], sys.argv[2]
    gL, gR = read(game)
    target = phone_db((gL + gR) / 2)                                  # the game's sound on a phone: the level to match
    print(f'the game\'s D4 on a phone: {target:.1f} dB')
    write(gL, gR, 'D4_game')
    write(*T(read(kit)), 'T_guitar_heart', target)
    (uL, uR), upre = U()
    write(uL, uR, 'U_like_the_song', target)
    write(*V(), 'V_acoustic', target)
    write(*W(), 'W_home', target)
    json.dump({'T': PRE, 'U': upre, 'V': PRE, 'W': PRE, 'D4': PRE, 'gap': GAP}, open('timing7.json', 'w'))
