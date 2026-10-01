# Lewydo sonic logo — the heartbeat («lub-dub») that ends the brand splash. Pure synthesis (numpy), so we own every sample.
# Three directions to choose from; each file starts PRE seconds before the «lub» transient (to sync with the animation).
import numpy as np, wave, json
SR = 48000
PRE = 0.03              # the lub hits 30 ms into the file
GAP = 0.28              # lub → dub, a natural S1–S2 interval
def t_(d): return np.arange(int(d * SR)) / SR
def env_exp(n, tau, attack=0.004):
    t = np.arange(n) / SR; a = np.clip(t / attack, 0, 1); return a * a * (3 - 2 * a) * np.exp(-np.maximum(t - attack, 0) / tau)
def place(buf, sig, at):
    i = int(at * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[:j - i]
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def thump(f0=100, f1=48, dur=0.36, tau=0.068, sweep=0.045, click=0.2, sub=0.42, warmth=1.25):
    t = t_(dur)
    f = f1 + (f0 - f1) * np.exp(-t / sweep)                    # the pitch falls like a soft kick: the «tuk»
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_exp(len(t), tau)
    low = np.sin(2 * np.pi * f1 * t) * env_exp(len(t), tau * 1.45, 0.010) * sub   # the chest: a sub under it
    rng = np.random.default_rng(7)
    n = lowpass(rng.standard_normal(len(t)), 1400) * env_exp(len(t), 0.006, 0.0008) * click   # the skin of the beat
    # the knock: a short overtone around 200 Hz — so the beat is heard on a phone's small speaker too, not only felt in headphones
    knock = (np.sin(2 * np.pi * (f0 * 2.05) * t + 0.3) * env_exp(len(t), 0.034, 0.002) * 0.95
             + np.sin(2 * np.pi * (f0 * 3.6) * t + 1.1) * env_exp(len(t), 0.018, 0.0015) * 0.42)
    x = body + low + n + knock
    return np.tanh(warmth * x) / np.tanh(warmth)                # a little warmth, no harshness
def mallet(freq, dur=1.1, tau=0.2, amp=1.0):                    # a soft tuned «bum»: wood/felt mallet on a low bar
    t = t_(dur)
    x = (np.sin(2 * np.pi * freq * t) * env_exp(len(t), tau, 0.003)
         + 0.32 * np.sin(2 * np.pi * freq * 3.98 * t) * env_exp(len(t), tau * 0.18, 0.002)
         + 0.12 * np.sin(2 * np.pi * freq * 9.1 * t) * env_exp(len(t), tau * 0.07, 0.001))
    return amp * x
def shimmer(freqs, dur=2.2, attack=0.09, tau=0.75, amp=0.16, spread=0.5):   # the mint glow: an airy chord that blooms and fades
    t = t_(dur); L = np.zeros(len(t)); R = np.zeros(len(t))
    for k, f in enumerate(freqs):
        for d, pan in ((-3.1, -spread), (0.0, 0.0), (3.4, spread)):  # three slightly detuned voices: width and air
            v = np.sin(2 * np.pi * (f + d) * t + k) * env_exp(len(t), tau, attack) * (0.55 if d else 1.0)
            v += 0.18 * np.sin(2 * np.pi * 2 * (f + d) * t) * env_exp(len(t), tau * 0.5, attack)
            L += v * (1 - pan) / 2; R += v * (1 + pan) / 2
    return amp * L, amp * R
def reverb(x, secs=1.3, mix=0.16, seed=3):                       # a small, dark room: exponential noise IR
    rng = np.random.default_rng(seed); n = int(secs * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t / (secs / 6.5)); ir = lowpass(ir, 3200); ir /= np.sqrt((ir ** 2).sum())
    wet = np.convolve(x, ir)[:len(x)]
    return (1 - mix) * x + mix * wet * 1.4
def finish(L, R, name, peak=-1.0):
    fade = int(0.08 * SR); w = np.ones(len(L)); w[-fade:] = np.linspace(1, 0, fade)
    L, R = L * w, R * w
    g = 10 ** (peak / 20) / max(np.abs(L).max(), np.abs(R).max()); L, R = L * g, R * g
    data = (np.stack([L, R], 1) * 32767).astype('<i2')
    with wave.open(name, 'wb') as f: f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(data.tobytes())
    print(name, f'{len(L) / SR:.2f} s')

D = 2.4
# A — «Тук-тук»: the pure heartbeat, deep and warm
L = np.zeros(int(D * SR)); place(L, thump(), PRE); place(L, thump(f0=114, f1=54, tau=0.058, click=0.15) * 0.74, PRE + GAP)
L = reverb(L, mix=0.14); finish(L, L.copy(), 'A_heartbeat.wav')
# B — «Серце й сяйво»: the heartbeat, then the mint glow blooms out of the dub (D major add9, high and airy)
L = np.zeros(int(D * SR)); place(L, thump(), PRE); place(L, thump(f0=114, f1=54, tau=0.058, click=0.15) * 0.74, PRE + GAP)
L = reverb(L, mix=0.14); R = L.copy()
sl, sr = shimmer([587.33, 739.99, 880.0, 1318.51], amp=0.11)
place(L, sl, PRE + GAP + 0.02); place(R, sr, PRE + GAP + 0.02)
L, R = reverb(L, 1.8, 0.22, 4), reverb(R, 1.8, 0.22, 5); finish(L, R, 'B_heart_glow.wav')
# C — «Бум-бум»: a musical heart — two soft tuned thumps (a falling fourth, A2 → E2) on a felt mallet, a whisper of glow
L = np.zeros(int(D * SR)); place(L, thump(f0=90, f1=44, click=0.08) * 0.75, PRE); place(L, mallet(110.0, 0.5) * 0.55, PRE)
place(L, thump(f0=104, f1=50, tau=0.06, click=0.06) * 0.51, PRE + GAP); place(L, mallet(82.41, 0.5) * 0.38, PRE + GAP)
R = L.copy(); sl, sr = shimmer([440.0, 659.26, 830.61], dur=2.0, amp=0.07, tau=0.6)
place(L, sl, PRE + GAP + 0.03); place(R, sr, PRE + GAP + 0.03)
L, R = reverb(L, 1.6, 0.2, 6), reverb(R, 1.6, 0.2, 7); finish(L, R, 'C_bum_bum.wav')
json.dump({'pre': PRE, 'gap': GAP}, open('timing.json', 'w'))
