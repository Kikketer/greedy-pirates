namespace Win {
    let _title: Sprite
    let _totals: Sprite

    export function init() {
        music.stopAllSounds()
        scene.setBackgroundColor(6)

        const totalRiches: number = TreasureStats.currentTreasure.inPocket 
            + TreasureStats.currentTreasure.onIsland 
            + TreasureStats.currentTreasure.onBoat

        _title = textsprite.create('Arrgh! Ye be pirates!')
        _title.x = 80
        _title.y = 60

        _totals = textsprite.create(totalRiches + '')
        _totals.x = 80
        _totals.y = 90

        controller.player1.A.addEventListener(ControllerButtonEvent.Pressed, game.reset)
    }

    export function destroy() {
        if (_title) {
            _title.destroy()
        }
        if (_totals) {
            _totals.destroy()
        }

        controller.player1.A.removeEventListener(ControllerButtonEvent.Pressed, game.reset)
    }
}
