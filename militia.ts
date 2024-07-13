class Militia {
    static walkRightAnimation: Image[] = assets.animation`Militia Walk`
    static walkLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Militia Walk`)
    static attackRightAnimation: Image[] = assets.animation`Militia Shoot`
    static attackLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Militia Shoot`)
    static parrySound: music.SoundEffect = music.createSoundEffect(WaveShape.Noise, 5000, 5000, 255, 0, 100, SoundExpressionEffect.Vibrato, InterpolationCurve.Curve)
    
    static speed: number = 10
    static directionChangeInterval: number = 1000
    static attackDelayMin: number = 4000
    static attackDelayMax: number = 6000

    sprite: Sprite
    currentTarget?: Pirate
    facing: 'left' | 'right' = 'right'
    _nextAttackTime: number
    _lastAttackTick: number
    _lastDirectionTick: number = 0
    _isAttacking: boolean = false
    _isParrying: boolean = false
    public health: number = 1

    constructor({ x, y, target }: { x: number, y: number, target?: Pirate }) {
        this.sprite = sprites.create(assets.animation`Militia Walk`[0])
        this.place(x, y)
        this._nextAttackTime = 4000
        this._lastAttackTick = 0

        this.currentTarget = target

        this.walk()
    }

    public place(x: number, y: number) {
        this.sprite.x = x
        this.sprite.y = y
    }

    public hit(damage: number) {
        if (this._isParrying) {
            music.play(Militia.parrySound, music.PlaybackMode.InBackground)
            return
        }
        
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
        // Attack randomly
        if ((control.millis() - this._lastAttackTick) > this._nextAttackTime) {
            this._lastAttackTick = control.millis()
            this._nextAttackTime = Math.randomRange(Militia.attackDelayMin, Militia.attackDelayMax)
            this.attack()
        }
        // Check your distance from the target randomly (TODO)
        // if ((control.millis() - this._lastDirectionTick) > Militia.directionChangeInterval) {
        //     this._lastDirectionTick = control.millis()
        // }

        // Face your target
        if (this.currentTarget.sprite.x < this.sprite.x && this.facing === 'right' && !this._isAttacking) {
            this.walk('left')
        } else if (this.currentTarget.sprite.x > this.sprite.x && this.facing === 'left' && !this._isAttacking) {
            this.walk('right')
        }
        this.sprite.z = this.sprite.y
    }

    walk(direction?: 'left' | 'right') {
        this.facing = direction ? direction : this.facing
        this.sprite.follow(this.currentTarget.sprite, Militia.speed)

        if (this.facing === 'left') {
            animation.runImageAnimation(
                this.sprite,
                Militia.walkLeftAnimation,
                500,
                true
            )
        } else {
            animation.runImageAnimation(
                this.sprite,
                Militia.walkRightAnimation,
                500,
                true
            )
        }
    }

    attack() {
        // Stop moving
        this.sprite.follow(this.currentTarget.sprite, 0)
        this._isAttacking = true
        // Play the fire animation
        if (this.facing === 'right') {
            animation.runImageAnimation(
                this.sprite,
                Militia.attackRightAnimation,
                100,
                false
            )
        } else {
            animation.runImageAnimation(
                this.sprite,
                Militia.attackLeftAnimation,
                100,
                false
            )
        }
        
        // Slightly after the animation we check to see if we hit
        setTimeout(() => {
            // bigCrash or sonar....
            music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground)

            // Check to see that our target is in range and fire the hit
            if (Math.abs(this.sprite.y - this.currentTarget.sprite.y) < 30) {
                this.currentTarget.hit(this, 1)
            }
        }, Militia.attackRightAnimation.length / 2 * 100)

        // Resume walking
        setTimeout(() => {
            this._isAttacking = false
            this.walk()
        }, Militia.attackRightAnimation.length * 100)
        
    }
}
