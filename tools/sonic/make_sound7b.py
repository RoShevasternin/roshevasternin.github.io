# Lewydo sonic logo — round 7b (06.10.2026). On round 7 the owner asked whether «ось це прям звучання» (the sombr — «12 to 12»
# cut itself) could be used. No: it is the artist's recording (a claim takes the game off Google Play and the sites off GitHub).
# He chose «зроби наш звук максимально схожим». So these are round 7's own guitars (our notes, our synthesis) brought to the
# song's SOUND, measured from the cut and kept here only as numbers:
#   · its tone curve — a third-octave long-term spectrum (TARGET below): a big low end, a bright guitar up to ~6 kHz with air;
#     round 7 was 8–30 dB darker above 1 kHz. A matching EQ (the classic «match EQ» of mixing) brings ours to it;
#   · its density — the cut is mastered: a crest of 7.9 dB (ours 13.7) → a gentle compressor glues the strokes and the ring;
#   · its width — almost mono (side/mid 0.10; ours 0.61) → the guitars sit in the middle, the room stays a little wide;
#   · its bass — a bass guitar under the paired hits (75 % of the cut's energy is under 250 Hz).
# Variants (same levels as round 7: the game's D4 on a phone, 300 Hz – 3 kHz at −21 dB, peaks ≤ −1 dBFS):
#   · X «Як у пісні · ближче» (recommended) — U's pattern («та-ДУМ … ДУМ», the chord blooms) + a bass, matched. Lub 0.15 s in.
#   · Y «Гітарне серце · ближче» — T (our D4 heart + the guitar), matched. D's timing (lub 0.03 s).
#   · Z «Додому · ближче» — W (a muted E → an open A) + a bass going up, matched. D's timing.
# Run from an empty folder:  PYTHONPATH=<repo>/tools/sonic python3 <repo>/tools/sonic/make_sound7b.py <kit D4 .wav> <game D4 .wav>
#   → X/Y/Z .wav + .mp3 and timing7b.json (round 7's files are made by make_sound7.py; the page shows both)
import json, sys
import numpy as np
from scipy.signal import welch
import make_sound7 as m7
from make_sound7 import SR, PRE, GAP, LEN, hz, place, pluck, muted, strum, amp, chorus, hall, kick, pulse, read, write, phone_db

# the cut's long-term tone, third-octave bands 50 Hz … 10 kHz, dB relative to its 200 Hz – 3 kHz average (measured 06.10.2026)
BANDS = 1000 * 2 ** (np.arange(-14, 11) / 3)
TARGET = np.array([19, 16, 20, 14, 14, 15, 11, 7, 6, 6, 3, 1, 0, -2, -4, -5, -4, -7, -10, -11, -11, -14, -16, -19, -21], float)


def ltas(x):
    f, P = welch(x, SR, nperseg=8192)
    out = np.array([10 * np.log10(P[(f >= c / 2 ** (1 / 6)) & (f < c * 2 ** (1 / 6))].mean() + 1e-20) for c in BANDS])
    return out - out[(BANDS > 200) & (BANDS < 3000)].mean()


def match(L, R, strength=0.85, passes=2):
    """A matching EQ: a smooth curve (third-octave steps, ±15 dB at most) that moves our long-term tone to TARGET."""
    for _ in range(passes):
        d = np.clip(TARGET - ltas((L + R) / 2), -15, 15)
        d = np.convolve(np.pad(d, 1, mode='edge'), np.ones(3) / 3, 'valid') * strength
        f = np.fft.rfftfreq(len(L), 1 / SR)
        g = 10 ** (np.interp(np.log(np.maximum(f, 1)), np.log(BANDS), d) / 20)
        g[f < 30] *= (np.maximum(f[f < 30], 1) / 30) ** 2                  # nothing under 30 Hz
        L, R = (np.fft.irfft(np.fft.rfft(v) * g, len(v)) for v in (L, R))
    return L, R


def glue(L, R, ratio=3.0, thresh_db=-14.0, att=0.004, rel=0.12):
    """A gentle compressor on the mix (10 ms RMS detector): the strokes, the ring and the room sit together, like a master."""
    m = (L + R) / 2; w = int(0.01 * SR)
    env = np.sqrt(np.convolve(m ** 2, np.ones(w) / w, 'same')) / (np.abs(m).max() + 1e-12)
    lvl = 20 * np.log10(env + 1e-9); over = np.maximum(lvl - thresh_db, 0)
    gr = over * (1 - 1 / ratio)
    a, r = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR)); s = 0.0; sm = np.empty_like(gr)
    for i, v in enumerate(gr):
        s = a * s + (1 - a) * v if v > s else r * s + (1 - r) * v; sm[i] = s
    g = 10 ** (-sm / 20)
    return L * g, R * g


def narrow(L, R, side=0.45):
    mid, sd = (L + R) / 2, (L - R) / 2 * side
    return mid + sd, mid - sd


def bass(notes_at, n):
    """A bass guitar: a round, finger-plucked low string, half muted, on the beats."""
    b = np.zeros(n)
    for note, at, v in notes_at:
        place(b, pluck(hz(note), 0.9, t60=0.55, bright=0.25, pos=0.3, soft=900, seed=int(at * 1000), edge=0.4) * v, at)
    return b


def finish(L, R):
    """Narrow → match the tone → glue (after the EQ, so the boosted low end is held too) → a last touch of the tone."""
    L, R = narrow(L, R)
    L, R = match(L, R)
    L, R = glue(L, R, ratio=4.0, thresh_db=-20.0)
    L, R = match(L, R, strength=0.6, passes=1)
    return limit(L, R)


def limit(L, R, drive=2.4):
    """The master's limiter, softly: the sharp peaks of the strokes round off (a tanh curve), the body stays — the cut's density."""
    pk = max(np.abs(L).max(), np.abs(R).max()) + 1e-12
    return (np.tanh(drive * v / pk) / np.tanh(drive) * pk for v in (L, R))


def X():
    (L, R), pre = m7.U()
    n = len(L); b = bass([('A1', pre - 0.12, 0.5), ('A1', pre, 1.0), ('A1', pre + GAP, 0.8)], n)
    L, R = L + 0.55 * b, R + 0.55 * b
    return finish(L, R), pre


def Y(kit):
    return finish(*m7.T(kit))


def Z():
    L, R = m7.W(); n = len(L)
    b = bass([('E1', PRE, 1.0), ('A1', PRE + GAP, 0.85)], n)
    return finish(L + 0.5 * b, R + 0.5 * b)


if __name__ == '__main__':
    kit, game = sys.argv[1], sys.argv[2]
    gL, gR = read(game); target = phone_db((gL + gR) / 2)
    (xl, xr), xpre = X()
    write(xl, xr, 'X_closer_song', target)
    write(*Y(read(kit)), 'Y_closer_heart', target)
    write(*Z(), 'Z_closer_home', target)
    json.dump({'X': xpre, 'Y': PRE, 'Z': PRE}, open('timing7b.json', 'w'))
