type ActionObject = {
    attack: () => void
    parry: () => void
    faceLeft: () => void
    faceRight: () => void
}

type AttackCallbackParams = { pirate: Pirate, direction: 'left' | 'right' }

class Pirate {
    static _attackDelay: number = 400

    idleRightAnimation: Image[] = assets.animation`Pirate Stand`
    idleLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Stand`)
    attackLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Swing w Sword`)
    attackRightAnimation: Image[] = assets.animation`Pirate Swing w Sword`
    parryLeftSprite: Image = assets.image`Pirate`
    parryRightSprite: Image = assets.image`Pirate`
    walkRightAnimation: Image[] = assets.animation`Pirate Walk`
    walkLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Walk`)

    currentSprite: Sprite
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

        this.currentSprite = sprites.create(assets.image`Pirate`, SpriteKind.Player)
        if (playerNumber === 1) {
            this._setupAnimationColors(4)
        }
        this._setupAnimations()
        // Setup multiplayer
        mp.setPlayerSprite(mp.getPlayerByNumber(playerNumber), this.currentSprite)

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
        this.currentSprite.x = x
        this.currentSprite.y = y
    }

    public destroy() {
        this.currentSprite.destroy()
        // Remove all event listeners
        this.controller.A.removeEventListener(ControllerButtonEvent.Pressed, this.action.attack)
        this.controller.B.removeEventListener(ControllerButtonEvent.Pressed, this.action.parry)
        this.controller.left.removeEventListener(ControllerButtonEvent.Pressed, this.action.faceLeft)
        this.controller.right.removeEventListener(ControllerButtonEvent.Pressed, this.action.faceRight)
    }

    public render() {
        if (!this.isAttacking) {
            this.currentSprite.x += this.controller.dx(50)
            this.currentSprite.y += this.controller.dy(50)
        }
        this.currentSprite.z = this.currentSprite.y
    }

    public hit(damage: number) {
        if (this.isParrying) return
        this.health -= damage

        // Add death!
    }

    parry() {
        console.log('parry ' + this.controller.playerIndex)
    }

    attack(attackCallback: (T: AttackCallbackParams) => void) {
        // Can't attack more frequently than attackDelay
        if (control.millis() - this._lastAttackTick < Pirate._attackDelay) return

        // Clear the "is attacking" tag after the animation completes
        clearTimeout(this._isAttackingTimeout)
        this._isAttackingTimeout = setTimeout(() => {}, Pirate._attackDelay)

        const oldPos = { x: this.currentSprite.x, y: this.currentSprite.y }

        if (this.facing === 'right') {
            // this.currentSprite.destroy()
            // this.currentSprite = sprites.create(this.attackRightAnimation[3], SpriteKind.PlayerAttackRight)
            // this.currentSprite.x = oldPos.x
            // this.currentSprite.y = oldPos.y
            this._lastAttackTick = control.millis()
            this.isAttacking = 'right'
            attackCallback({ pirate: this, direction: 'right' })
            animation.runImageAnimation(
                this.currentSprite,
                this.attackRightAnimation,
                50,
                false
            )
            // And reset the sprite so it can no longer hit something
            setTimeout(() => {
                // this.currentSprite.destroy()
                // this.currentSprite = sprites.create(this.idleRightAnimation[0], SpriteKind.Player)
                // this.currentSprite.x = oldPos.x
                // this.currentSprite.y = oldPos.y
                this.isAttacking = undefined
            }, this.attackRightAnimation.length * 50)
        } else {
            // this.currentSprite.destroy()
            // this.currentSprite = sprites.create(this.attackLeftAnimation[3], SpriteKind.PlayerAttackLeft)
            // this.currentSprite.x = oldPos.x
            // this.currentSprite.y = oldPos.y
            this._lastAttackTick = control.millis()
            this.isAttacking = 'left'
            attackCallback({ pirate: this, direction: 'left' })
            animation.runImageAnimation(
                this.currentSprite,
                this.attackLeftAnimation,
                50,
                false
            )
            // And reset the sprite so it can no longer hit something
            setTimeout(() => {
                // this.currentSprite.destroy()
                // this.currentSprite = sprites.create(this.idleLeftAnimation[0], SpriteKind.Player)
                // this.currentSprite.x = oldPos.x
                // this.currentSprite.y = oldPos.y
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
            this.currentSprite,
            this.walkRightAnimation,
            150,
            // Moving right (and facing right):
            8 + 128
        )
        characterAnimations.loopFrames(
            this.currentSprite,
            this.walkLeftAnimation,
            150,
            // Moving left (and facing left):
            32 + 512
        )
        characterAnimations.loopFrames(
            this.currentSprite,
            this.idleLeftAnimation,
            150,
            // Facing left:
            32
        )
        characterAnimations.loopFrames(
            this.currentSprite,
            this.idleRightAnimation,
            150,
            // Facing right:
            8
        )
        characterAnimations.loopFrames(
            this.currentSprite,
            this.walkLeftAnimation,
            150,
            // Moving up (facing left):
            32 + 64
        )
        characterAnimations.loopFrames(
            this.currentSprite,
            this.walkRightAnimation,
            150,
            // Moving up (facing right):
            8 + 64
        )
        characterAnimations.loopFrames(
            this.currentSprite,
            this.walkLeftAnimation,
            150,
            // Moving down (facing left):
            32 + 256
        )
        characterAnimations.loopFrames(
            this.currentSprite,
            this.walkRightAnimation,
            150,
            // Moving down (facing right):
            8 + 256
        )
    }
}
