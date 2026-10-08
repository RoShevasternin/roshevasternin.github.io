# Звук Lewydo для динаміка телефона: кітовий D4 «Бум-бум · м'якше» + його власні обертони (рецепт D2 «чути на телефоні»,
# make_sound6.py бренду) з м'яким насиченням піків, пік −1 dBFS. Запуск: python make_phone.py kit.wav out.wav [amount] [drive] [hp Гц]
import sys, wave, numpy as np
src, dst = sys.argv[1], sys.argv[2]
amt = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
drive = float(sys.argv[4]) if len(sys.argv) > 4 else 2.0
hp = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0
olo = float(sys.argv[6]) if len(sys.argv) > 6 else 220.0       # смуга обертонів (D2: 220 Гц – 1.6 кГц)
ohi = float(sys.argv[7]) if len(sys.argv) > 7 else 1600.0          # зрізати наднизькі (телефон їх не грає, а пік вони з'їдають)
w = wave.open(src); ch = w.getnchannels(); SR = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, ch) / 32768
def band(x, lo, hi, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); f[0] = 1e-3
    g = 1 / np.sqrt(1 + (lo / f) ** (2 * order)) / np.sqrt(1 + (f / hi) ** (2 * order)); return np.fft.irfft(X * g, len(x))
def overtones(x, amount):
    low = band(x, 60, 250); h = low / (np.abs(low).max() + 1e-12)
    y = np.abs(h) * 0.8 + 0.5 * h ** 3 + 0.25 * np.tanh(3 * h)
    return band(y, olo, ohi) * np.abs(low).max() * amount
out = []
for c in range(ch):
    y = x[:, c] + overtones(x[:, c], amt)
    if hp > 0: y = band(y, hp, 20000, 2)
    pk = np.abs(y).max()
    out.append(np.tanh(drive * y / pk) / np.tanh(drive) * pk)
y = np.stack(out, 1); y = y / np.abs(y).max() * 10 ** (-1 / 20)
fade = int(.1 * SR); y[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open(dst, 'wb') as f:
    f.setnchannels(ch); f.setsampwidth(2); f.setframerate(SR); f.writeframes((y * 32767).astype('<i2').tobytes())
def rms(v): return 20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-12)
ph = lambda v: band(v, 450, 12000, 3)
print(f'{dst}: phone rms {rms(ph(y[:,0])):.1f} (було {rms(ph(x[:,0])):.1f}), full rms {rms(y[:,0]):.1f} (було {rms(x[:,0]):.1f})')
