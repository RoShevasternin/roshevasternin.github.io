// Lewydo™ brand kit — https://roshevasternin.github.io/brand/
// The Lockup (208×322): the heart in its glow, «Lewydo», «Love What You Do», the line — and its intro (the splash).
// Everything arrives first, top to bottom; then the heart beats as the finale, with the Lewydo sound:
//   0.15 → 0.85 s  the heart and its glow arrive (fade in, scale 0.94 → 1)
//   0.55 → 1.10 s  «Lewydo» comes into focus (fade in, scale 1.06 → 1)
//   0.85 → 1.40 s  the slogan comes into focus
//   1.15 → 1.85 s  the line opens from the middle
//   2.00 s         the finale (LewydoHeartbeat.finale): a breath in, LUB at 2.17, DUB at 2.45, two waves of light
//   2.09 s         onSound() — play kit/sound/lewydo-heartbeat.ogg (the heart only; its first beat is 0.03 s in, on the lub)
//   3.80 s         onComplete
package com.lewydo.yourgame.game.actors.brand

import com.badlogic.gdx.math.Interpolation
import com.badlogic.gdx.scenes.scene2d.Actor
import com.badlogic.gdx.scenes.scene2d.actions.Actions
import com.badlogic.gdx.scenes.scene2d.ui.Image
import com.badlogic.gdx.utils.Align
import com.lewydo.brand.LewydoHeartbeat
import com.lewydo.yourgame.game.actors.layout.autoLayout.AAutoLayout
import com.lewydo.yourgame.game.actors.layout.constraintLayout.AConstraintLayout
import com.lewydo.yourgame.game.screens.BrandScreen
import com.lewydo.yourgame.game.utils.gdxGame

class ABrandGroup(override val screen: BrandScreen): AConstraintLayout(screen) {

    // ------------------------------------------------------------------------
    // Actors
    // ------------------------------------------------------------------------
    private val aVerticalGroup = AAutoLayout(screen,
        direction  = AAutoLayout.Direction.VERTICAL,
        alignMain  = AAutoLayout.AlignMain.CENTER,
        alignCross = AAutoLayout.AlignCross.CENTER
    )

    private val aBrandLogo = ABrandLogo(screen)
    private val aLewydoImg = Image(gdxGame.assetsBrand.lewydo)
    private val aSloganImg = Image(gdxGame.assetsBrand.slogan)
    private val aBrandLine = Image(gdxGame.assetsBrand.brand_line)

    private val listActor = listOf<Actor>(aBrandLogo, aLewydoImg, aSloganImg)

    // ------------------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------------------
    override fun addActorsOnGroup() {
        addVerticalGroup()
        addBrandLine()

        setUpActors()
    }

    // ------------------------------------------------------------------------
    // Add Actors
    // ------------------------------------------------------------------------
    private fun addVerticalGroup() {
        add(aVerticalGroup) { fillParent() }

        aBrandLogo.setSize(208f, 208f)
        aLewydoImg.setSize(208f, 74f)
        aSloganImg.setSize(208f, 19f)

        listActor.forEach { aVerticalGroup.add(it) }
    }

    private fun addBrandLine() {
        aBrandLine.setSize(146f, 1f)
        add(aBrandLine) { centerX(aVerticalGroup); topToBottom(aVerticalGroup, 20f) }
    }

    // ------------------------------------------------------------------------
    // Set Up Actors
    // ------------------------------------------------------------------------
    private fun setUpActors() {
        // everything starts invisible
        aBrandLogo.color.a = 0f
        aLewydoImg.color.a = 0f
        aSloganImg.color.a = 0f
        aBrandLine.color.a = 0f

        aLewydoImg.setOrigin(Align.center)
        aSloganImg.setOrigin(Align.center)
        aBrandLine.setOrigin(Align.center)

        aLewydoImg.setScale(1.06f)
        aSloganImg.setScale(1.06f)
        aBrandLine.setScale(0f, 1f)
    }

    // ------------------------------------------------------------------------
    // Animations
    // ------------------------------------------------------------------------
    /** [onSound] plays the Lewydo sound through the game's own sounds (respect its volume; sounds off = silence). */
    fun playIntroAnimation(onSound: () -> Unit = {}, onComplete: () -> Unit) {
        aBrandLogo.setOrigin(Align.center)
        aBrandLogo.setScale(0.94f)

        // 1. The heart and its glow arrive (0.15 → 0.85)
        aBrandLogo.addAction(
            Actions.sequence(
                Actions.delay(0.15f),
                Actions.parallel(
                    Actions.fadeIn(0.7f, Interpolation.pow3Out),
                    Actions.scaleTo(1f, 1f, 0.7f, Interpolation.pow3Out)
                )
            )
        )

        // 2. «Lewydo» (0.55 → 1.10) and 3. the slogan (0.85 → 1.40) — out of focus → in focus
        focusIn(aLewydoImg, 0.55f)
        focusIn(aSloganImg, 0.85f)

        // 4. The line — opens from the middle (1.15 → 1.85)
        aBrandLine.addAction(
            Actions.sequence(
                Actions.delay(1.15f),
                Actions.parallel(
                    Actions.fadeIn(0.3f),
                    Actions.scaleTo(1f, 1f, 0.7f, Interpolation.exp5Out)
                )
            )
        )

        // 5. The finale: the heartbeat (from 2.0) with its sound (2.09) — only the heart beats, the words stay still
        aBrandLogo.finale(delay = 2.0f)
        addAction(Actions.sequence(Actions.delay(2.09f), Actions.run { onSound() }))

        // 6. A moment to take it in → onComplete (3.8)
        addAction(Actions.sequence(Actions.delay(3.8f), Actions.run { onComplete() }))
    }

    private fun focusIn(actor: Actor, delay: Float) {
        actor.addAction(
            Actions.sequence(
                Actions.delay(delay),
                Actions.parallel(
                    Actions.fadeIn(0.55f, Interpolation.fade),
                    Actions.scaleTo(1f, 1f, 0.55f, Interpolation.fade)
                )
            )
        )
    }

}
