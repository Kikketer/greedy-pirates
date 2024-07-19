namespace Travel {
    let _onBoatBattle: () => void
    let _onLandOnIsland: () => void
    let _videoSprite: Sprite
    let _textSprite: Sprite
    const _startAnimation: Image[] = assets.animation`Boat Float`
    const _pirateAnimation: Image[] = assets.animation`Boat Float Enemy Spotted`
    const _islandAnimation: Image[] = assets.animation`Boat Float Island`

    export function init({ targetIsland }: { targetIsland: Map.Island }) {
        // Probably should have done this better... oh well
        let result = Math.min((TreasureStats.currentTreasure.onBoat / 500) * 100, 100)

        // Odds are different if you are heading to your island
        if (targetIsland.id === 0) {
            result = Math.min((TreasureStats.currentTreasure.onBoat / 200) * 100, 100)
        }

        scene.setBackgroundColor(0)
        scene.setBackgroundImage(assets.image`empty`)

        _videoSprite = sprites.create(image.create(80, 60))
        _videoSprite.x = 80
        _videoSprite.y = 60

        animation.runImageAnimation(
            _videoSprite,
            _startAnimation,
            500,
            true
        )

        // Animate!
        _textSprite = textsprite.create('Floaty boaty', 0, 14)
        _textSprite.x = 80
        _textSprite.y = 100
        pause(2000)

        if (result > Math.randomRange(0,100)) {
            animation.runImageAnimation(
                _videoSprite,
                _pirateAnimation,
                500,
                false
            )

            _textSprite.destroy()
            _textSprite = textsprite.create('Thar be pirates!')
            _textSprite.x = 80
            _textSprite.y = 100
            pause(_pirateAnimation.length * 500 + 1000)
            
            destroy()
            _onBoatBattle()
        } else {
            animation.runImageAnimation(
                _videoSprite,
                _islandAnimation,
                500,
                false
            )

            _textSprite.destroy()
            const text = targetIsland.id === 0 ? 'Ye made it home!' : 'Arrgh, steal thee loot!'
            _textSprite = textsprite.create(text)
            _textSprite.x = 80
            _textSprite.y = 100
            pause(_islandAnimation.length * 500 + 1000)

            destroy()
            _onLandOnIsland()
        }
    }

    function destroy() {
        if (_textSprite) {
            _textSprite.destroy()
        }
        if (_videoSprite) {
            _videoSprite.destroy()
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