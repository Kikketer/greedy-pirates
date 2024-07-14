namespace TreasureStats {
    export type TreasureStat = {
        onBoat?: number
        onIsland?: number
        inPocket?: number
    }
    export type OnUpdateTreasureProps = TreasureStat & {
        pulledFromIsland?: Map.Island['id']
    }

    const boatIcon: Image = assets.image`Boat Icon`
    const islandIcon: Image = assets.image`Island Icon`
    const pocketIcon: Image = assets.image`Pocket Icon`

    let treasureSprites: Sprite[] = []
    let iconSprites: Sprite[] = []
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

        let currentY = 8

        treasureSprites.forEach(t => t.destroy())
        iconSprites.forEach(icon => icon.destroy())

        currentDisplayCombo.forEach((statType) => {
            let text: number
            let iconSprite: Sprite
            switch(statType) {
                case 'boat':
                    text = currentTreasure.onBoat
                    iconSprite = sprites.create(boatIcon)
                break;
                case 'island':
                    text = currentTreasure.onIsland
                    iconSprite = sprites.create(islandIcon)
                break;
                default:
                    text = currentTreasure.inPocket
                    iconSprite = sprites.create(pocketIcon)
                break;
            }

            const scoreSprite = textsprite.create(text + '', 1, 15)
            scoreSprite.x = 80
            scoreSprite.y = currentY
            scoreSprite.z = 100
            treasureSprites.push(scoreSprite)

            iconSprite.x = 80 - (scoreSprite.width / 2 + 3)
            iconSprite.x = 70
            iconSprite.y = currentY
            iconSprites.push(iconSprite)
            currentY += 9
        })        
    }

    export function hide() {
        treasureSprites.forEach(t => t.destroy())
        iconSprites.forEach(i => i.destroy())
    }
}
