# Lewydo sonic logo — round 2. The owner liked C («Бум-бум»), found B beautiful but too loud.
# Principles: short (≤1.8 s), soft (all files levelled to the same quiet loudness, peaks ≤ −6 dBFS), warm (nothing bright above ~4 kHz),
# heard on a phone speaker (a ~200 Hz «knock» in every beat), synced to the picture, consonant and ending «home» (on the tonic).
import numpy as np, wave, json
from make_sound import thump, mallet, shimmer, reverb, lowpass, place, env_exp, t_, SR, PRE, GAP

def kalimba(freq, dur=1.2, tau=0.38, amp=1.0):        # a warm tine: round fundamental, a soft inharmonic «ting» that dies fast
    t = t_(dur)
    return amp * (np.sin(2 * np.pi * freq * t) * env_exp(len(t), tau, 0.004)
                  + 0.22 * np.sin(2 * np.pi * freq * 5.95 * t) * env_exp(len(t), tau * 0.10, 0.002)
                  + 0.08 * np.sin(2 * np.pi * freq * 2.0 * t) * env_exp(len(t), tau * 0.5, 0.004))
def finish(L, R, name, rms_db=-23.0, peak_db=-6.0):
    """Level every sound to the same loudness (RMS over its loudest 600 ms), never louder than peak_db."""
    fade = int(0.1 * SR); w = np.ones(len(L)); w[-fade:] = np.linspace(1, 0, fade); L, R = L * w, R * w
    m = (L + R) / 2; win = int(0.6 * SR); r = np.sqrt(np.convolve(m ** 2, np.ones(win) / win, 'valid').max())
    g = min(10 ** (rms_db / 20) / r, 10 ** (peak_db / 20) / max(np.abs(L).max(), np.abs(R).max()))
    L, R = L * g, R * g
    with wave.open(name, 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.stack([L, R], 1) * 32767).astype('<i2').tobytes())
    print(name, f'{len(L) / SR:.2f} s', f'gain {20 * np.log10(g):+.1f} dB')
def beats_C(L, amp=1.0, second=(82.41, 104, 50)):    # C's heart: two soft tuned thumps on a felt mallet (A2, then the second note)
    place(L, thump(f0=90, f1=44, click=0.08) * 0.75 * amp, PRE); place(L, mallet(110.0, 0.5) * 0.55 * amp, PRE)
    f2, a0, a1 = second
    place(L, thump(f0=a0, f1=a1, tau=0.06, click=0.06) * 0.51 * amp, PRE + GAP); place(L, mallet(f2, 0.5) * 0.38 * amp, PRE + GAP)

D = 2.6
# B·soft — «Серце й сяйво», тихіше: the same idea, the heart softer, the glow 7 dB lower, darker and shorter
L = np.zeros(int(D * SR)); place(L, thump() * 0.8, PRE); place(L, thump(f0=114, f1=54, tau=0.058, click=0.12) * 0.58, PRE + GAP)
L = reverb(L, mix=0.12); R = L.copy()
sl, sr = shimmer([587.33, 739.99, 880.0], amp=0.05, attack=0.16, tau=0.5); sl, sr = lowpass(sl, 2600), lowpass(sr, 2600)
place(L, sl, PRE + GAP + 0.05); place(R, sr, PRE + GAP + 0.05)
L, R = reverb(L, 1.5, 0.18, 4), reverb(R, 1.5, 0.18, 5); finish(L, R, 'B2_soft_glow.wav')

# C — «Бум-бум» (the favourite), levelled like the others
L = np.zeros(int(D * SR)); beats_C(L); R = L.copy()
sl, sr = shimmer([440.0, 659.26, 830.61], dur=2.0, amp=0.07, tau=0.6); place(L, sl, PRE + GAP + 0.03); place(R, sr, PRE + GAP + 0.03)
L, R = reverb(L, 1.6, 0.2, 6), reverb(R, 1.6, 0.2, 7); finish(L, R, 'C_bum_bum.wav')

# D — «Бум-бум · Le-wy-do»: C's heart, then the name sung by three soft kalimba notes, short-short-long like «Le-wy-dó»,
# rising through the A major chord and landing home on A (C#5 → E5 → A5); the words light up on these notes
NOTES = [(0.30, 554.37, 0.9), (0.42, 659.26, 0.85), (0.56, 880.0, 1.0)]     # (after the dub, Hz, level)
L = np.zeros(int(D * SR)); beats_C(L, 0.95); R = L.copy()
for k, (dt, f, a) in enumerate(NOTES):
    s = kalimba(f, tau=0.30 if k < 2 else 0.55) * 0.20 * a; pan = (-0.25, 0.0, 0.25)[k]
    place(L, s * (1 - pan) / 1.2, PRE + GAP + dt); place(R, s * (1 + pan) / 1.2, PRE + GAP + dt)
L, R = reverb(L, 1.6, 0.2, 8), reverb(R, 1.6, 0.2, 9); finish(L, R, 'D_lewydo.wav')

# E — «Тепле серце»: the heart rises a fifth (A2 → E3: opening, hopeful) instead of falling, and a low warm pad instead of a shimmer
L = np.zeros(int(D * SR)); beats_C(L, 1.0, second=(164.81, 118, 58)); R = L.copy()
pl, pr = shimmer([220.0, 277.18, 329.63], dur=2.0, attack=0.22, tau=0.55, amp=0.06, spread=0.35); pl, pr = lowpass(pl, 1800), lowpass(pr, 1800)
place(L, pl, PRE + GAP + 0.04); place(R, pr, PRE + GAP + 0.04)
L, R = reverb(L, 1.5, 0.2, 10), reverb(R, 1.5, 0.2, 11); finish(L, R, 'E_warm_rise.wav')

# F — «Шепіт»: the quietest — a muffled heartbeat, as if heard with an ear to a chest, and one tiny glint
L = np.zeros(int(D * SR)); place(L, lowpass(thump(click=0.05), 900), PRE); place(L, lowpass(thump(f0=110, f1=52, tau=0.055, click=0.04), 900) * 0.6, PRE + GAP)
R = L.copy(); g = kalimba(1318.51, tau=0.25) * 0.05; place(L, g * 0.8, PRE + GAP + 0.32); place(R, g, PRE + GAP + 0.32)
L, R = reverb(L, 1.2, 0.14, 12), reverb(R, 1.2, 0.14, 13); finish(L, R, 'F_whisper.wav', rms_db=-26.0)

json.dump({'pre': PRE, 'gap': GAP, 'motif_after_dub': [n[0] for n in NOTES]}, open('timing2.json', 'w'))
