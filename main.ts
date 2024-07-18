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
    TreasureIsland,
    Travel,
    BoatBattle,
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

const version: string = 'v1.0'
const debugMode: boolean = false

let currentState: States
let currentIsland: Map.Island = Map.islands[0]
let treasureSprite: Sprite

console.log('Yarrrgh! Thee Kraken lives in this here code!')

game.onUpdate(() => {
    switch(currentState) {
        case States.Overview:
            Map.render()
            break;
        case States.Island:
            Island.render();
            break;
        case States.BoatBattle:
            BoatBattle.render()
            break;
        case States.TreasureIsland:
            TreasureIsland.render()
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
            Map.init({ islands: Map.islands, currentIsland })
        break;
        case States.Island:
            Island.init({ island: currentIsland })
        break;
        case States.BoatBattle:
            BoatBattle.init()
        break;
        case States.AllDead:
            AllDead.init()
        break;
        case States.GameOver:
            GameOver.init()
        break;
        case States.Win:
            Win.init()
        break;
        case States.Travel:
            Travel.init({ targetIsland: currentIsland })
        break;
        case States.TreasureIsland:
            TreasureIsland.init()
        break;
        case States.Menu:
        default:
            Menu.init()
    }
}

function startGame(initialState?: States) {
    Map.onSelectIsland((island: Map.Island) => {
        if (currentIsland && island.id !== currentIsland.id) {
            currentIsland = island
            switchState(States.Travel)
        } else if (island.id === 0) {
            currentIsland = island
            switchState(States.TreasureIsland)
        } else {
            currentIsland = island
            // If you re-select the same island you don't floatyboaty
            switchState(States.Island)
        }
    })
    Map.onWin(() => {
        switchState(States.Win)
    })

    Island.onLeaveIsland(() => {
        switchState(States.Overview)
    })
    Island.onAllDead(() => {
        if (PirateLives.currentPirateCount <= 0) {
            switchState(States.GameOver)
        } else {
            switchState(States.AllDead)
        }
    })

    BoatBattle.onWin(() => {
        if (currentIsland.id === 0) {
            switchState(States.TreasureIsland)
        } else {
            switchState(States.Island)
        }
    })
    BoatBattle.onLoose(() => {
        if (PirateLives.currentPirateCount <= 0) {
            switchState(States.GameOver)
        } else if (currentIsland.id === 0) {
            switchState(States.TreasureIsland)
        } else {
            switchState(States.Overview)
        }
    })

    Travel.onBoatBattle(() => {
        switchState(States.BoatBattle)
    })
    Travel.onLandOnIsland(() => {
        currentIsland = currentIsland ? currentIsland : Map.islands[0]
        if (currentIsland.id === 0) {
            // Our own Island
            switchState(States.TreasureIsland)
        } else {
            switchState(States.Island)
        }
    })

    TreasureIsland.onComplete(() => {
        switchState(States.Overview)
    })

    Menu.onStartGame(() => {
        switchState(States.Overview)
    })

    AllDead.onRevive(() => {
        switchState(States.Overview)
    })

    switchState(initialState ? initialState : States.Menu)
}

startGame()