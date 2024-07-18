namespace TreasureIsland {
    let _onComplete: () => void
    let pirate1: Pirate
    let pirate2: Pirate
    let treasure: Sprite
    let island: Sprite
    let waves: Sprite[] = []

    const waveAnimation: Image[] = Utils.swapAnimationColors(assets.animation`wave`, 9, 6)

    const _boundaries: number[] = [10, 70, 150, 110]

    export function init() {
        scene.setBackgroundColor(9)

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

        pirate1 = new Pirate({
            control: controller.player1,
            playerNumber: 0,
            onAttack: touchTreasure,
            onDie: () => {},
            boundaries: _boundaries
        })
        pirate2 = new Pirate({
            control: controller.player2,
            playerNumber: 1,
            onAttack: touchTreasure,
            onDie: () => { },
            boundaries: _boundaries
        })

        pirate1.sprite.x = 23
        pirate1.sprite.y = 80
        pirate2.sprite.x = 23
        pirate2.sprite.y = 95

        treasure = sprites.create(assets.image`Chest`)
        treasure.x = 120
        treasure.y = 85
        treasure.z = 85

        music.play(music.createSong(assets.song`Treasure Island Theme`), music.PlaybackMode.LoopingInBackground)
    }

    export function onComplete(callback: () => void) {
        _onComplete = callback
    }

    export function render() {
        pirate1.render()
        pirate2.render()
    }

    function destroy() {
        pirate1.destroy()
        pirate2.destroy()
        treasure.destroy()

        island.destroy()
        waves.forEach(wave => wave.destroy())

        scene.setBackgroundColor(0)
        scene.setBackgroundImage(assets.image`empty`)

        music.stopAllSounds()
    }

    function touchTreasure({ pirate }: AttackCallbackParams) {
        if (Utils.getDistance(pirate.sprite, treasure) < 12) {
            game.showLongText('Ye have stashed ' + TreasureStats.currentTreasure.onBoat + ' coin on ye island for safe keepin\' ', DialogLayout.Center)

            TreasureStats.currentTreasure = {
                onBoat: 0,
                onIsland: TreasureStats.currentTreasure.onIsland + TreasureStats.currentTreasure.onBoat,
                inPocket: 0
            }
            TreasureStats.show({})

            destroy()
            _onComplete()
        }
    }
}
