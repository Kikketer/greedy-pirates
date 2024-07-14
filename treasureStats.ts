namespace TreasureStats {
    export type TreasureStat = {
        onBoat?: number
        onIsland?: number
        inPocket?: number
    }
    export type OnUpdateTreasureProps = TreasureStat & {
        pulledFromIsland?: Map.Island['id']
    }

    let treasureSprite: Sprite
    let currentDisplayCombo: Array<'island' | 'boat' | 'pocket'> = ['island']
    
    const currentTreasure: TreasureStat = {
        onBoat: 0,
        onIsland: 0,
        inPocket: 0
    }

    export function updateTreasure({ onBoat, onIsland, inPocket, pulledFromIsland }: OnUpdateTreasureProps) {
        if (pulledFromIsland != null) {
            // Find the island
            const island = islands.find(i => {
                return i.id === pulledFromIsland
            })

            if (island) {
                currentTreasure.onBoat += island.riches
                island.riches = 0
            }
        } else {
            // If not from an island we assume from the boat
            currentTreasure.onIsland += currentTreasure.onBoat
            currentTreasure.onBoat = 0
        }

        show()
    }

    export function show(combination?: Array<'island' | 'boat' | 'pocket'>) {
        currentDisplayCombo = combination ? combination : currentDisplayCombo

        if (treasureSprite) {
            treasureSprite.destroy()
        }

        treasureSprite = textsprite.create(currentTreasure.onBoat + '', 1, 15)
        treasureSprite.x = 80
        treasureSprite.y = 8
        treasureSprite.z = 100
    }

    export function hide() {
        if (treasureSprite) {
            treasureSprite.destroy()
        }
    }
}
