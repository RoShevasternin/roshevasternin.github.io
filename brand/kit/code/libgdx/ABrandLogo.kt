// Lewydo™ brand kit — https://roshevasternin.github.io/brand/
// The heart in its glow: brand_back (the mint glow, fills 208×208) under brand_front (the heart, 140×140 in the middle).
// beat()   — the short heartbeat (About us, the menu pill): the heart and its glow beat separately, once.
// finale() — the splash's heartbeat (BrandScreen): a breath in, a big «lub», a «dub», the glow blooms, two waves of light leave the heart.
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
    private val aWaveImgA      = Image(gdxGame.assetsBrand.brand_back)     // the waves of light: two more copies of the glow, hidden
    private val aWaveImgB      = Image(gdxGame.assetsBrand.brand_back)     // until the splash's finale
    private val aBrandBackImg  = Image(gdxGame.assetsBrand.brand_back)
    private val aBrandFrontImg = Image(gdxGame.assetsBrand.brand_front)

    // ------------------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------------------
    override fun addActorsOnGroup() {
        addWaves()
        addBrandBackImg()
        addBrandFrontImg()
    }

    // ------------------------------------------------------------------------
    // Add Actors
    // ------------------------------------------------------------------------
    private fun addWaves() {
        listOf(aWaveImgA, aWaveImgB).forEach { it.color.a = 0f; add(it) { fillParent() } }
    }

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

    fun finale(delay: Float = 0f) {
        LewydoHeartbeat.finale(front = aBrandFrontImg, back = aBrandBackImg, waveA = aWaveImgA, waveB = aWaveImgB, delay = delay)
    }

}
