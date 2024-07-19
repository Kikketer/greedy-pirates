namespace Win {
    let _title: Sprite
    let _totals: Sprite

    let restingPlayer1: Sprite
    let restingPlayer2: Sprite
    let restingPlayer1Animation: Image[] = assets.animation`Pirate Rest`
    let restingPlayer2Animation: Image[] = Utils.flipAnimation(Utils.swapAnimationColors(assets.animation`Pirate Rest`, 14, 4))
    let island: Sprite
    let waves: Sprite[] = []

    const waveAnimation: Image[] = Utils.swapAnimationColors(assets.animation`wave`, 9, 6)

    export function init() {
        music.stopAllSounds()
        scene.setBackgroundColor(9)

        music.play(music.createSong(assets.song`Treasure Island Theme`), music.PlaybackMode.LoopingInBackground)

        island = sprites.create(assets.image`Treasarr Island`)
        island.x = 80
        island.y = 60
        island.z = 1

        restingPlayer1 = sprites.create(restingPlayer1Animation[0])
        restingPlayer2 = sprites.create(restingPlayer2Animation[0])
        restingPlayer1.x = 86
        restingPlayer1.y = 62
        restingPlayer1.z = 3
        restingPlayer2.x = 104
        restingPlayer2.y = 67
        restingPlayer2.z = 3
        animation.runImageAnimation(
            restingPlayer1,
            restingPlayer1Animation,
            500,
            true
        )
        pause(100)
        animation.runImageAnimation(
            restingPlayer2,
            restingPlayer2Animation,
            500,
            true
        )

        Utils.getArrayOfLength(10).forEach(() => {
            const wave = sprites.create(assets.animation`wave`[0])
            animation.runImageAnimation(
                wave,
                waveAnimation,
                500,
                true
            )
            wave.x = Math.randomRange(10, 150)
            wave.y = Math.randomRange(10, 60)
            wave.z = 0
            waves.push(wave)
        })

        const totalRiches: number = TreasureStats.getTotal()

        _title = textsprite.create('Arrgh! Ye be pirates!', 1, 15)
        _title.x = 80
        _title.y = 100
        _title.z = 120

        _totals = textsprite.create(totalRiches + '')
        _totals.x = 80
        _totals.y = 90
        _totals.z = 120

        controller.player1.A.addEventListener(ControllerButtonEvent.Pressed, game.reset)
    }

    export function destroy() {
        _title.destroy()
        _totals.destroy()

        island.destroy()
        waves.forEach(wave => wave.destroy())

        restingPlayer1.destroy()
        restingPlayer2.destroy()

        controller.player1.A.removeEventListener(ControllerButtonEvent.Pressed, game.reset)
    }
}
