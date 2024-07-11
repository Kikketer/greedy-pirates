/**
 * Greedy Pirates
 * Art: Eli (somewhat)
 * Music: Ez (somewhat)
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
enum SpriteKind {
    PlayerAttackLeft,
    PlayerAttackRight,
}

const playerState = {
    currentIsland: ''
}

let currentState: States
let currentIsland: Map.Island

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

console.log('Yarrrgh! Ye be lookin\' at de code!')

game.onUpdate(() => {
    switch(currentState) {
        case States.Overview:
            Map.render()
            break;
        case States.Island:
            Island.render();
            break;
        default:
        break;
    }
})

function switchState(state: States) {
    currentState = state
    switch (currentState) {
        case States.Overview:
            Map.init(islands)
        break;
        case States.Island:
            Island.init(currentIsland)
        break;
        default:
            console.log('Default State')
    }
}

function startGame() {
    scene.setBackgroundColor(6)

    Map.onSelectIsland((island: Map.Island) => {
        console.log('Selected island! ' + island.name)
        currentIsland = island
        switchState(States.Island)
    })

    Island.onLeaveIsland(() => {
        console.log('Left island')
        currentIsland = undefined
        switchState(States.Overview)
    })

    switchState(States.Overview)
}

startGame()