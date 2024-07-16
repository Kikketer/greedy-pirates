class EnemyPirate extends Militia {
    static walkRightAnimation: Image[] = assets.animation`Pirate Walk`

    constructor({ x, y, target }: { x: number, y: number, target: Pirate }) {
        super({ x, y, target })
    }
}
