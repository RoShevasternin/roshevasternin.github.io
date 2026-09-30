// Lewydo™ brand kit — https://roshevasternin.github.io/brand/
// The first screen of every Lewydo game: the Lewydo Lockup appears (≈ 3 s), then the game's LoaderScreen.
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
import com.lewydo.yourgame.game.utils.gdxGame

class BrandScreen : AdvancedScreen() {

    // ------------------------------------------------------------------------
    // Actors
    // ------------------------------------------------------------------------
    private val aBrandGroup by lazy { ABrandGroup(this) }

    // ------------------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------------------
    override fun show() {
        gdxGame.spriteManager.loadAtlasNow(SpriteManager.EnumAtlas.BRAND)
        super.show()

        animShowScreen {
            aBrandGroup.playIntroAnimation {
                animHideScreen { gdxGame.navigationManager.navigate(LoaderScreen::class.java.name) }
            }
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

}
