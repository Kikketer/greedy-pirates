namespace Menu {
    let _callback: () => void
    let _choiceSprite: Sprite
    let _versionSprite: Sprite

    function startGame() {
        scene.setBackgroundImage(assets.image`empty`)
        controller.player1.A.removeEventListener(ControllerButtonEvent.Pressed, startGame)
        _choiceSprite.destroy()

        music.stopAllSounds()

        _callback()
    }

    export function init() {
        scene.setBackgroundImage(assets.image`Splash Screen`)
        _choiceSprite = textsprite.create('Arrrgh Be Greedy!', 0, 15)
        _choiceSprite.x = 80
        _choiceSprite.y = 100

        // Version information
        _versionSprite = textsprite.create(version, 0, 9)
        _versionSprite.x = 145
        _versionSprite.y = 115

        music.stopAllSounds()
        PirateLives.hide()
        
        music.play(music.createSong(assets.song`Title`), music.PlaybackMode.LoopingInBackground)

        controller.player1.A.addEventListener(ControllerButtonEvent.Pressed, startGame)
    }

    export function onStartGame(callback: () => void) {
        _callback = callback
    }
}
