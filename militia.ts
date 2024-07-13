class Militia {
    static walkRightAnimation: Image[] = Utils.swapAnimationColors(assets.animation`Militia Walk`, 14, 6)
    static walkLeftAnimation: Image[] = Utils.flipAnimation(Utils.swapAnimationColors(assets.animation`Militia Walk`, 14, 6))
    static speed: number = 10
    static directionChangeInterval: number = 1000
    static attackDelayMin: number = 2000
    static attackDelayMax: number = 2500

    sprite: Sprite
    currentTarget?: Pirate
    _nextAttackTime: number = 400
    _lastAttackTick: number = 0
    _lastDirectionTick: number = 0
    public isParrying: boolean = false
    public health: number = 1

    constructor({ x, y, target }: { x: number, y: number, target?: Pirate }) {
        this.sprite = sprites.create(assets.animation`Militia Walk`[0])
        this.place(x, y)

        animation.runImageAnimation(
            this.sprite,
            Militia.walkRightAnimation,
            300,
            true
        )

        this.currentTarget = target
    }

    public place(x: number, y: number) {
        this.sprite.x = x
        this.sprite.y = y
    }

    public hit(damage: number) {
        if (this.isParrying) return
        this.health -= damage
        
        if (this.health <= 0) {
            console.log('You killed me ')
            this.destory()
        }
    }

    public destory() {
        this.sprite.destroy()
    }

    public render() {
        // Should we attack randomly?
        if ((control.millis() - this._lastAttackTick) > this._nextAttackTime) {
            console.log("FIRE!")
            this._lastAttackTick = control.millis()
            this._nextAttackTime = Math.randomRange(Militia.attackDelayMin, Militia.attackDelayMax)
        }
        if ((control.millis() - this._lastDirectionTick) > Militia.directionChangeInterval) {
            this._lastDirectionTick = control.millis()
            console.log('Checking target')
        }
        // const timeDiff = this._lastAttackTick - control.millis()
        // const tick = control.millis()
    }
}
