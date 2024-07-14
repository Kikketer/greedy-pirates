/**
 * Greedy Pirates
 * Art + Music: Eli
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
    Island,
    AllDead,
    GameOver,
    Win
}
enum SpriteKind {
    PlayerAttackLeft,
    PlayerAttackRight,
}

const playerState = {
    currentIsland: ''
}

const version: string = 'v0.5'
const debugMode: boolean = false

let currentState: States
let currentIsland: Map.Island
let treasureSprite: Sprite

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

if (debugMode) {
    game.onUpdateInterval(5000, () => {
        console.log('Delta ' + control.eventContext().deltaTimeMillis)
        // GC Stats only works on hardware
        // console.log('Mem: ' + control.gcStats())
        control.heapSnapshot()
    })
}

function switchState(state: States) {
    currentState = state
    switch (currentState) {
        case States.Overview:
            Map.init(Map.islands)
        break;
        case States.Island:
            Island.init({ island: currentIsland })
        break;
        case States.AllDead:
            AllDead.init()
        break;
        default:
            Menu.init()
    }
}

function startGame() {
    Map.onSelectIsland((island: Map.Island) => {
        currentIsland = island
        switchState(States.Island)
    })

    Island.onLeaveIsland(() => {
        currentIsland = undefined
        switchState(States.Overview)
    })
    Island.onAllDead(() => {
        // Keep the current island
        switchState(States.AllDead)
    })

    Menu.onStartGame(() => {
        switchState(States.Overview)
    })

    AllDead.onRevive(() => {
        switchState(States.Overview)
    })

    switchState(States.Menu)
}

startGame()