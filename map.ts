namespace Map {
    // const weBeSailinSong: Buffer = assets.song`We be Sailin`
    let cursor: Sprite
    let waves: Array<Sprite> = []
    let currentSelectedIslandIndex = 0
    let _onSelectIsland: (island: Island) => void
    let _islands: Array<Island>
    // Prevents smashing and accidentally going to the same island
    let _selectIslandDelay: number = 600
    let _leftIslandTick: number = 0
    let _islandNameSprite: Sprite

    function selectIsland() {
        // We can't select the island too quickly after seeing this scene
        if (control.millis() - _leftIslandTick < _selectIslandDelay) return

        scene.setBackgroundImage(assets.image`empty`)
        if (_islandNameSprite) {
            _islandNameSprite.destroy()
        }

        // Remove all listeners and run the beat-em-up phase
        controller.player1.left.removeEventListener(ControllerButtonEvent.Pressed, moveCursorLeft)
        controller.player1.right.removeEventListener(ControllerButtonEvent.Pressed, moveCursorRight)
        controller.player1.A.removeEventListener(ControllerButtonEvent.Pressed, selectIsland)

        islands.forEach(island => {
            if (island.sprite) {
                island.sprite.destroy()
            }
        })
        waves.forEach(wave => wave.destroy())
        cursor.destroy()

        music.stopAllSounds()

        TreasureStats.hide()

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

    export function init(islands: Array<Island>) {
        // Give us a second before allowing us to select an island
        _leftIslandTick = control.millis()
        _islands = islands

        scene.setBackgroundColor(6)
        scene.setBackgroundImage(assets.image`Map`)
        music.play(music.createSong(assets.song`We be Sailin`), music.PlaybackMode.LoopingInBackground)
        TreasureStats.show(['island', 'boat'])
        
        // Cursor
        cursor = sprites.create(assets.image`empty`)

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
        renderCursor(currentIsland ? currentIsland : islands[0], cursor)
        // And selected island
        renderIslandStats(islands[currentSelectedIslandIndex])
    }
    
    export function onSelectIsland(callback: (island: Island) => void) {
        _onSelectIsland = callback
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
        _islandNameSprite = textsprite.create(island.name, 15, 0)
        _islandNameSprite.x = 80,
        _islandNameSprite.y = 115
    }
    
    export function render() {}
}
