# Lewydo sonic logo — round 5 (01.10.2026). The owner: «треба новий звук — м'який пам-пам», and then: «візьми щось
# приємне, що подобається людям, і зроби пам-пам круто».
# So: two soft, round, PITCHED notes on the two heartbeats — «пам … пам» — each played by a sound people already love:
#   · P — a felt piano (the lo-fi / ambient piano of «relax» playlists, the softest piano there is);
#   · Q — a marimba with soft mallets (the iPhone's best-known ringtone is a marimba: wood, warm, no metal);
#   · R — a lo-fi Rhodes (the warm electric piano of «lofi beats to relax to», with a little tape wobble);
#   · S — «та-дам» from the cinema (a promise, then the payoff that blooms open), but gentle: no boom.
# And the owner again: «це ж серцебиття, не забувай». So every one is a heartbeat first, played the way a real heart sounds:
#   · «lub» (the first heart sound) is lower and stronger; «dub» (the second) is higher and softer — so a heart itself
#     goes UP, and the notes follow it: E (lub, louder, short) → A (dub, softer, then it rings home). A fourth up is also
#     the step of the beloved «coin» sound of games: the brain hears «reward». Never down — that sounds like «error»;
#   · like a real heart, the lub is short and lets go: a breath of quiet, then the dub — two clear beats, not one smear;
#   · under the notes, a soft warm pulse at each beat (a pure low sine, no click, no falling pitch — felt in
#     headphones, a body to the beat; the phone hears the notes), in time with the heart on screen.
# The rules from rounds 3–4 still hold: a soft onset (10–90 ms, no click), round timbres only (almost nothing above
# 3 kHz), a calm fade in a small room, the same loudness on a phone speaker as round 4 (300 Hz – 3 kHz at −30 dB),
# peaks far under D.
# Reuses round 4's helpers. Each file has its «lub» at PRE4 = 0.40 s, like round 4 (start it at 1.72 s in the splash).
# Run from an empty folder:  PYTHONPATH=<repo>/tools/sonic python3 <repo>/tools/sonic/make_sound5.py
import json
import numpy as np
from make_sound4 import SR, PRE4, GAP, hz, t_, smooth_attack, swell, ensemble, sub, fft_lp, hall, finish

RNG = np.random.default_rng(55)
LUB, DUB = PRE4, PRE4 + GAP
LUB_HOLD = 0.14                       # the «lub» lets go 140 ms in: a breath of quiet before the «dub»
LUB_VEL, DUB_VEL = 1.0, 0.7           # the «lub» is the stronger beat (the «dub» also lands on the lub's ring)


def onset(t, at, a):
    """0 before `at`, a raised-cosine rise over `a` seconds after it."""
    return smooth_attack(t - at, a) * (t >= at)


def let_go(t, x, at=None, tau=0.1):
    """The «lub» lets go before the «dub» (a damper on a piano, a hand on a bar): a heartbeat, two clear beats."""
    at = LUB + LUB_HOLD if at is None else at
    return x * np.where(t < at, 1.0, np.exp(-(t - at) / tau))


def place_lr(L, R, x, pan):
    """Add a mono voice at a constant-power pan (−1 left … +1 right)."""
    L += x * np.sqrt((1 - pan) / 2); R += x * np.sqrt((1 + pan) / 2)


def heart_pulse(L, R, t, amp=0.5):
    """The body of the heartbeat: at «lub» and «dub» a soft, warm low pulse — a pure sine that swells in 14 ms and fades
    in ~0.1 s, its pitch settling slightly UP (E2 → lub, A2 → dub). No noise, no click, no falling pitch: not a knock."""
    for at, f, a, d in ((LUB - 0.008, hz('E2'), 1.0, 0.11), (DUB - 0.008, hz('A2'), 0.7, 0.085)):
        tt = np.maximum(t - at, 0)
        ph = 2 * np.pi * np.cumsum(f * 2 ** ((-30 * np.exp(-tt / 0.03)) / 1200) * (t >= at)) / SR
        x = (np.sin(ph) + 0.18 * np.sin(2 * ph)) * onset(t, at, 0.014) * np.exp(-tt / d) * a * amp
        L += x; R += x


# ── voices ───────────────────────────────────────────────────────────────────
def felt_piano(f, t, at, vel=1.0, tau=1.5, cut=1300, strings=(-0.9, 0.0, 0.8)):
    """A felt (muted) piano note: a thick felt strip between hammer and strings — the strike is round, the top is gone.
    Slightly stretched partials (a real string), the high ones die first, three strings a hair apart → a slow, living shimmer."""
    tt = np.maximum(t - at, 0); on = (t >= at)
    x = np.zeros(len(t))
    phases = RNG.uniform(0, 2 * np.pi, 16)                 # one hammer strikes all three strings at once: they start in phase
    for c in strings:
        fc = f * 2 ** (c / 1200)
        for k in range(1, 16):
            fk = fc * k * np.sqrt(1 + 0.00035 * k * k)
            if fk > 6000:
                break
            a = (1 / k ** 1.1) / np.sqrt(1 + (fk / (cut * (0.65 + 0.35 * vel))) ** 4)
            d = tau / (1 + 0.45 * (k - 1))
            env = 0.55 * np.exp(-tt / (0.22 * d + 0.05)) + 0.45 * np.exp(-tt / d)
            x += a * env * np.sin(2 * np.pi * fk * tt + phases[k])
    x /= len(strings)
    thud = fft_lp(RNG.standard_normal(len(t)), 220) * np.exp(-tt / 0.025) * 0.05       # the felt itself, felt not heard
    return (x + thud) * smooth_attack(tt, 0.012) * on * vel                            # 12 ms: round, not a tap


def marimba(f, t, at, vel=1.0, tau=0.85):
    """A marimba bar struck with soft yarn mallets: the bar's modes tuned to 1 : 4 : 10 exactly (a well-tuned marimba: no slow beating against the low A), the upper ones weak
    and short (a soft mallet barely excites them), and the tube under the bar that makes the low note bloom and sing on."""
    tt = np.maximum(t - at, 0); on = (t >= at)
    x = np.zeros(len(t))
    for r, a, d in ((1.0, 1.0, tau), (4.0, 0.16 * vel, tau * 0.16), (10.0, 0.03 * vel, tau * 0.05)):
        if f * r < 7000:
            x += a * np.exp(-tt / d) * np.sin(2 * np.pi * f * r * tt + RNG.uniform(0, 2 * np.pi))
    tube = 0.45 * np.sin(2 * np.pi * f * tt + 0.3) * (1 - np.exp(-tt / 0.025)) * np.exp(-tt / (tau * 1.35))
    knock = fft_lp(RNG.standard_normal(len(t)), 500) * np.exp(-tt / 0.006) * 0.035       # the yarn touching the wood
    return ((x + tube) * smooth_attack(tt, 0.004) + knock) * on * vel


def rhodes(f, t, at, vel=1.0, tau=1.6, wow=None):
    """A Rhodes electric piano played softly: a tine and its tone bar (two-operator FM, 1 : 1, a low index → round and
    warm, only a whisper of bark at the start), the pickup's slight asymmetry, and — for lo-fi — the pitch of a tape."""
    tt = np.maximum(t - at, 0); on = (t >= at)
    fw = f * (wow if wow is not None else 1.0)
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(fw, t.shape) * on) / SR
    index = (0.9 * vel * np.exp(-tt / 0.12) + 0.22) * on
    car = np.sin(ph + index * np.sin(ph))
    car = car + 0.12 * car ** 2                                       # the pickup: a little even harmonic warmth
    env = smooth_attack(tt, 0.006) * (0.5 * np.exp(-tt / 0.45) + 0.5 * np.exp(-tt / tau))
    return (car - 0.12 * 0.5) * env * on * vel


# ── P «Фетр»: two notes of a felt piano — the softest piano there is (lo-fi, ambient, the «relax» sound) ──
def P():
    t = t_(3.4)
    L = np.zeros(len(t)); R = np.zeros(len(t))
    for at, n, vel, tau in ((LUB - 0.006, 'E4', LUB_VEL, 1.1), (DUB - 0.006, 'A4', DUB_VEL, 1.7)):
        hi = felt_piano(hz(n), t, at, vel, tau)
        lo = felt_piano(hz(n) / 2, t, at + 0.004, vel * 0.42, tau * 1.1, cut=900)     # the octave below: full, warm
        if n == 'E4':
            hi, lo = let_go(t, hi), let_go(t, lo)
        L += 1.05 * hi + 0.95 * lo; R += 0.95 * hi + 1.05 * lo
    heart_pulse(L, R, t)
    L, R = hall(L, R, 2.2, 0.2, seed=51)                                  # a small, dry-ish room: two clear beats
    finish(L, R, 'P_felt.wav')


# ── Q «Маримба»: soft mallets on wood, two mallets at once — an open fifth, then a sweet sixth one step up: «пам-пам!» ──
def Q():
    t = t_(3.2)
    L = np.zeros(len(t)); R = np.zeros(len(t))
    for at, notes, vel, tau in ((LUB - 0.003, (('A3', 0.55, -0.35), ('E4', 0.9, 0.25)), LUB_VEL, 0.75),
                                (DUB - 0.003, (('C#4', 0.55, -0.3), ('A4', 0.95, 0.3)), DUB_VEL, 1.0)):
        for i, (n, a, pan) in enumerate(notes):                             # the two mallets land 9 ms apart, like hands
            x = marimba(hz(n), t, at + 0.009 * i, vel * a, tau)
            place_lr(L, R, let_go(t, x) if at < DUB - 0.1 else x, pan)
    place_lr(L, R, marimba(hz('A2'), t, DUB - 0.003, 0.28, 1.2), 0.0)       # a low A under the second: home
    heart_pulse(L, R, t)
    L, R = hall(L, R, 1.8, 0.18, seed=52)
    finish(L, R, 'Q_marimba.wav')


# ── R «Лоу-фай»: two warm Rhodes chords, rolled by hand, with a little tape wobble — the sound of «lofi beats» ──
def R_():
    t = t_(3.4)
    wow = 2 ** ((3.5 * np.sin(2 * np.pi * 0.45 * t) + 1.0 * np.sin(2 * np.pi * 3.1 * t)) / 1200)   # an old tape, gently
    # (more wobble than this sweeps the notes through the room's resonances: the fade starts to pump)
    L = np.zeros(len(t)); R = np.zeros(len(t))
    first = (('D3', 0.5), ('F#3', 0.4), ('C#4', 0.5), ('E4', 1.0))        # Dmaj9 — warm, a question (the lub: the top sings)
    second = (('A2', 0.45), ('E3', 0.36), ('B3', 0.36), ('C#4', 0.4), ('A4', 0.85))   # Aadd9 — home, top up E → A
    for at, chord, vel, tau in ((LUB - 0.03, first, LUB_VEL, 1.0), (DUB - 0.03, second, DUB_VEL, 1.9)):
        for i, (n, a) in enumerate(chord):
            x = rhodes(hz(n), t, at + 0.011 * i, vel * a, tau, wow)
            if chord is first:
                x = let_go(t, x, LUB + LUB_HOLD + 0.02)                     # the first chord gives way to the second
            place_lr(L, R, x, (i / (len(chord) - 1) - 0.5) * 0.8)
    heart_pulse(L, R, t)
    L, R = fft_lp(L, 2600), fft_lp(R, 2600)                                # lo-fi: the top rolled off
    L, R = hall(L, R, 2.0, 0.2, seed=53)
    finish(L, R, 'R_lofi.wav')


# ── S «Та-дам»: as in the cinema — «та» on the lub (a promise), «дам» on the dub, and then the glow after the heartbeat
#    blooms open into a warm, wide A major (the light that leaves the heart on screen) ──
def S():
    t = t_(3.6)
    L = np.zeros(len(t)); R = np.zeros(len(t))
    for n, a in (('E3', 0.5), ('E4', 0.8)):                                # «та»: a soft octave, short
        x = let_go(t, felt_piano(hz(n), t, LUB - 0.006, LUB_VEL * a, 0.7))
        L += x; R += x
    chord = (('A2', 0.55), ('E3', 0.5), ('A3', 0.55), ('C#4', 0.5), ('E4', 0.5), ('A4', 0.62))
    for i, (n, a) in enumerate(chord):                                     # «дам»: the strike…
        place_lr(L, R, felt_piano(hz(n), t, DUB - 0.006 + 0.005 * i, DUB_VEL * a * 1.25, 2.0), (i / 5 - 0.5) * 0.7)
    bloom = swell(t, DUB + 0.32, 0.36, 1.2)                                # …and then it opens, like a curtain
    bright = 450 + 1900 * bloom
    for n, a in (('A2', 0.5), ('E3', 0.45), ('A3', 0.5), ('C#4', 0.42), ('E4', 0.38), ('A4', 0.22)):
        l, r = ensemble(hz(n), t, bloom * a * 0.55, bright, voices=5, spread=9, width=0.85); L += l; R += r
    s = sub(hz('A1'), t, swell(t, DUB + 0.2, 0.25, 0.9) * 0.3); L += s; R += s
    heart_pulse(L, R, t)
    L, R = hall(L, R, 2.8, 0.32, seed=54)
    finish(L, R, 'S_tadam.wav')


if __name__ == "__main__":
    P(); Q(); R_(); S()
    json.dump({'pre': PRE4, 'gap': GAP}, open('timing5.json', 'w'))
