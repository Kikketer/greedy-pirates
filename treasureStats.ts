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
    let currentPosition: 'left' | 'center' = 'left'
    
    export let currentTreasure: TreasureStat = {
        onBoat: 151,
        onIsland: 0,
        inPocket: 0
    }

    export function getTotal(): number {
        return currentTreasure.onBoat + currentTreasure.onIsland + currentTreasure.inPocket
    }

    export function show({ combination, location }: { combination?: Array<'island' | 'boat' | 'pocket'>, location?: 'left' | 'center' }) {
        currentDisplayCombo = combination ? combination : currentDisplayCombo
        currentPosition = location ? location : currentPosition

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

            const locX = currentPosition === 'center' ? 80 : 5

            const scoreSprite = textsprite.create(text + '', 1, 15)
            scoreSprite.x = locX + 7 + (scoreSprite.width / 2)
            scoreSprite.y = currentY
            scoreSprite.z = 100
            treasureSprites.push(scoreSprite)

            iconSprite.x = locX
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
