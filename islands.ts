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
        flagSprite?: Sprite,
        // The number of screens in the level
        // Development time limits = random scenes :)
        segments: number
        // Island is owned by us them or no one
        ownedBy?: 'players' | 'scallywags'
    }

    export const islands: Array<Island> = [
        {
            id: 0,
            name: 'Treasarr Island',
            x: 48,
            y: 91,
            segments: 1,
            ownedBy: 'players'
        },
        {
            id: 1,
            name: 'West Pincharr',
            x: 18,
            y: 31,
            riches: 100,
            risk: 1,
            segments: 6,
            ownedBy: null
        },
        {
            id: 2,
            name: 'Narrrthpalms',
            x: 52,
            y: 8,
            riches: 200,
            risk: 1,
            segments: 6,
            ownedBy: null
        },
        {
            id: 3,
            name: 'Longhall',
            x: 41,
            y: 47,
            riches: 300,
            risk: 2,
            segments: 6,
            ownedBy: null
        },
        {
            id: 4,
            name: 'Shorthouse',
            x: 60,
            y: 50,
            riches: 200,
            risk: 2,
            segments: 3,
            ownedBy: null
        },
        {
            id: 5,
            name: 'Mt. Swag',
            x: 22,
            y: 84,
            riches: 400,
            risk: 5,
            segments: 6,
            ownedBy: null
        },
        {
            id: 6,
            name: 'Fort Bladeside',
            x: 79,
            y: 91,
            riches: 400,
            risk: 3,
            segments: 6,
            ownedBy: null
        },
        {
            id: 1,
            name: 'Rejection',
            x: 122,
            y: 22,
            riches: 100,
            risk: 3,
            segments: 6,
            ownedBy: null
        },
        {
            id: 1,
            name: 'Primalburrrg',
            x: 110,
            y: 61,
            riches: 200,
            risk: 5,
            segments: 6,
            ownedBy: null
        },
        {
            id: 1,
            name: 'Capitarrg',
            x: 144,
            y: 56,
            riches: 400,
            risk: 6,
            segments: 6,
            ownedBy: null
        }
    ]
}
