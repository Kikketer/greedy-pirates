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

    idleRightAnimation: Image[] = assets.animation`Pirate Stand`
    idleLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Stand`)
    attackLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Swing w Sword`)
    attackRightAnimation: Image[] = assets.animation`Pirate Swing w Sword`
    parryLeftSprite: Image = assets.image`Pirate`
    parryRightSprite: Image = assets.image`Pirate`
    walkRightAnimation: Image[] = assets.animation`Pirate Walk`
    walkLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Walk`)

    sprite: Sprite
    facing: 'left' | 'right'
    controller: controller.Controller
    isAttacking?: 'left' | 'right'
    isParrying?: 'left' | 'right'
    _lastAttackTick: number = 0
    _isAttackingTimeout: number
    // This action object is for registering event listeners
    // It keeps all functions stable per this class so we can removeEventListners
    action: ActionObject = {
        attack: () => undefined,
        parry: () => undefined,
        faceLeft: () => undefined,
        faceRight: () => undefined
    }

    public health: number

    constructor({ control, playerNumber, onAttack }: { 
            control: controller.Controller,
            playerNumber: 0 | 1,
            onAttack: (T: AttackCallbackParams) => void
        }) {
        this.health = 100
        this.facing = 'right'

        this.sprite = sprites.create(assets.image`Pirate`, SpriteKind.Player)
        this.sprite.setStayInScreen(true)
        if (playerNumber === 1) {
            this._setupAnimationColors(4)
        }
        this._setupAnimations()
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

    public destroy() {
        this.sprite.destroy()
        // Remove all event listeners
        this.controller.A.removeEventListener(ControllerButtonEvent.Pressed, this.action.attack)
        this.controller.B.removeEventListener(ControllerButtonEvent.Pressed, this.action.parry)
        this.controller.left.removeEventListener(ControllerButtonEvent.Pressed, this.action.faceLeft)
        this.controller.right.removeEventListener(ControllerButtonEvent.Pressed, this.action.faceRight)
    }

    public render() {
        if (!this.isAttacking) {
            this.sprite.x += this.controller.dx(50)
            this.sprite.y += this.controller.dy(50)
        }
        this.sprite.z = this.sprite.y
    }

    public hit(enemy: Militia, damage: number) {
        if (this.isParrying) {
            music.play(Pirate.parrySound, music.PlaybackMode.InBackground)
            return
        }

        scene.cameraShake(2, 500)
        this.health -= damage
        // Add death!
    }

    parry() {
        console.log('parry ' + this.controller.playerIndex)
    }

    attack(attackCallback: (T: AttackCallbackParams) => void) {
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

    face(direction: 'left' | 'right') {
        if (direction === 'left' && this.facing === 'right') {
            this.facing = 'left'
        } else if (direction === 'right' && this.facing === 'left') {
            this.facing = 'right'
        }
    }

    _setupAnimationColors(toColor: number = 14) {
        Utils.swapAnimationColors(this.idleLeftAnimation, 14, toColor)
        Utils.swapAnimationColors(this.idleRightAnimation, 14, toColor)
        Utils.swapAnimationColors(this.attackLeftAnimation, 14, toColor)
        Utils.swapAnimationColors(this.attackRightAnimation, 14, toColor)
        Utils.swapAnimationColors(this.walkRightAnimation, 14, toColor)
        Utils.swapAnimationColors(this.walkLeftAnimation, 14, toColor)
    }

    _setupAnimations() {
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
