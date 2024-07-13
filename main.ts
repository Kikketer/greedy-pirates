/**
 * Greedy Pirates
 * Art: Eli (the first drafts)
 * Music: Ez (the first drafts)
 * Coding and Fill in the Gap: Chris
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
    Menu,
    Overview,
    Island
}
enum SpriteKind {
    PlayerAttackLeft,
    PlayerAttackRight,
}
type TreasureStat = {
    onBoat?: number
    onIsland?: number
}
type OnUpdateTreasureProps = TreasureStat & {
    pulledFromIsland ?: Map.Island['id']
}

const playerState = {
    currentIsland: ''
}

let currentState: States
let currentIsland: Map.Island
let treasure: TreasureStat = {
    onBoat: 0,
    onIsland: 0
}
let treasureSprite: Sprite

const islands: Array<Map.Island> = [
    {
        id: 0,
        name: 'Treasure Island',
        x: 10,
        y: 25,
        riches: 100,
        risk: 0,
        image: assets.image`island`,
        segments: 2,
    },
    {
        id: 1,
        name: 'Beach Island',
        x: 55,
        y: 39,
        riches: 100,
        risk: 0,
        image: assets.image`island`,
        segments: 6
    }
]

console.log('Yarrrgh! Beware of ye monsters in thee code!')

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

function updateTreasure({ onBoat, onIsland, pulledFromIsland }: OnUpdateTreasureProps) {
    console.log('Updating treasure ' + onBoat + ':' + pulledFromIsland)
    if (pulledFromIsland != null) {
        // Find the island
        const island = islands.find(i => {
            return i.id === pulledFromIsland
        })

        console.log("Found island " + JSON.stringify(island))
        if (island) {
            treasure.onBoat += island.riches
            island.riches = 0
        }
    } else {
        // If not from an island we assume from the boat
        treasure.onIsland += treasure.onBoat
        treasure.onBoat = 0
    }

    showTreasure()
}

function showTreasure() {
    if (treasureSprite) {
        treasureSprite.destroy()
    }

    treasureSprite = textsprite.create(treasure.onBoat + '', 1, 15)
    treasureSprite.x = 80
    treasureSprite.y = 8
    treasureSprite.z = 100
}

function switchState(state: States) {
    currentState = state
    switch (currentState) {
        case States.Overview:
            Map.init(islands)
        break;
        case States.Island:
            Island.init({ island: currentIsland, onTreasureUpdate: updateTreasure })
        break;
        default:
            console.log('Default State')
    }
}

function startGame() {
    showTreasure()

    Map.onSelectIsland((island: Map.Island) => {
        currentIsland = island
        switchState(States.Island)
    })

    Island.onLeaveIsland(() => {
        currentIsland = undefined
        switchState(States.Overview)
    })

    switchState(States.Overview)
}

startGame()