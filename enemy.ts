class Enemy {
    static speed = 10

    public sprite: Sprite
    public health: number = 1
    public riches = 1

    protected _currentTarget: Pirate
    protected _nextAttackTime: number = 0
    protected _lastAttackTick: number = 0
    protected _facing: 'left' | 'right' = 'left'
    protected _isAttacking: boolean  = false
    protected _lastDirectionTick: number = 0

    constructor({ x, y, target, sprite }: { x: number, y: number, target: Pirate, sprite: Sprite }) {
        this.sprite = sprite
        this.sprite.x = x
        this.sprite.y = y

        // On initial spawn they are quick to attack!
        this._nextAttackTime = Math.randomRange(Militia.attackDelayMin / 2, Militia.attackDelayMax / 2)
        this._lastAttackTick = control.millis()

        this._currentTarget = target
    }

    public destroy() {
        if (this.sprite) {
            this.sprite.destroy()
        }
    }

    public setCurrentTarget(pirate: Pirate) {
        if (pirate.health > 0 && this.health > 0) {
            this._currentTarget = pirate
            this.sprite.follow(this._currentTarget.sprite, Enemy.speed)
        }
    }

    protected walk(direction?: 'left' | 'right') {
        this._facing = direction ? direction : this._facing
        this.sprite.follow(this._currentTarget.sprite, Enemy.speed)
    }

    protected hit(damage: number) {
        this.health -= damage

        if (this.health <= 0) {
            this.sprite.follow(this._currentTarget.sprite, 0)
        }
    }

    protected attack() {
        // Stop moving
        this.sprite.follow(this._currentTarget.sprite, 0)
        this._isAttacking = true
    }

    protected die() {}

    public render() {
        // Check your distance from the target randomly
        if ((control.millis() - this._lastDirectionTick) > Militia.directionChangeInterval) {
            this._lastDirectionTick = control.millis()
            if (Math.abs(Utils.getDistance(
                { x: this.sprite.x, y: this.sprite.y },
                { x: this._currentTarget.sprite.x, y: this._currentTarget.sprite.y }
            )) < 30) {
                this.sprite.follow(this._currentTarget.sprite, 0)
            } else {
                this.sprite.follow(this._currentTarget.sprite, Enemy.speed)
            }
        }

        // Face your target
        if (this._currentTarget.sprite.x < this.sprite.x && this._facing === 'right' && !this._isAttacking) {
            this.walk('left')
        } else if (this._currentTarget.sprite.x > this.sprite.x && this._facing === 'left' && !this._isAttacking) {
            this.walk('right')
        }
        this.sprite.z = this.sprite.y
    }
}
