namespace Menu {
    let _callback: () => void
    let _choiceSprite: Sprite

    function startGame() {
        scene.setBackgroundImage(assets.image`empty`)
        controller.player1.A.removeEventListener(ControllerButtonEvent.Pressed, startGame)
        _choiceSprite.destroy()

        _callback()
    }

    export function init() {
        scene.setBackgroundImage(assets.image`Splash Screen`)
        _choiceSprite = textsprite.create('Arrrgh Be Greedy!', 0, 15)
        _choiceSprite.x = 80
        _choiceSprite.y = 100

        controller.player1.A.addEventListener(ControllerButtonEvent.Pressed, startGame)
    }

    export function onStartGame(callback: () => void) {
        _callback = callback
    }
}
