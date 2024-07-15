namespace GameOver {
    export function init() {
        scene.setBackgroundColor(0)
        PirateLives.hide()
        game.splash('GAME OVER!', 'Ye Be Dead!')
        game.reset()
    }
}
