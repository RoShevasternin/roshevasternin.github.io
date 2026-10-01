// Lewydo™ brand kit — https://roshevasternin.github.io/brand/
// The first screen of every Lewydo game: the Lewydo Lockup appears, the heart beats with the Lewydo sound (≈ 4 s), then the game's LoaderScreen.
// The sound: kit/sound/lewydo-heartbeat.ogg → assets/sound/ (load it with your game's sounds, play it at your game's sound volume).
// Put it in your game and replace «yourgame» with your game's package. Built on the Lewydo LibGDX base
// (AdvancedScreen, AConstraintLayout, AAutoLayout, SizeScaler, animShow / animHide) and the BRAND atlas of this kit.
package com.lewydo.yourgame.game.screens

import com.lewydo.yourgame.game.actors.brand.ABrandGroup
import com.lewydo.yourgame.game.actors.layout.constraintLayout.AConstraintLayout
import com.lewydo.yourgame.game.manager.SpriteManager
import com.lewydo.yourgame.game.utils.Block
import com.lewydo.yourgame.game.utils.TIME_ANIM_SCREEN
import com.lewydo.yourgame.game.utils.actor.animHide
import com.lewydo.yourgame.game.utils.actor.animShow
import com.lewydo.yourgame.game.utils.advanced.AdvancedScreen
import com.badlogic.gdx.Gdx
import com.badlogic.gdx.audio.Sound
import com.lewydo.yourgame.game.utils.gdxGame

class BrandScreen : AdvancedScreen() {

    // ------------------------------------------------------------------------
    // Actors
    // ------------------------------------------------------------------------
    private val aBrandGroup by lazy { ABrandGroup(this) }
    private val brandSound: Sound by lazy { Gdx.audio.newSound(Gdx.files.internal("sound/lewydo-heartbeat.ogg")) }

    /** Your game's sound volume, 0..1 (0 when the player turned the sounds off). Wire it to your settings. */
    private fun soundVolume(): Float = 1f

    // ------------------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------------------
    override fun show() {
        gdxGame.spriteManager.loadAtlasNow(SpriteManager.EnumAtlas.BRAND)
        brandSound                                       // load the sound now, so it plays exactly on the beat
        super.show()

        animShowScreen {
            aBrandGroup.playIntroAnimation(
                onSound = { soundVolume().takeIf { it > 0f }?.let { brandSound.play(it) } },
                onComplete = { animHideScreen { gdxGame.navigationManager.navigate(LoaderScreen::class.java.name) } }
            )
        }
    }

    override fun AConstraintLayout.addActorsOnRootConstraintLayout() {
        aBrandGroup.setSize(208f, 322f)
        add(aBrandGroup) { center() }
    }

    // ------------------------------------------------------------------------
    // Screen Animations
    // ------------------------------------------------------------------------
    override fun animHideScreen(blockEnd: Block) {
        rootConstraintLayout.animHide(TIME_ANIM_SCREEN) { blockEnd() }
    }

    override fun animShowScreen(blockEnd: Block) {
        rootConstraintLayout.animShow { blockEnd() }
    }

    override fun dispose() {
        brandSound.dispose()
        super.dispose()
    }

}
