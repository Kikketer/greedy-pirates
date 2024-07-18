class EnemyPirate extends Enemy {
    static walkRightAnimation: Image[] = Utils.swapAnimationColors(assets.animation`Pirate Walk`, 14, 2)
    static walkLeftAnimation: Image[] = Utils.flipAnimation(Utils.swapAnimationColors(assets.animation`Pirate Walk`, 14, 2))
    static attackRightAnimation: Image[] = Utils.swapAnimationColors(assets.animation`Pirate Swing w Sword`, 14, 2)
    static attackLeftAnimation: Image[] = Utils.flipAnimation(Utils.swapAnimationColors(assets.animation`Pirate Swing w Sword`, 14, 2))
    static deathRightAnimation: Image[] = Utils.swapAnimationColors(assets.animation`Pirate Dead`, 14, 2)
    static deathLeftAnimation: Image[] = Utils.flipAnimation(Utils.swapAnimationColors(assets.animation`Pirate Dead`, 14, 2))
    static parryRightAnimation: Image[] = Utils.swapAnimationColors([assets.animation`Pirate Swing w Sword`[0]], 14, 2)
    static parryLeftAnimation: Image[] = Utils.swapAnimationColors(Utils.flipAnimation([assets.animation`Pirate Swing w Sword`[0]]), 14, 2)
    static parrySound: music.SoundEffect = music.createSoundEffect(WaveShape.Noise, 5000, 5000, 255, 0, 100, SoundExpressionEffect.Vibrato, InterpolationCurve.Curve)

    static directionChangeInterval: number = 1000
    static attackDelayMin: number = 3000
    static attackDelayMax: number = 5000
    static chanceOfParry: number = 75

    private _isParrying: boolean = false

    constructor({ x, y, target, riches }: { x: number, y: number, target?: EnemyTarget, riches?: number }) {
        super({ x, y, target, sprite: sprites.create(assets.animation`Pirate Walk`[0]), riches, speed: 20, minDistanceFromTarget: 10 })

        // Most often we spawn to the right, so walk left
        this.walk('left')
    }

    public hit({ attacker, damage }: { attacker: Pirate, damage: number }): boolean {
        if (this._isParrying) return false

        if (Math.randomRange(0, 100) < EnemyPirate.chanceOfParry) {
            this._isParrying = true
            // Face the attacker
            if (attacker.sprite.x > this.sprite.x) {
                this.walk('right')
            } else {
                this.walk('left')
            }
            // Pause walking:
            this.sprite.follow(this._currentTarget.sprite, 0)
            music.play(EnemyPirate.parrySound, music.PlaybackMode.InBackground)
            animation.runImageAnimation(
                this.sprite,
                this._facing === 'right' ? EnemyPirate.parryRightAnimation : EnemyPirate.parryLeftAnimation,
                500,
                false
            )
            setTimeout(() => {
                this._isParrying = false
                this.walk()
            }, EnemyPirate.parryRightAnimation.length * 500 + 1000)

            return false
        } else {
            this._isParrying = false
            super.hit({ attacker, damage })

            if (this.health <= 0) {
                animation.runImageAnimation(
                    this.sprite,
                    this._facing === 'right' ? EnemyPirate.deathRightAnimation : EnemyPirate.deathLeftAnimation,
                    100,
                    false
                )
            }

            return true
        }
    }

    public render() {
        // No Undead walking!
        if (this.health <= 0 || this._isAttacking || this._isParrying) return

        super.render()

        // Attack randomly
        if ((control.millis() - this._lastAttackTick) > this._nextAttackTime 
            && Utils.getDistance(this.sprite, this._currentTarget.sprite) < 10) {
                this._lastAttackTick = control.millis()
                this._nextAttackTime = Math.randomRange(EnemyPirate.attackDelayMin, EnemyPirate.attackDelayMax)
                this.attack()
        }
    }

    protected walk(direction?: 'left' | 'right') {
        super.walk(direction)

        if (this._facing === 'left') {
            animation.runImageAnimation(
                this.sprite,
                EnemyPirate.walkLeftAnimation,
                500,
                true
            )
        } else {
            animation.runImageAnimation(
                this.sprite,
                EnemyPirate.walkRightAnimation,
                500,
                true
            )
        }
    }

    protected attack() {
        super.attack()

        // Play the swing animation
        if (this._facing === 'right') {
            animation.runImageAnimation(
                this.sprite,
                EnemyPirate.attackRightAnimation,
                100,
                false
            )
        } else {
            animation.runImageAnimation(
                this.sprite,
                EnemyPirate.attackLeftAnimation,
                100,
                false
            )
        }

        // Slightly after the animation we check to see if we hit
        setTimeout(() => {
            // Make sure we didn't die in this tiny delay:
            if (this.health > 0 && this._currentTarget && this.sprite) {
                // music.play(Pirate.parrySound, music.PlaybackMode.InBackground)

                // Check to see that our target is in range and fire the hit
                if (Utils.getDistance(this.sprite, this._currentTarget.sprite) < 15) {
                    this._currentTarget.hit(this, 1)
                }
            }
        }, EnemyPirate.attackRightAnimation.length / 2 * 100)

        // Resume walking
        setTimeout(() => {
            this._isAttacking = false
            if (this.health > 0 && this._currentTarget && this.sprite) {
                this.walk()
            }
        }, EnemyPirate.attackRightAnimation.length * 100)
    }
}
