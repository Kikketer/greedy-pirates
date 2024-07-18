// A subset of a pirate, but could be just an item
type EnemyTarget = { sprite: Sprite, health: number, hit: (who: Enemy, amount: number) => void }

class Enemy {
    static hitSound: music.SoundEffect = music.createSoundEffect(WaveShape.Noise, 1839, 287, 150, 0, 150, SoundExpressionEffect.Warble, InterpolationCurve.Logarithmic)

    public sprite: Sprite
    public health: number = 1
    public riches = 1

    protected _speed: number = 10
    protected _currentTarget: EnemyTarget
    protected _nextAttackTime: number = 0
    protected _lastAttackTick: number = 0
    protected _facing: 'left' | 'right' = 'left'
    protected _isAttacking: boolean  = false
    protected _lastDirectionTick: number = 0
    protected _minDistanceFromTarget: number = 30

    constructor({ x, y, target, sprite, riches, speed, minDistanceFromTarget }: 
        { 
            x: number, 
            y: number, 
            target: EnemyTarget,
            sprite: Sprite, 
            riches?: number, 
            speed?: number, 
            minDistanceFromTarget?: number 
        }) {
            this.sprite = sprite
            this.sprite.x = x
            this.sprite.y = y

            this.riches = riches != null ? riches : 1
            this._speed = speed != null ? speed : 10
            this._minDistanceFromTarget = minDistanceFromTarget != null ? minDistanceFromTarget : 30

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

    public setCurrentTarget(pirate: EnemyTarget) {
        if (pirate.health > 0 && this.health > 0) {
            this._currentTarget = pirate
            this.sprite.follow(this._currentTarget.sprite, this._speed)
        }
    }

    protected walk(direction?: 'left' | 'right') {
        this._facing = direction ? direction : this._facing
        this.sprite.follow(this._currentTarget.sprite, this._speed)
    }

    protected hit({ attacker, damage }: { attacker: Pirate, damage: number }): boolean {
        this.health -= damage

        music.play(Enemy.hitSound, music.PlaybackMode.InBackground)

        if (this.health <= 0) {
            this.sprite.follow(this._currentTarget.sprite, 0)
        }

        return true
    }

    protected attack() {
        // Stop moving
        this.sprite.follow(this._currentTarget.sprite, 0)
        this._isAttacking = true
    }

    protected die() {}

    public render() {
        // No Undead walking!
        if (this.health <= 0 || this._isAttacking) return
        
        // Check your distance from the target randomly
        if ((control.millis() - this._lastDirectionTick) > Militia.directionChangeInterval) {
            this._lastDirectionTick = control.millis()
            if (Utils.getDistance(
                { x: this.sprite.x, y: this.sprite.y },
                { x: this._currentTarget.sprite.x, y: this._currentTarget.sprite.y }
            ) <= this._minDistanceFromTarget) {
                this.sprite.follow(this._currentTarget.sprite, 0)
            } else {
                this.sprite.follow(this._currentTarget.sprite, this._speed)
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
