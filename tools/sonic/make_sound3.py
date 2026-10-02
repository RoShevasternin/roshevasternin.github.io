# Lewydo sonic logo — round 3 (01.10.2026). The owner: D's three notes («тілілінь») «вдаряють у мозок»; wants something soft
# and not tiring, clear but pleasant «як звук увімкнення Мака», and maybe only the heartbeat — «просто тук-тук».
# So: no high tines at all, everything under ~2.5 kHz, soft attacks, a little quieter than round 2 (RMS −24 dBFS, peaks ≤ −8).
# Run from tools/sonic → G_bum_bum.wav, H_tuk_tuk.wav, I_tuk_warm.wav, J_warm_note.wav (+ .mp3 for the preview page).
import numpy as np, wave
from make_sound import thump, mallet, reverb, lowpass, place, env_exp, t_, SR, PRE, GAP

D = 2.6


def finish(L, R, name, rms_db=-24.0, peak_db=-8.0):
    """The same loudness for every sound (RMS over its loudest 600 ms), never louder than peak_db."""
    fade = int(0.12 * SR); w = np.ones(len(L)); w[-fade:] = np.linspace(1, 0, fade); L, R = L * w, R * w
    m = (L + R) / 2; win = int(0.6 * SR); r = np.sqrt(np.convolve(m ** 2, np.ones(win) / win, 'valid').max())
    g = min(10 ** (rms_db / 20) / r, 10 ** (peak_db / 20) / max(np.abs(L).max(), np.abs(R).max()))
    L, R = L * g, R * g
    with wave.open(name, 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.stack([L, R], 1) * 32767).astype('<i2').tobytes())
    try:                                                   # a light copy for the preview page
        import lameenc
        e = lameenc.Encoder(); e.set_bit_rate(160); e.set_in_sample_rate(SR); e.set_channels(2); e.set_quality(2)
        mp3 = e.encode((np.stack([L, R], 1) * 32767).astype('<i2').tobytes()) + e.flush()
        open(name.replace('.wav', '.mp3'), 'wb').write(mp3)
    except ImportError:
        pass
    print(name, f'{len(L) / SR:.2f} s', f'gain {20 * np.log10(g):+.1f} dB')


def heart_C(L, amp=1.0, presence=1.0):
    """The heart the owner liked in C: two soft tuned thumps on a felt mallet, A2 then E2 (a falling fourth).
    `presence` adds the same two notes two octaves up as a short, dry wooden «tok» (A4, E4; filtered, no ringing tine):
    a phone's small speaker cannot play anything under ~300 Hz, so without it the heart is almost silent on a phone."""
    place(L, thump(f0=90, f1=44, click=0.08) * 0.75 * amp, PRE); place(L, mallet(110.0, 0.5) * 0.55 * amp, PRE)
    place(L, thump(f0=104, f1=50, tau=0.06, click=0.06) * 0.51 * amp, PRE + GAP); place(L, mallet(82.41, 0.5) * 0.38 * amp, PRE + GAP)
    if presence:
        place(L, knock(440.0) * 0.30 * amp * presence, PRE + 0.004)
        place(L, knock(329.63) * 0.24 * amp * presence, PRE + GAP + 0.004)


def knock(freq, dur=0.4, tau=0.07):
    """A soft wooden «tok»: fundamental and a little octave, a 3 ms attack and a fast fade — heard, not rung."""
    t = t_(dur)
    x = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * 2 * freq * t + 0.6)
    return lowpass(x * env_exp(len(t), tau, 0.003), 1500)


def felt(freq, dur=2.0, attack=0.04, tau=0.8, partials=5, slope=2.0, detune=0.0):
    """A felt-piano / soft-organ voice: round, no bright edge (partials fall fast, the high ones die first)."""
    t = t_(dur); x = np.zeros(len(t))
    for n in range(1, partials + 1):
        f = freq * n * (1 + detune / 1200 * np.log(2) * 1)          # a tiny detune (cents) for warmth
        x += np.sin(2 * np.pi * f * t + n * 0.7) * env_exp(len(t), tau / n ** 0.5, attack) / n ** slope
    return x


def chord(freqs, dur=2.2, attack=0.04, tau=0.9, partials=6, slope=1.6, amp=0.1, cut=2400, spread=1.0):
    """A soft chord, two slightly detuned sides (stereo width without chorus wobble), filtered warm."""
    L = sum(felt(f, dur, attack, tau, partials, slope, -spread) for f in freqs)
    R = sum(felt(f, dur, attack, tau, partials, slope, +spread) for f in freqs)
    return lowpass(L, cut) * amp, lowpass(R, cut) * amp


if __name__ == "__main__":
    # G — «Бум-бум»: D without the three notes — only C's tuned heart, in a small warm room
    L = np.zeros(int(D * SR)); heart_C(L); R = L.copy()
    L, R = reverb(L, 1.4, 0.18, 21), reverb(R, 1.4, 0.18, 22); finish(L, R, 'G_bum_bum.wav')

    # H — «Тук-тук»: the most natural heartbeat — lub-dub like a real heart, deep and soft, its «knock» heard on a phone
    L = np.zeros(int(D * SR)); place(L, thump(click=0.10, warmth=1.1), PRE); place(L, thump(f0=112, f1=53, tau=0.056, click=0.08, warmth=1.1) * 0.68, PRE + GAP)
    L = lowpass(L, 2600); R = L.copy()
    L, R = reverb(L, 1.2, 0.15, 23), reverb(R, 1.2, 0.15, 24); finish(L, R, 'H_tuk_tuk.wav')

    # I — «Тук-тук і тепло»: the heart, and from the second beat a low warm chord quietly blooms under it (A major, low, felt)
    L = np.zeros(int(D * SR)); heart_C(L, 0.95); R = L.copy()
    cl, cr = chord([220.0, 277.18, 329.63, 440.0], dur=2.1, attack=0.09, tau=0.75, partials=5, slope=1.8, amp=0.09, cut=1700)
    place(L, cl, PRE + GAP + 0.02); place(R, cr, PRE + GAP + 0.02)
    L, R = reverb(L, 1.6, 0.2, 25), reverb(R, 1.6, 0.2, 26); finish(L, R, 'I_tuk_warm.wav')

    # J — «Тепла нота»: closest to a Mac start-up sound — the heart softly, then on the second beat one round, rich chord
    # (A major spread over two octaves) with a gentle swell and a long calm fade; clear, but nothing sharp
    L = np.zeros(int(3.2 * SR)); heart_C(L, 0.7); R = L.copy()
    cl, cr = chord([110.0, 164.81, 220.0, 277.18, 329.63, 440.0], dur=2.8, attack=0.035, tau=0.85, partials=7, slope=1.5, amp=0.06, cut=2200)
    place(L, cl, PRE + GAP); place(R, cr, PRE + GAP)
    L, R = reverb(L, 1.8, 0.22, 27), reverb(R, 1.8, 0.22, 28); finish(L, R, 'J_warm_note.wav')
