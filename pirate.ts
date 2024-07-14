type ActionObject = {
    attack: () => void
    parry: () => void
    faceLeft: () => void
    faceRight: () => void
}

type AttackCallbackParams = { pirate: Pirate, direction: 'left' | 'right' }

class Pirate {
    static _attackDelay: number = 400

    static parrySound: music.SoundEffect = music.createSoundEffect(WaveShape.Noise, 5000, 5000, 255, 0, 100, SoundExpressionEffect.Vibrato, InterpolationCurve.Curve)
    static deathSound: music.SoundEffect = music.createSoundEffect(WaveShape.Triangle, 2202, 476, 129, 0, 861, SoundExpressionEffect.Warble, InterpolationCurve.Logarithmic)
    static heartIcon: Image = assets.image`Heart`

    private idleRightAnimation: Image[] = assets.animation`Pirate Stand`
    private idleLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Stand`)
    private attackLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Swing w Sword`)
    private attackRightAnimation: Image[] = assets.animation`Pirate Swing w Sword`
    private parryLeftSprite: Image = assets.image`Pirate`
    private parryRightSprite: Image = assets.image`Pirate`
    private walkRightAnimation: Image[] = assets.animation`Pirate Walk`
    private walkLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Walk`)
    private hurtRightAnimation: Image[] = assets.animation`Pirate Hurt`
    private hurtLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Hurt`)
    private deathRightAnimation: Image[] = assets.animation`Pirate Dead`
    private deathLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Dead`)

    private facing: 'left' | 'right'
    private controller: controller.Controller
    private isAttacking?: 'left' | 'right'
    private isGettingHurt?: boolean = false
    private isParrying?: 'left' | 'right'
    private _topBoundary: number = 0
    private _lastAttackTick: number = 0
    private _isAttackingTimeout: number
    private _statLocation: number[] = [0,0]
    private _healthSprites: Sprite[] = []
    private _onDieCallback: (T: { pirate: Pirate }) => void

    public sprite: Sprite
    // This action object is for registering event listeners
    // It keeps all functions stable per this class so we can removeEventListners
    public action: ActionObject = {
        attack: () => undefined,
        parry: () => undefined,
        faceLeft: () => undefined,
        faceRight: () => undefined
    }
    public health: number

    constructor({ control, playerNumber, onAttack, onDie, topBoundary, statLocation }: { 
            control: controller.Controller,
            playerNumber: 0 | 1,
            onAttack: (T: AttackCallbackParams) => void,
            onDie: (T: { pirate: Pirate }) => void,
            topBoundary: number,
            statLocation: number[]
        }) {
        this.health = 3
        this.facing = 'right'
        this._topBoundary = topBoundary
        this._statLocation = statLocation
        this._onDieCallback = onDie

        this.sprite = sprites.create(assets.image`Pirate`, SpriteKind.Player)
        this.sprite.setStayInScreen(true)
        if (playerNumber === 1) {
            this._setupAnimationColors(4)
        }
        this._setupAnimations()
        this._updateStats()
        // Setup multiplayer
        mp.setPlayerSprite(mp.getPlayerByNumber(playerNumber), this.sprite)

        // Setup the controller handlers
        this.controller = control
        // We can't simply do `this.attack` as the event listeners can't handle a "lambda"
        // And we need to keep a reference to the callback function so we can removeEventListner
        this.action.attack = () => this.attack(onAttack)
        this.action.parry = () => this.parry()
        this.action.faceLeft = () => this.face('left')
        this.action.faceRight = () => this.face('right')

        this.controller.A.addEventListener(ControllerButtonEvent.Pressed, this.action.attack)
        // this.controller.B.addEventListener(ControllerButtonEvent.Pressed, this.action.parry)
        this.controller.left.addEventListener(ControllerButtonEvent.Pressed, this.action.faceLeft)
        this.controller.right.addEventListener(ControllerButtonEvent.Pressed, this.action.faceRight)
    }

    public place(x: number, y: number) {
        // Starting location or teleport
        this.sprite.x = x
        this.sprite.y = y
    }

    public destroy(andDestorySprites: boolean = true) {
        if (andDestorySprites) {
            this.sprite.destroy()
            if (this._healthSprites.length) {
                this._healthSprites.forEach((sprite) => sprite.destroy())
            }
        }
        // Remove all event listeners
        this.controller.A.removeEventListener(ControllerButtonEvent.Pressed, this.action.attack)
        this.controller.B.removeEventListener(ControllerButtonEvent.Pressed, this.action.parry)
        this.controller.left.removeEventListener(ControllerButtonEvent.Pressed, this.action.faceLeft)
        this.controller.right.removeEventListener(ControllerButtonEvent.Pressed, this.action.faceRight)
    }

    public render() {
        if (!this.isAttacking && !this.isGettingHurt && this.health > 0) {
            this.sprite.x += this.controller.dx(50)
            this.sprite.y += this.controller.dy(50)
        }
        this.sprite.z = this.sprite.y

        // Brute force boundaries for the island
        if (this.sprite.y < this._topBoundary) {
            this.sprite.y = this._topBoundary
        }
    }

    public hit(enemy: Militia, damage: number) {
        if (this.isParrying) {
            music.play(Pirate.parrySound, music.PlaybackMode.InBackground)
            return
        }

        this.health -= damage
        this.isGettingHurt = true
        scene.cameraShake(2, 500)

        // Setting to a character animation state that we don't have a rule for
        // to pause any animation changes while we do this animation
        // Setting state removes automatic state updates (aka how we prevent this)
        characterAnimations.setCharacterState(this.sprite, 1024)

        if (this.health > 0) {
            // characterAnimations.clearCharacterState(this.sprite)
            
            animation.runImageAnimation(
                this.sprite,
                this.facing === 'right' ? this.hurtRightAnimation : this.hurtLeftAnimation,
                200,
                false
            )
            setTimeout(() => {
                this.isGettingHurt = false
                // Re-enable the character animations
                characterAnimations.clearCharacterState(this.sprite)
            }, this.hurtLeftAnimation.length * 200)
        } else {
            // You dead!
            // We simply say he's always getting hurt when he's dead
            animation.runImageAnimation(
                this.sprite,
                this.facing === 'right' ? this.deathRightAnimation : this.deathLeftAnimation,
                100,
                false
            )
            
            this.die()

            setTimeout(() => {
                this.isGettingHurt = false
                // Re-enable the character animations
                characterAnimations.clearCharacterState(this.sprite)
            }, this.deathLeftAnimation.length * 100)
        }

        this._updateStats()
    }

    private die() {
        console.log('Yarrg, ye be swimmin\' with d\'fishes! 💀🐟')
        this.destroy(false)
        this._onDieCallback({ pirate: this })
    }

    private parry() {
        console.log('parry ' + this.controller.playerIndex)
    }

    private attack(attackCallback: (T: AttackCallbackParams) => void) {
        // Can't attack more frequently than attackDelay
        if (control.millis() - this._lastAttackTick < Pirate._attackDelay) return

        music.play(Pirate.deathSound, music.PlaybackMode.InBackground)

        // Clear the "is attacking" tag after the animation completes
        clearTimeout(this._isAttackingTimeout)
        this._isAttackingTimeout = setTimeout(() => {}, Pirate._attackDelay)

        const oldPos = { x: this.sprite.x, y: this.sprite.y }

        if (this.facing === 'right') {
            this._lastAttackTick = control.millis()
            this.isAttacking = 'right'
            attackCallback({ pirate: this, direction: 'right' })
            animation.runImageAnimation(
                this.sprite,
                this.attackRightAnimation,
                50,
                false
            )
            // And reset the sprite so it can no longer hit something
            setTimeout(() => {
                this.isAttacking = undefined
            }, this.attackRightAnimation.length * 50)
        } else {
            this._lastAttackTick = control.millis()
            this.isAttacking = 'left'
            attackCallback({ pirate: this, direction: 'left' })
            animation.runImageAnimation(
                this.sprite,
                this.attackLeftAnimation,
                50,
                false
            )
            // And reset the sprite so it can no longer hit something
            setTimeout(() => {
                this.isAttacking = undefined
            }, this.attackLeftAnimation.length * 50)
        }
    }

    private face(direction: 'left' | 'right') {
        if (direction === 'left' && this.facing === 'right') {
            this.facing = 'left'
        } else if (direction === 'right' && this.facing === 'left') {
            this.facing = 'right'
        }
    }

    private _updateStats() {
        if (this._healthSprites.length) {
            this._healthSprites.forEach((sprite) => sprite.destroy())
        }
        
        this._healthSprites = Utils.getArrayOfLength(this.health).map((index) => {
            const s = sprites.create(Pirate.heartIcon)
            // 8 pixel image, 2 pixel margin
            s.x = this._statLocation[0] + (index * s.width + 2)
            s.y = this._statLocation[1]
            return s
        })
    }

    private _setupAnimationColors(toColor: number = 14) {
        Utils.swapAnimationColors(this.idleLeftAnimation, 14, toColor)
        Utils.swapAnimationColors(this.idleRightAnimation, 14, toColor)
        Utils.swapAnimationColors(this.attackLeftAnimation, 14, toColor)
        Utils.swapAnimationColors(this.attackRightAnimation, 14, toColor)
        Utils.swapAnimationColors(this.walkRightAnimation, 14, toColor)
        Utils.swapAnimationColors(this.walkLeftAnimation, 14, toColor)
        Utils.swapAnimationColors(this.hurtRightAnimation, 14, toColor)
        Utils.swapAnimationColors(this.hurtLeftAnimation, 14, toColor)
        Utils.swapAnimationColors(this.deathRightAnimation, 14, toColor)
        Utils.swapAnimationColors(this.deathLeftAnimation, 14, toColor)
    }

    private _setupAnimations() {
        // Setup animations
        // These numbers are coming from the source code: https://github.com/microsoft/arcade-character-animations/blob/main/main.ts
        characterAnimations.loopFrames(
            this.sprite,
            this.walkRightAnimation,
            150,
            // Moving right (and facing right):
            8 + 128
        )
        characterAnimations.loopFrames(
            this.sprite,
            this.walkLeftAnimation,
            150,
            // Moving left (and facing left):
            32 + 512
        )
        characterAnimations.loopFrames(
            this.sprite,
            this.idleLeftAnimation,
            150,
            // Facing left:
            32
        )
        characterAnimations.loopFrames(
            this.sprite,
            this.idleRightAnimation,
            150,
            // Facing right:
            8
        )
        characterAnimations.loopFrames(
            this.sprite,
            this.walkLeftAnimation,
            150,
            // Moving up (facing left):
            32 + 64
        )
        characterAnimations.loopFrames(
            this.sprite,
            this.walkRightAnimation,
            150,
            // Moving up (facing right):
            8 + 64
        )
        characterAnimations.loopFrames(
            this.sprite,
            this.walkLeftAnimation,
            150,
            // Moving down (facing left):
            32 + 256
        )
        characterAnimations.loopFrames(
            this.sprite,
            this.walkRightAnimation,
            150,
            // Moving down (facing right):
            8 + 256
        )
    }
}
