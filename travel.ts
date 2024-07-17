namespace Travel {
    let _onBoatBattle: () => void
    let _onLandOnIsland: () => void
    let _textSprite: Sprite
    let _startAnimation: Image[]
    let _pirateAnimation: Image[]
    let _islandAnimation: Image[]

    export function init() {
        const oddsOfBoatBattle = 70
        const result = Math.min(TreasureStats.currentTreasure.onBoat / 300, oddsOfBoatBattle / 100) * 100

        scene.setBackgroundColor(0)
        scene.setBackgroundImage(assets.image`empty`)

        // Animate!
        _textSprite = textsprite.create('Floaty boaty', 0, 14)
        _textSprite.x = 80
        _textSprite.y = 60

        if (result > oddsOfBoatBattle) {
            pause(3000)
            _textSprite.destroy()
            _textSprite = textsprite.create('Thar be pirates!')
            _textSprite.x = 80
            _textSprite.y = 60
            pause(2000)
            
            destroy()
            _onBoatBattle()
        } else {
            pause(3000)
            _textSprite.destroy()
            _textSprite = textsprite.create('Arrgh, steal thee loot!')
            _textSprite.x = 80
            _textSprite.y = 60
            pause(2000)

            destroy()
            _onLandOnIsland()
        }
    }

    function destroy() {
        if (_textSprite) {
            _textSprite.destroy()
        }
        scene.setBackgroundImage(assets.image`empty`)
        scene.setBackgroundColor(0)
    }

    export function onBoatBattle(callback: () => void) {
        _onBoatBattle = callback
    }

    export function onLandOnIsland(callback: () => void) {
        _onLandOnIsland = callback
    }
}