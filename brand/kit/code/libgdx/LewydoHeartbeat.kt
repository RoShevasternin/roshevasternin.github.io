package com.lewydo.brand

import com.badlogic.gdx.math.Interpolation
import com.badlogic.gdx.scenes.scene2d.Actor
import com.badlogic.gdx.scenes.scene2d.actions.Actions
import com.badlogic.gdx.utils.Align

/**
 * Lewydo™ heartbeat — the studio standard for every Lewydo game — https://roshevasternin.github.io/brand/.
 *
 * The heart (BRAND_FRONT) and its green glow (BRAND_BACK) beat SEPARATELY, ONCE,
 * at the moment the brand appears:
 *   • the splash screen shows,
 *   • the «About us» window opens (every time it opens),
 *   • the Lewydo pill appears at the bottom of the menu.
 * Never wrap it in Actions.forever — a looping logo distracts from the game.
 *
 *   heart: 1.13 (0.10 s, sineOut) → 1.00 (0.12, sineIn) → 1.07 (0.10, sineOut) → 1.00 (0.12, sineIn)   = 0.44 s
 *   glow:  wait 0.05 → 1.15 (0.12, sineOut) → 1.05 (0.28, sineIn), then it stays at 1.05               = 0.45 s
 *
 * The splash (BrandScreen) ends with a bigger, juicier version of it — finale() — together with the Lewydo sound.
 *
 * Usage (e.g. in ABrand.addActorsOnGroup, or when the About window is shown):
 *     LewydoHeartbeat.play(front = aFrontImg, back = aBackImg)
 *     LewydoHeartbeat.play(aFrontImg, aBackImg, delay = 0.25f)   // after the window's own open animation
 */
object LewydoHeartbeat {

    fun play(front: Actor, back: Actor, delay: Float = 0f) {
        // start clean: calling it again (the window re-opens) replays the same single beat
        front.clearActions(); front.setScale(1f); front.setOrigin(Align.center)
        back.clearActions();  back.setScale(1f);  back.setOrigin(Align.center)

        front.addAction(
            Actions.sequence(
                Actions.delay(delay),
                Actions.scaleTo(1.13f, 1.13f, 0.10f, Interpolation.sineOut),
                Actions.scaleTo(1.00f, 1.00f, 0.12f, Interpolation.sineIn),
                Actions.scaleTo(1.07f, 1.07f, 0.10f, Interpolation.sineOut),
                Actions.scaleTo(1.00f, 1.00f, 0.12f, Interpolation.sineIn),
            )
        )

        back.addAction(
            Actions.sequence(
                Actions.delay(delay + 0.05f),
                Actions.scaleTo(1.15f, 1.15f, 0.12f, Interpolation.sineOut),
                Actions.scaleTo(1.05f, 1.05f, 0.28f, Interpolation.sineIn),
            )
        )
    }

    /**
     * The splash's heartbeat (BrandScreen v2), when the whole mark is already in place: a breath in, a big «lub», a «dub»;
     * the glow blooms with each beat and stays at 1.05; two waves of light (copies of the glow) leave the heart.
     * Starts at [delay] (2.0 s into the splash); the «lub» peaks 0.17 s later, the «dub» at 0.45 s — the sound's beats land there.
     */
    fun finale(front: Actor, back: Actor, waveA: Actor, waveB: Actor, delay: Float = 0f) {
        listOf(front, back, waveA, waveB).forEach { it.clearActions(); it.setScale(1f); it.setOrigin(Align.center) }
        val snap = Interpolation.pow3Out          // the attack of a beat: fast, then easing
        val soft = Interpolation.sine             // the release

        front.addAction(
            Actions.sequence(
                Actions.delay(delay),
                Actions.scaleTo(0.95f,  0.95f,  0.099f, soft),     // a breath in
                Actions.scaleTo(1.20f,  1.20f,  0.072f, snap),     // LUB
                Actions.scaleTo(0.97f,  0.97f,  0.108f, soft),
                Actions.scaleTo(1.12f,  1.12f,  0.171f, snap),     // DUB
                Actions.scaleTo(0.985f, 0.985f, 0.117f, soft),
                Actions.scaleTo(1.012f, 1.012f, 0.153f, soft),
                Actions.scaleTo(1.00f,  1.00f,  0.180f, soft),
            )
        )
        back.addAction(
            Actions.sequence(
                Actions.delay(delay),
                Actions.scaleTo(0.98f, 0.98f, 0.12f, soft),
                Actions.scaleTo(1.30f, 1.30f, 0.10f, snap),        // the glow blooms on the lub…
                Actions.scaleTo(1.10f, 1.10f, 0.18f, soft),
                Actions.scaleTo(1.20f, 1.20f, 0.12f, snap),        // …and on the dub
                Actions.scaleTo(1.05f, 1.05f, 0.48f, soft),        // then stays at 1.05, like the short beat
            )
        )
        wave(waveA, delay + 0.12f, from = 0.55f, to = 1.90f, duration = 1.0f)
        wave(waveB, delay + 0.40f, from = 0.32f, to = 1.55f, duration = 0.9f)
    }

    private fun wave(wave: Actor, delay: Float, from: Float, to: Float, duration: Float) {
        wave.color.a = 0f
        wave.addAction(
            Actions.sequence(
                Actions.delay(delay),
                Actions.alpha(from),
                Actions.parallel(
                    Actions.scaleTo(to, to, duration, Interpolation.pow3Out),
                    Actions.fadeOut(duration, Interpolation.pow3Out),
                ),
            )
        )
    }
}
