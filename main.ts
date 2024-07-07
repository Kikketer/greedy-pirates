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
const playerState = {
    currentIsland: ''
}

let currentState: States

const islands: Array<Map.Island> = [
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

// function changeScene(state: States) {
//     if (state === States.Island) {
//         return 
//     } else if (state === States.Overview) {
//         return Map.init(islands, (island: Map.Island) => {
//             console.log('Island selected! ' + island.name)
//             changeScene(States.Island)
//         })
//     }
// }

console.log('Startup')

function switchState(state: States) {
    currentState = state
    switch (currentState) {
        case States.Overview:
            Map.init(islands)
        break;
        case States.Island:
            console.log('State island')
        break;
        default:
            console.log('Default State')
    }
}

function startGame() {
    scene.setBackgroundColor(6)

    Map.onSelectIsland((island: Map.Island) => {
        console.log('Selected island! ' + island.name)
        switchState(States.Island)
    })

    switchState(States.Overview)

    // Map.onSelectIsland((island: Map.Island) => {
    //     currentState = States.Island
    //     switchState()
    // })

    // controller.A.addEventListener(ControllerButtonEvent.Pressed, () => {
    //     console.log("A pressed")
    //     currentState = States.Island
    //     switchState()
    // })
    // controller.B.addEventListener(ControllerButtonEvent.Pressed, () => {
    //     console.log('B Pressed')
    //     currentState = States.Overview
    //     switchState()
    // })

    // if (currentState === States.Overview) {
    // Map.init(islands, (island: Map.Island) => {
    //     console.log('Island selected! '  + island.name)
    //     currentState = States.Island
    //     // changeScene(States.Island)
    // })
    // } else if (currentState === States.Island) {
    //     console.log('Rendering with island')
    //     scene.setBackgroundColor(0)
    //     // maximum the player can move vertically
    //     const maxY = 60
    //     const player1Sprite = sprites.create(assets.image`pirate_a`)
    //     const player2Sprite = sprites.create(assets.image`empty`)

    //     player1Sprite.x = 20
    //     player1Sprite.y = maxY

    //     animation.runImageAnimation(player1Sprite, assets.animation`pirate_idle`, 300, true)
    //     animation.runImageAnimation(player2Sprite, assets.animation`pirate_idle`, 300, true)

    //     mp.setPlayerSprite(mp.getPlayerByNumber(0), player1Sprite)
    //     mp.setPlayerSprite(mp.getPlayerByNumber(1), player2Sprite)

    //     game.onUpdate(() => {
    //         player1Sprite.x += controller.player1.dx(50)
    //         player1Sprite.y += controller.player1.dy(50)
    //         player2Sprite.x += controller.player2.dx(50)
    //         player2Sprite.y += controller.player2.dy(50)

    //         // if (controller.player1.isPressed(ControllerButton.A)) {
    //         //     console.log('Attack!')
    //         // }
    //     })

    //     // controller.player1.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, () => {
    //     //     console.log('Do a thing')
    //     //     // animation.runImageAnimation(player1Sprite, assets.animation`pirate_attack`, 200, false)
    //     // })
    // }
}

startGame()