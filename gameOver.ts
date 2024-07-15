namespace GameOver {
    export function init() {
        music.stopAllSounds()
        scene.setBackgroundColor(0)
        PirateLives.hide()
        game.splash('GAME OVER!', 'Ye Be Dead!')
        game.reset()
    }
}
