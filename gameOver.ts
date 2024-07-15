namespace GameOver {
    export function init() {
        music.stopAllSounds()
        scene.setBackgroundColor(0)
        PirateLives.hide()

        const totalCoin = TreasureStats.getTotal()

        game.splash('GAME OVER', 'Ye lost ' + totalCoin)
        game.reset()
    }
}
