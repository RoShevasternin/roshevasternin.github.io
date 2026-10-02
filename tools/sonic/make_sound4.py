# Lewydo sonic logo — round 4 (01.10.2026). The owner on round 3: «це ніби тук-тук помилки»; and above all «щоб це було
# не різко, а м'яко — щоб не злити юзера».
# He is right: a short dull thump that falls (A2 → E2) is exactly how phones say «error». So round 4 goes the other way:
#   · major and rising (the top voice goes up) — the ear hears «yes / ready», like a start-up chime;
#   · sustained, with a soft attack (12–40 ms) and a long calm fade — error sounds are short and dry;
#   · clear but not sharp: smooth harmonic tones only (no metallic, inharmonic partials — those were the «тілілінь»),
#     brightness tracks the loudness and closes as the sound fades;
#   · it lives where a phone speaker plays (200 Hz – 3 kHz), with a soft sub only for headphones;
#   · it still beats with the heart: the sound swells or strikes on the «lub» and the «dub» of the animation.
# Pure synthesis (numpy/scipy), 48 kHz stereo. Each file has its «lub» at PRE4 seconds (so a swell can start before it).
# Run from an empty folder:  PYTHONPATH=<repo>/tools/sonic python3 <repo>/tools/sonic/make_sound4.py
import json, wave
import numpy as np
from scipy.signal import fftconvolve

SR = 48000
PRE4 = 0.40                 # the «lub» lands 0.40 s into every file (the animation's lub: 2.12 s → start the file at 1.72 s)
GAP = 0.28                  # lub → dub, as in the animation (2.17 → 2.45)
RNG = np.random.default_rng(42)


def hz(note):
    """'A3' → Hz (equal temperament, A4 = 440)."""
    names = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    return 440.0 * 2 ** ((names[note[:-1]] + 12 * (int(note[-1]) - 4)) / 12)


def t_(d):
    return np.arange(int(d * SR)) / SR


def smooth_attack(t, a):
    x = np.clip(t / max(a, 1e-4), 0, 1)
    return 0.5 - 0.5 * np.cos(np.pi * x)


def swell(t, at, rise, fall, amp=1.0):
    """A soft bump: raised-cosine rise to `at`, exponential fall after it."""
    up = np.where(t < at, smooth_attack(t - (at - rise), rise), 1.0)
    down = np.where(t >= at, np.exp(-(t - at) / fall), 1.0)
    return amp * up * down * (t >= at - rise)


# ── voices ───────────────────────────────────────────────────────────────────
def tone(f, t, amp_env, bright, detune=0.0, kind='saw', top=9000.0, phase=None):
    """Additive, band-limited tone. `bright` (Hz, array or number) is a 2-pole lowpass applied per harmonic over time:
    brighter when it swells, darker as it fades. kind: 'saw' (warm, full), 'tri' (soft, hollow), 'sine'."""
    f = f * 2 ** (detune / 1200)
    x = np.zeros(len(t))
    bright = np.broadcast_to(bright, t.shape)
    for k in range(1, 64):
        fk = f * k
        if fk > top:
            break
        if kind == 'sine' and k > 1:
            break
        a = 1.0 / k if kind == 'saw' else ((1.0 / k ** 2) if k % 2 else 0.0) if kind == 'tri' else 1.0
        if a == 0.0:
            continue
        g = 1.0 / np.sqrt(1.0 + (fk / bright) ** 4)
        ph = RNG.uniform(0, 2 * np.pi) if phase is None else phase * k
        x += a * g * np.sin(2 * np.pi * fk * t + ph)
    return x * amp_env


def ensemble(f, t, amp_env, bright, voices=5, spread=9.0, kind='saw', width=0.7):
    """Several slightly detuned copies, panned across the stereo field — a warm, wide «pad / strings» sound."""
    L = np.zeros(len(t)); R = np.zeros(len(t))
    offs = np.linspace(-spread, spread, voices)
    for i, d in enumerate(offs):
        v = tone(f, t, amp_env, bright, detune=d, kind=kind)
        pan = (i / (voices - 1) - 0.5) * 2 * width if voices > 1 else 0.0
        L += v * np.sqrt((1 - pan) / 2); R += v * np.sqrt((1 + pan) / 2)
    return L / voices ** 0.5, R / voices ** 0.5


def epiano(f, t, at, vel=1.0, tau=1.3):
    """A soft electric piano (two-operator FM, ratio 1:1, no metal tine): a clear, round strike that mellows quickly."""
    tt = np.maximum(t - at, 0)
    on = (t >= at).astype(float)
    index = (0.75 * vel * np.exp(-tt / 0.18) + 0.15) * on              # only a hint of brightness, then round
    env = smooth_attack(tt, 0.014) * (0.55 * np.exp(-tt / 0.4) + 0.45 * np.exp(-tt / tau)) * on   # 14 ms: no click
    car = np.sin(2 * np.pi * f * tt + index * np.sin(2 * np.pi * f * tt))
    body = 0.25 * np.sin(2 * np.pi * 2 * f * tt + 0.4) * smooth_attack(tt, 0.014) * np.exp(-tt / 0.5) * on
    return (car + body) * env * vel


def sub(f, t, env):
    return np.sin(2 * np.pi * f * t) * env


# ── space and finishing ──────────────────────────────────────────────────────
def fft_lp(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** (2 * order)), len(x))


def fft_hp(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); f[0] = 1e-3
    return np.fft.irfft(X / np.sqrt(1 + (fc / f) ** (2 * order)), len(x))


def hall(L, R, secs=2.4, mix=0.28, pre=0.018, damp=4200, seed=1):
    """A soft hall: a few early reflections, then a dense decaying tail (different for L and R → width), dark above `damp`."""
    rng = np.random.default_rng(seed)
    n = int(secs * SR); t = np.arange(n) / SR
    out = []
    for ch, x in enumerate((L, R)):
        ir = rng.standard_normal(n) * np.exp(-t * 6.9 / secs) * smooth_attack(t, 0.03)
        ir = fft_lp(ir, damp, 1)
        ir = np.concatenate([np.zeros(int(pre * SR)), ir])
        for (ms, g) in ((11 + 3 * ch, .5), (19 - 2 * ch, .35), (29 + 4 * ch, .25), (41, .18)):
            ir[int(ms / 1000 * SR)] += g * np.abs(ir).max()
        ir /= np.sqrt((ir ** 2).sum())
        wet = fftconvolve(x, ir)[:len(x)]
        out.append((1 - mix) * x + mix * wet * 1.6)
    return out


def phone_rms(m, lo=300, hi=3000, win=0.3):
    """Loudness where a phone speaker plays (300 Hz – 3 kHz), over the loudest 300 ms — that is what a player hears."""
    X = np.fft.rfft(m); f = np.fft.rfftfreq(len(m), 1 / SR); X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, len(m)); w = int(win * SR)
    return np.sqrt(np.convolve(y ** 2, np.ones(w) / w, 'valid').max())


def finish(L, R, name, phone_db=-30.0, peak_db=-9.0):
    """Clean the lows (no rumble), a touch of warmth, and the SAME loudness on a phone speaker for every file —
    a little under the current sound D (whose phone band peaks with its sharp notes), never louder than peak_db.
    The owner: «головне — м'яко, щоб не злити юзера». Fade the tail; write .wav and a light .mp3 for the preview page."""
    L, R = fft_hp(L, 32), fft_hp(R, 32)
    L, R = np.tanh(1.1 * L / np.abs(L).max()), np.tanh(1.1 * R / np.abs(R).max())
    fade = int(0.25 * SR); w = np.ones(len(L)); w[-fade:] = np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
    w[:64] = np.linspace(0, 1, 64)
    L, R = L * w, R * w
    g = min(10 ** (phone_db / 20) / phone_rms((L + R) / 2), 10 ** (peak_db / 20) / max(np.abs(L).max(), np.abs(R).max()))
    L, R = L * g, R * g
    pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
    with wave.open(name, 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
    try:
        import lameenc
        e = lameenc.Encoder(); e.set_bit_rate(192); e.set_in_sample_rate(SR); e.set_channels(2); e.set_quality(2)
        open(name.replace('.wav', '.mp3'), 'wb').write(e.encode(pcm.tobytes()) + e.flush())
    except ImportError:
        pass
    print(name, f'{len(L) / SR:.2f} s', f'gain {20 * np.log10(g):+.1f} dB')


LUB, DUB = PRE4, PRE4 + GAP


# ── K «Світанок»: one warm, full chord on the «lub», like a start-up chime; on the «dub» it breathes and opens ──
def K():
    t = t_(3.4)
    chord = ['A2', 'E3', 'A3', 'C#4', 'E4', 'A4']
    env = smooth_attack(t - LUB, 0.022) * (t >= LUB) * (0.55 * np.exp(-(t - LUB) / 0.5) + 0.45 * np.exp(-(t - LUB) / 1.6))
    env = env * (1 + swell(t, DUB + 0.04, 0.10, 0.45, 0.22))          # the second heartbeat: a soft breath, no new hit
    bright = 900 + 2600 * np.exp(-np.maximum(t - LUB, 0) / 0.55) + 700 * swell(t, DUB + 0.04, 0.1, 0.4)
    L = np.zeros(len(t)); R = np.zeros(len(t))
    for i, n in enumerate(chord):
        a = (0.9, 0.75, 0.8, 0.7, 0.62, 0.42)[i]
        l, r = ensemble(hz(n), t, env * a, bright, voices=3, spread=5, width=0.5)
        L += l; R += r
        ep = epiano(hz(n), t, LUB + 0.004 * i, vel=0.55 * a) * 0.55            # a soft strike for clarity
        L += ep * (0.6 + 0.08 * i); R += ep * (1.0 - 0.08 * i)
    s = sub(hz('A1'), t, smooth_attack(t - LUB, 0.03) * (t >= LUB) * np.exp(-(t - LUB) / 0.9)) * 0.35
    L += s; R += s
    L, R = hall(L, R, 2.6, 0.26, seed=41)
    finish(L, R, 'K_dawn.wav')


# ── L «Та-да»: two soft strikes on the two beats — an open chord that resolves upward (E4 → A4 on top): «ready» ──
def L_():
    t = t_(3.2)
    first = ['A2', 'E3', 'B3', 'E4']                 # Aadd9, open and waiting
    second = ['A2', 'E3', 'A3', 'C#4', 'E4', 'A4']    # A major, full: the B steps home to A, the top rises to A4
    L = np.zeros(len(t)); R = np.zeros(len(t))
    for at, notes, vel in ((LUB, first, 0.75), (DUB, second, 0.9)):
        for i, n in enumerate(notes):
            ep = epiano(hz(n), t, at + 0.006 * i, vel=vel * (1.0 if i else 0.85), tau=1.1 if at == LUB else 1.6)
            if at == LUB:                                  # the first chord yields to the second
                ep *= np.where(t < DUB, 1.0, np.exp(-(t - DUB) / 0.12))
            pan = (i / max(1, len(notes) - 1) - 0.5) * 0.6
            L += ep * np.sqrt((1 - pan) / 2); R += ep * np.sqrt((1 + pan) / 2)
    env = smooth_attack(t - DUB + 0.02, 0.12) * (t >= DUB - 0.02) * np.exp(-np.maximum(t - DUB, 0) / 1.3)
    for n, a in (('A3', 0.30), ('C#4', 0.24), ('E4', 0.22)):              # a quiet pad under the resolution
        l, r = ensemble(hz(n), t, env * a, 1800, voices=3, spread=6)
        L += l; R += r
    L, R = hall(L, R, 2.4, 0.3, seed=43)
    finish(L, R, 'L_tada.wav')


# ── M «Струни»: warm strings swell in with the breath before the heart, peak on the «lub», rise a fifth on the «dub» ──
def M():
    t = t_(3.6)
    base = swell(t, LUB, 0.38, 1.3)                                       # breath in → lub
    env2 = swell(t, DUB + 0.03, 0.12, 1.1)                                # the top voice enters on the dub
    bright = 500 + 2400 * (0.7 * base + 0.5 * env2)                       # the bow opens the sound as it swells
    L = np.zeros(len(t)); R = np.zeros(len(t))
    for n, a in (('A2', 0.8), ('E3', 0.7), ('C#4', 0.55), ('E4', 0.55)):
        l, r = ensemble(hz(n), t, base * a, bright, voices=5, spread=10, width=0.8)
        L += l; R += r
    l, r = ensemble(hz('A4'), t, env2 * 0.5, bright, voices=5, spread=8, width=0.6)   # E4 → A4: rising, «yes»
    L += l; R += r
    s = sub(hz('A1'), t, swell(t, LUB, 0.3, 0.7) * 0.4 + swell(t, DUB, 0.08, 0.5) * 0.25)
    L += s; R += s
    L, R = hall(L, R, 2.8, 0.3, seed=45)
    finish(L, R, 'M_strings.wav')


# ── N «Серце в акорді»: no knock at all — a soft glowing chord that itself beats twice with the heart, like B's glow ──
def N():
    t = t_(3.4)
    beat = swell(t, LUB, 0.07, 0.30, 1.0) + swell(t, DUB, 0.06, 0.55, 0.75)    # lub, dub — the shape of lwBloom
    bed = smooth_attack(t - (LUB - 0.25), 0.25) * (t >= LUB - 0.25) * np.exp(-np.maximum(t - DUB, 0) / 1.4)
    env = 0.35 * bed + 0.65 * np.minimum(beat, 1.2)
    bright = 700 + 2200 * np.minimum(beat, 1.2)                              # it glows brighter on each beat
    L = np.zeros(len(t)); R = np.zeros(len(t))
    for n, a in (('A2', 0.55), ('E3', 0.6), ('A3', 0.7), ('C#4', 0.6), ('E4', 0.55), ('B4', 0.28)):
        l, r = ensemble(hz(n), t, env * a, bright, voices=4, spread=7, kind='saw', width=0.7)
        L += l; R += r
    s = sub(hz('A1'), t, np.minimum(beat, 1.2) * 0.45)                       # felt in headphones, no click
    L += s; R += s
    L, R = hall(L, R, 2.6, 0.32, seed=47)
    finish(L, R, 'N_heart_chord.wav')


if __name__ == "__main__":
    K(); L_(); M(); N()
    json.dump({'pre': PRE4, 'gap': GAP}, open('timing4.json', 'w'))
