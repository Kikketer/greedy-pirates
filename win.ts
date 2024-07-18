namespace Win {
    let _title: Sprite
    let _totals: Sprite

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
        _title.y = 78
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

        controller.player1.A.removeEventListener(ControllerButtonEvent.Pressed, game.reset)
    }
}
