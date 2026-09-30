// Lewydo™ — Love What You Do
package com.lewydo.brand

object LewydoHeart {
    const val GLOW = 0xFF6DF593
    const val SLOGAN = "Love What You Do"

    // one beat when the brand appears
    fun beat(heart: Actor, glow: Actor) {
        heart.addAction(sequence(
            scaleTo(1.13f, 1.13f, 0.10f, sineOut),
            scaleTo(1.00f, 1.00f, 0.12f, sineIn),
            scaleTo(1.07f, 1.07f, 0.10f, sineOut),
            scaleTo(1.00f, 1.00f, 0.12f, sineIn)))
        glow.addAction(sequence(
            delay(0.05f),
            scaleTo(1.15f, 1.15f, 0.12f, sineOut),
            scaleTo(1.05f, 1.05f, 0.28f, sineIn)))
    }

    fun makeGame(idea: Idea): Game {
        val game = code(idea) + design(idea)
        return game.withLove()
    }
}
// made with 💚 in Ukraine
