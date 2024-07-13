namespace Map {
    export type Island = {
        id: number,
        name: string,
        x: number,
        y: number,
        // The quantity of militia, this grows as things get heated
        risk?: number,
        // The quantity of riches, this grows as the island is left alone
        riches?: number,
        image: Image,
        sprite?: Sprite,
        // The number of screens in the level
        // Time limits = random scenes :)
        segments: number
    }

    let cursor: Sprite
    let waves: Array<Sprite> = []
    let currentSelectedIslandIndex = 0
    let _onSelectIsland: (island: Island) => void
    let _islands: Array<Island>

    function selectIsland() {
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

        if (cursor) {
            cursor.destroy()
        }

        music.stopAllSounds()

        _onSelectIsland(_islands[currentSelectedIslandIndex])
    }

    function moveCursorLeft() {
        currentSelectedIslandIndex += 1
        if (currentSelectedIslandIndex > islands.length - 1) {
            currentSelectedIslandIndex = 0
        }
        renderCursor(islands[currentSelectedIslandIndex], cursor)
    }

    function moveCursorRight() {
        currentSelectedIslandIndex -= 1
        if (currentSelectedIslandIndex < 0) {
            currentSelectedIslandIndex = islands.length - 1
        }
        renderCursor(islands[currentSelectedIslandIndex], cursor)
    }

    export function init(islands: Array<Island>) {
        scene.setBackgroundColor(6)

        // music.play(music.createSong(assets.song`We Boat`), music.PlaybackMode.LoopingInBackground)
        
        _islands = islands
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

        // Rendering the islands
        islands.forEach(island => {
            const sprite = sprites.create(island.image)
            sprite.x = island.x
            sprite.y = island.y
            island.sprite = sprite
        })

        // Keyboard inputs
        controller.player1.left.addEventListener(ControllerButtonEvent.Pressed, moveCursorLeft)
        controller.player1.right.addEventListener(ControllerButtonEvent.Pressed, moveCursorRight)
        controller.player1.A.addEventListener(ControllerButtonEvent.Pressed, selectIsland)

        // Initial render of the cursor
        renderCursor(islands[0], cursor)
    }
    
    export function onSelectIsland(callback: (island: Island) => void) {
        _onSelectIsland = callback
    }

    function renderCursor(island: Map.Island, cursor: Sprite) {
        cursor.x = island.x
        cursor.y = island.y
        animation.runImageAnimation(cursor, assets.animation`cursor`, 500, true)
    }
    
    export function render() {}
}
