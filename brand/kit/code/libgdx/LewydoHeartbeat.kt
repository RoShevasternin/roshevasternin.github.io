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
}
