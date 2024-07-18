namespace TreasureIsland {
    let _onComplete: () => void
    let pirate1: Pirate
    let pirate2: Pirate
    let treasure: Sprite

    const _boundaries: number[] = [10, 70, 150, 110]

    export function init() {
        scene.setBackgroundColor(9)
        scene.setBackgroundImage(assets.image`Treasarr Island`)

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

        scene.setBackgroundColor(0)
        scene.setBackgroundImage(assets.image`empty`)
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
