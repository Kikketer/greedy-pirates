namespace Map {
    // const weBeSailinSong: Buffer = assets.song`We be Sailin`
    let cursor: Sprite
    let waves: Array<Sprite> = []
    let currentSelectedIslandIndex = 0
    let _onSelectIsland: (island: Island) => void
    let _onWin: () => void
    let _islands: Array<Island>
    let _bulkyBgSprite: Sprite
    // Prevents smashing and accidentally going to the same island
    let _selectIslandDelay: number = 600
    let _leftIslandTick: number = 0
    let _islandNameSprite: Sprite
    let _coinSprites: Sprite[] = []
    let _skullSprites: Sprite[] = []

    function destroy() {
        scene.setBackgroundImage(assets.image`empty`)
        _bulkyBgSprite.destroy()
        if (_islandNameSprite) {
            _islandNameSprite.destroy()
        }
        _coinSprites.forEach((coin) => coin.destroy())
        _skullSprites.forEach((skull) => skull.destroy())
        islands.forEach((island) => {
            if (island.flagSprite) {
                island.flagSprite.destroy()
            }
        })

        // Remove all listeners and run the beat-em-up phase
        controller.player1.left.removeEventListener(ControllerButtonEvent.Pressed, moveCursorLeft)
        controller.player1.right.removeEventListener(ControllerButtonEvent.Pressed, moveCursorRight)
        controller.player1.A.removeEventListener(ControllerButtonEvent.Pressed, selectIsland)

        islands.forEach(island => {
            if (island.flagSprite) {
                island.flagSprite.destroy()
            }
        })
        waves.forEach(wave => wave.destroy())
        if (cursor) {
            cursor.destroy()
        }

        music.stopAllSounds()

        TreasureStats.hide()
        PirateLives.hide()
    }

    function selectIsland() {
        // We can't select the island too quickly after seeing this scene
        if (control.millis() - _leftIslandTick < _selectIslandDelay) return

        destroy()

        _onSelectIsland(_islands[currentSelectedIslandIndex])
    }

    function moveCursorLeft() {
        currentSelectedIslandIndex += 1
        if (currentSelectedIslandIndex > islands.length - 1) {
            currentSelectedIslandIndex = 0
        }
        renderCursor(islands[currentSelectedIslandIndex], cursor)
        renderIslandStats(islands[currentSelectedIslandIndex])
    }

    function moveCursorRight() {
        currentSelectedIslandIndex -= 1
        if (currentSelectedIslandIndex < 0) {
            currentSelectedIslandIndex = islands.length - 1
        }
        renderCursor(islands[currentSelectedIslandIndex], cursor)
        renderIslandStats(islands[currentSelectedIslandIndex])
    }

    export function init({ islands, currentIsland }: { islands: Array<Island>, currentIsland: Island }) {
        // Give us a second before allowing us to select an island
        _leftIslandTick = control.millis()
        _islands = islands

        scene.setBackgroundColor(6)
        // scene.setBackgroundImage(assets.image`Map`)
        _bulkyBgSprite = sprites.create(assets.image`Map`)
        _bulkyBgSprite.z = 2

        music.play(music.createSong(assets.song`We be Sailin`), music.PlaybackMode.LoopingInBackground)
        TreasureStats.show({ combination: ['island', 'boat'], location: 'left' })
        
        // Cursor
        cursor = sprites.create(assets.image`empty`)
        cursor.z = 120

        // Render the waves
        waves = Utils.getArrayOfLength(15).map(() => {
            const x = Math.randomRange(0, 160)
            const y = Math.randomRange(0, 140)
            const sprite = sprites.create(assets.image`empty`)
            sprite.x = x
            sprite.y = y
            animation.runImageAnimation(sprite, assets.animation`wave`, 500, true)
            return sprite
        })

        // Keyboard inputs
        controller.player1.left.addEventListener(ControllerButtonEvent.Pressed, moveCursorLeft)
        controller.player1.right.addEventListener(ControllerButtonEvent.Pressed, moveCursorRight)
        controller.player1.A.addEventListener(ControllerButtonEvent.Pressed, selectIsland)

        // Initial render of the cursor
        renderCursor(currentIsland ? currentIsland : islands[currentSelectedIslandIndex], cursor)
        // And selected island
        renderIslandStats(islands[currentSelectedIslandIndex])
        // And the owner flags
        renderFlags(islands)
        // Show lives
        PirateLives.show()

        // Now check to see if we have any more islands to visit
        checkWinCondition()
    }
    
    export function onSelectIsland(callback: (island: Island) => void) {
        _onSelectIsland = callback
    }

    export function onWin(callback: () => void) {
        _onWin = callback
    }

    function checkWinCondition() {
        // If no island is owned by anyone BUT players
        if (!islands.some((island) => island.ownedBy !== 'players')) {
            destroy()
            _onWin()
        }
    }

    function renderCursor(island: Island, cursor: Sprite) {
        cursor.x = island.x
        cursor.y = island.y
        animation.runImageAnimation(cursor, assets.animation`cursor`, 500, true)
    }

    function renderIslandStats(island: Island) {
        if (_islandNameSprite) {
            _islandNameSprite.destroy()
        }
        _coinSprites.forEach((coin) => coin.destroy())
        _skullSprites.forEach((skull) => skull.destroy())

        // Render island name
        _islandNameSprite = textsprite.create(island.name, 15, 0)
        _islandNameSprite.x = 80,
        _islandNameSprite.y = 115

        // Render riches (rounded(100) = 1 coin)
        const coinCount = Math.floor(Math.round(island.riches / 100))
        if (coinCount > 0) {
            _coinSprites = Utils.getArrayOfLength(coinCount).map((index) => {
                const sprite = sprites.create(assets.image`Coin`)
                sprite.x = 80 + (_islandNameSprite.width / 2) + 6
                sprite.y = 115 - (index * 2)
                return sprite
            })
        }
        const skullCount = Math.floor(Math.round(island.risk))
        if (skullCount > 0) {
            _skullSprites = Utils.getArrayOfLength(skullCount).map((index) => {
                const sprite = sprites.create(assets.image`Skull`)
                sprite.x = 80 - (_islandNameSprite.width / 2) - 6
                sprite.y = 115 - (index * 2)
                return sprite
            })
        }
    }

    function renderFlags(islands: Array<Island>) {
        islands.forEach((island) => {
            if (island.ownedBy === 'players') {
                island.flagSprite = sprites.create(assets.image`empty`)
                island.flagSprite.x = island.x
                island.flagSprite.y = island.y
                island.flagSprite.z = island.y

                animation.runImageAnimation(
                    island.flagSprite,
                    assets.animation`Your Flag`,
                    200,
                    true
                )
            }
        })
    }
    
    export function render() {}
}
