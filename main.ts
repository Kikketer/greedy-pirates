/**
 * Greedy Pirates
 * Art: Eli
 * Music: Ez
 * Coding: Chris
 * 
 * Top down level select to pick which island to visit.
 * Once an island is picked, a side-scrolling multiplayer beat-em-up game
 * [phase 1 end]
 * At the end of each level is a treasure, that is added to the totals
 * Pirates must stash their treasure on their own island
 * When you beat a level/island you "claim" that island with your flag
 * Other pirates will attack islands and claim them
 * Claiming an island will allow you to slowly gain treasure (that stays on that island)
 * You must visit your own islands and move the treasure to your own treasure island
 */

enum States {
    Overview,
    Island
}

type Island = {
    id: number,
    name: string,
    x: number,
    y: number,
    riches?: number,
    image: Image
    sprite?: Sprite
}

const islands: Array<Island> = [
    {
        id: 0,
        name: 'Treasure Island',
        x: 10,
        y: 25,
        riches: 100,
        image: assets.image`island`
    },
    {
        id: 0,
        name: 'Beach Island',
        x: 55,
        y: 39,
        riches: 100,
        image: assets.image`island`
    }
]

const playerState = {
    currentIsland: ''
}

let currentState = States.Overview

function render() {
    scene.setBackgroundColor(6)
    if (currentState === States.Overview) {
        let currentSelectedIslandIndex = 0
        // Cursor
        const cursor = sprites.create(assets.image`empty`)

        // Render the waves
        const waves = Utils.getArrayOfLength(15).map(() => {
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

        function selectIsland() {
            // Remove all listeners and run the beat-em-up phase
            controller.left.removeEventListener(ControllerButtonEvent.Pressed, moveCursorLeft)
            controller.right.removeEventListener(ControllerButtonEvent.Pressed, moveCursorRight)
            controller.A.removeEventListener(ControllerButtonEvent.Pressed, selectIsland)
            currentState = States.Island

            islands.forEach(island => {
                if (island.sprite) {
                    island.sprite.destroy()
                }
            })
            waves.forEach(wave => wave.destroy())

            if (cursor) {
                cursor.destroy()
            }

            render()
        }

        // Keyboard inputs
        controller.left.addEventListener(ControllerButtonEvent.Pressed, moveCursorLeft)
        controller.right.addEventListener(ControllerButtonEvent.Pressed, moveCursorRight)
        controller.A.addEventListener(ControllerButtonEvent.Pressed, selectIsland)

        // Initial render of the cursor
        renderCursor(islands[0], cursor)
    } else if (currentState === States.Island) {
        scene.setBackgroundColor(3)
    }
}

function renderCursor(island: Island, cursor: Sprite) {
    cursor.x = island.x
    cursor.y = island.y
    animation.runImageAnimation(cursor, assets.animation`cursor`, 500, true)
}

render()