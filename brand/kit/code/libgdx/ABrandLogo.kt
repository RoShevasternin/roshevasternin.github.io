// Lewydo™ brand kit — https://roshevasternin.github.io/brand/
// The heart in its glow: brand_back (the mint glow, fills 208×208) under brand_front (the heart, 140×140 in the middle).
// beat() — the one heartbeat of the brand standard (LewydoHeartbeat): the heart and its glow beat separately, once.
package com.lewydo.yourgame.game.actors.brand

import com.badlogic.gdx.scenes.scene2d.ui.Image
import com.lewydo.brand.LewydoHeartbeat
import com.lewydo.yourgame.game.actors.layout.constraintLayout.AConstraintLayout
import com.lewydo.yourgame.game.utils.SizeScaler
import com.lewydo.yourgame.game.utils.advanced.AdvancedScreen
import com.lewydo.yourgame.game.utils.gdxGame

class ABrandLogo(override val screen: AdvancedScreen): AConstraintLayout(screen) {

    override val sizeScaler = SizeScaler(SizeScaler.Axis.X, 208f)

    // ------------------------------------------------------------------------
    // Actors
    // ------------------------------------------------------------------------
    private val aBrandBackImg  = Image(gdxGame.assetsBrand.brand_back)
    private val aBrandFrontImg = Image(gdxGame.assetsBrand.brand_front)

    // ------------------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------------------
    override fun addActorsOnGroup() {
        addBrandBackImg()
        addBrandFrontImg()
    }

    // ------------------------------------------------------------------------
    // Add Actors
    // ------------------------------------------------------------------------
    private fun addBrandBackImg() {
        add(aBrandBackImg) { fillParent() }
    }

    private fun addBrandFrontImg() {
        aBrandFrontImg.setSizeScaled(140f, 140f)
        add(aBrandFrontImg) { center() }
    }

    // ------------------------------------------------------------------------
    // Heartbeat — once, when the brand appears (never in a loop)
    // ------------------------------------------------------------------------
    fun beat(delay: Float = 0f) {
        LewydoHeartbeat.play(front = aBrandFrontImg, back = aBrandBackImg, delay = delay)
    }

}
