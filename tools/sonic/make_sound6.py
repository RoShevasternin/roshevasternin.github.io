# Lewydo sonic logo — round 6 (02.10.2026). The owner: «мені подобається, як звучить наш бум-бум, але треба варіанти такі ж,
# як наш бум-бум, без дзвінкого «Лев-вай-до»: залишимо просто анімацію бум-бум серця і під неї відповідний звук».
# So every sound here is D's own heart — the same two tuned thumps on a felt mallet (A2 → E2), the same timing (the «lub»
# 30 ms into the file, the «dub» 0.28 s later, so the kit's splash keeps starting the sound at 2.09 s) — with no kalimba notes:
#   · D0 «Бум-бум» — exactly D without the three notes, sample for sample (checked against the kit's file), at D's level;
#   · D1 «Бум-бум і сяйво» — the same heart and, from the dub, C's faint airy glow (soft sines, no tine): the heart's light;
#   · D2 «Бум-бум · чути на телефоні» — the same heart, its own overtones brought up and the thump gently saturated (the brain
#     hears the low beat from its overtones: «missing fundamental»), so a phone's small speaker plays it as loud as D's notes
#     were — no extra knock, the overtones follow the beat; the same peak as D0, ≈ 1 dB louder in headphones;
#   · D3 «Бум-бум · глибше» — the same heart, a little lower and bigger: more chest, a longer room;
#   · D4 «Бум-бум · м'якше» — the same heart, rounder: almost no «skin» click, the top rolled off, a touch quieter.
# Run from an empty folder:  PYTHONPATH=<repo>/tools/sonic python3 <repo>/tools/sonic/make_sound6.py [<kit D .wav>]
import json, sys, wave
import numpy as np
from make_sound import thump, mallet, shimmer, reverb, lowpass, place, SR, PRE, GAP

LEN = 2.2                                        # the heart and its room; D was 2.6 s only because of the notes


def heart(amp=0.95, deep=0.0, soft=0.0):
    """D's heart (make_sound2.beats_C at 0.95): A2 «lub» and E2 «dub», each a soft tuned thump plus a felt mallet.
    deep — lower thumps and more sub; soft — less of the click («skin»)."""
    L = np.zeros(int(LEN * SR))
    k = 1 - 0.12 * deep                                          # deep: the thump's pitch a little lower
    place(L, thump(f0=90 * k, f1=44 * k, click=0.08 * (1 - soft), sub=0.42 + 0.3 * deep, tau=0.068 * (1 + 0.25 * deep)) * 0.75 * amp, PRE)
    place(L, mallet(110.0, 0.5, tau=0.2 * (1 + 0.3 * deep)) * 0.55 * amp, PRE)
    place(L, thump(f0=104 * k, f1=50 * k, tau=0.06 * (1 + 0.25 * deep), click=0.06 * (1 - soft), sub=0.42 + 0.3 * deep) * 0.51 * amp, PRE + GAP)
    place(L, mallet(82.41, 0.5, tau=0.2 * (1 + 0.3 * deep)) * 0.38 * amp, PRE + GAP)
    return L


def band(x, lo, hi, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); f[0] = 1e-3
    g = 1 / np.sqrt(1 + (lo / f) ** (2 * order)) / np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(X * g, len(x))


def overtones(x, amount):
    """Bass for small speakers: the low beat (60–250 Hz) through a gentle curve (even + odd harmonics), keep only what a
    phone plays (220 Hz – 1.6 kHz). The harmonics carry the beat's own envelope, so it is the same «бум», now audible."""
    low = band(x, 60, 250)
    h = low / (np.abs(low).max() + 1e-12)
    y = np.abs(h) * 0.8 + 0.5 * h ** 3 + 0.25 * np.tanh(3 * h)
    return band(y, 220, 1600) * np.abs(low).max() * amount


def write(L, R, name, gain):
    fade = int(0.1 * SR); w = np.ones(len(L)); w[-fade:] = np.linspace(1, 0, fade)
    L, R = L * w * gain, R * w * gain
    pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
    with wave.open(name, 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
    try:
        import lameenc
        e = lameenc.Encoder(); e.set_bit_rate(192); e.set_in_sample_rate(SR); e.set_channels(2); e.set_quality(2)
        open(name.replace('.wav', '.mp3'), 'wb').write(e.encode(pcm.tobytes()) + e.flush())
    except ImportError:
        pass
    print(name, f'{len(L) / SR:.2f} s', f'peak {20 * np.log10(max(np.abs(L).max(), np.abs(R).max())):.1f} dBFS')


def d_gain(kit_wav):
    """D's own gain: D was levelled with its notes, so take the factor that makes our heart match the kit's file before the
    first note (0 … 0.6 s) — then D0 is D's heart at exactly the level the owner knows."""
    L, R = reverb(heart(), 1.6, 0.2, 8), reverb(heart(), 1.6, 0.2, 9)
    w = wave.open(kit_wav); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, w.getnchannels()) / 32768
    n = int(0.6 * SR)
    g = (x[:n, 0] @ L[:n]) / (L[:n] @ L[:n])
    err = np.abs(x[:n, 0] - g * L[:n]).max()
    print(f'D gain {20 * np.log10(g):+.2f} dB, max difference from the kit file before the notes: {err:.5f}')
    return g


if __name__ == "__main__":
    kit = sys.argv[1] if len(sys.argv) > 1 else 'brand/kit/sound/lewydo-heartbeat.wav'
    g = d_gain(kit)

    # D0 — «Бум-бум»: D without the notes
    L, R = reverb(heart(), 1.6, 0.2, 8), reverb(heart(), 1.6, 0.2, 9)
    write(L, R, 'D0_bum_bum.wav', g)

    # D1 — «Бум-бум і сяйво»: + C's faint airy glow from the dub (A4 · E5 · G#5, soft sines, as loud as in C, a little darker)
    L = heart(); R = L.copy()
    sl, sr = shimmer([440.0, 659.26, 830.61], dur=1.8, amp=0.07, tau=0.55, attack=0.12)
    sl, sr = lowpass(sl, 2400), lowpass(sr, 2400)
    place(L, sl, PRE + GAP + 0.03); place(R, sr, PRE + GAP + 0.03)
    L, R = reverb(L, 1.6, 0.2, 8), reverb(R, 1.6, 0.2, 9)
    write(L, R, 'D1_bum_glow.wav', g)

    # D2 — «Бум-бум · чути на телефоні»: + the heart's own overtones, the thump's peaks softly saturated (more overtones,
    # lower peaks), then the same peak as D0 — on a phone ≈ 5 dB louder than D0, as loud as D was with its notes
    H = heart(); L = H + overtones(H, 1.4); pk = np.abs(L).max(); L = np.tanh(2.5 * L / pk) / np.tanh(2.5) * pk; R = L.copy()
    L, R = reverb(L, 1.6, 0.2, 8), reverb(R, 1.6, 0.2, 9)
    d0 = g * max(np.abs(reverb(H, 1.6, 0.2, 8)).max(), np.abs(reverb(H, 1.6, 0.2, 9)).max())
    write(L, R, 'D2_bum_phone.wav', d0 / max(np.abs(L).max(), np.abs(R).max()))

    # D3 — «Бум-бум · глибше»: lower, more chest, a longer room
    L = heart(deep=1.0); R = L.copy()
    L, R = reverb(L, 2.0, 0.24, 8), reverb(R, 2.0, 0.24, 9)
    write(L, R, 'D3_bum_deep.wav', g * 0.9)

    # D4 — «Бум-бум · м'якше»: no click, the top rolled off, 2 dB quieter
    L = lowpass(heart(soft=0.85), 1100); R = L.copy()
    L, R = reverb(L, 1.6, 0.2, 8), reverb(R, 1.6, 0.2, 9)
    write(L, R, 'D4_bum_soft.wav', g * 10 ** (-2 / 20) * 1.08)

    json.dump({'pre': PRE, 'gap': GAP}, open('timing6.json', 'w'))
