type ActionObject = {
    attack: () => void
    parry: () => void
    faceLeft: () => void
    faceRight: () => void
    goIdle: () => void
}

class Pirate {
    static idleRightAnimation: Image[] = assets.animation`Pirate Stand`
    static idleLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Stand`)
    static attackLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Swing w Sword`)
    static attackRightAnimation: Image[] = assets.animation`Pirate Swing w Sword`
    static parryLeftSprite: Image = assets.image`Pirate`
    static parryRightSprite: Image = assets.image`Pirate`
    static walkRightAnimation: Image[] = assets.animation`Pirate Walk`
    static walkLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Pirate Walk`)

    currentSprite: Sprite
    facing: 'left' | 'right'
    public controller: controller.Controller
    // This action object is for registering event listeners
    // It keeps all functions stable per this class so we can removeEventListners
    action: ActionObject = {
        attack: () => undefined,
        parry: () => undefined,
        faceLeft: () => undefined,
        faceRight: () => undefined,
        goIdle: () => undefined
    }

    public health: number

    constructor({ control, playerNumber }: { control: controller.Controller, playerNumber: 0 | 1 }) {
        // Setup event listeners
        this.health = 100
        this.facing = 'right'

        this.currentSprite = sprites.create(assets.image`Pirate`)
        this.idle()
        // Setup multiplayer
        mp.setPlayerSprite(mp.getPlayerByNumber(playerNumber), this.currentSprite)

        // Setup the controller handlers
        this.controller = control
        // We can't simply do `this.attack` as the event listeners can't handle a "lambda"
        // And we need to keep a reference to the callback function so we can removeEventListner
        this.action.attack = () => this.attack()
        this.action.parry = () => this.parry()
        this.action.faceLeft = () => this.face('left')
        this.action.faceRight = () => this.face('right')
        this.action.goIdle = () => this.idle()

        this.controller.A.addEventListener(ControllerButtonEvent.Pressed, this.action.attack)
        // this.controller.B.addEventListener(ControllerButtonEvent.Pressed, this.action.parry)
        this.controller.left.addEventListener(ControllerButtonEvent.Pressed, this.action.faceLeft)
        this.controller.right.addEventListener(ControllerButtonEvent.Pressed, this.action.faceRight)
        this.controller.left.addEventListener(ControllerButtonEvent.Released, this.action.goIdle)
        this.controller.right.addEventListener(ControllerButtonEvent.Released, this.action.goIdle)
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
        this.controller.left.removeEventListener(ControllerButtonEvent.Released, this.action.goIdle)
        this.controller.right.removeEventListener(ControllerButtonEvent.Released, this.action.goIdle)
    }

    public render() {
        this.currentSprite.x += this.controller.dx(50)
        this.currentSprite.y += this.controller.dy(50)
        this.currentSprite.z = this.currentSprite.y

        if (this.controller.dx(50) > 0) {
            animation.runImageAnimation(
                this.currentSprite,
                Pirate.walkRightAnimation,
                200,
                true
            )
        } else if (this.controller.dx(50) < 0) {
            animation.runImageAnimation(
                this.currentSprite,
                Pirate.walkLeftAnimation,
                200,
                true
            )
        }
    }

    parry() {
        console.log('parry ' + this.controller.playerIndex)
    }

    attack() {
        const attackAnimationSpeed = 50
        if (this.facing === 'right') {
            animation.runImageAnimation(
                this.currentSprite,
                Pirate.attackRightAnimation,
                attackAnimationSpeed,
                false
            )
        } else {
            animation.runImageAnimation(
                this.currentSprite,
                Pirate.attackLeftAnimation,
                attackAnimationSpeed,
                false
            )
        }

        pause(Pirate.attackLeftAnimation.length * attackAnimationSpeed)
    }

    face(direction: 'left' | 'right') {
        console.log('Face ' + direction)
        if (direction === 'left' && this.facing === 'right') {
            this.facing = 'left'
        } else if (direction === 'right' && this.facing === 'left') {
            this.facing = 'right'
        }
    }

    idle() {
        console.log('Going idle ' + this.facing)
        if (this.facing === 'left') {
            animation.runImageAnimation(
                this.currentSprite,
                Pirate.idleLeftAnimation,
                200,
                true
            )
        } else {
            animation.runImageAnimation(
                this.currentSprite,
                Pirate.idleRightAnimation,
                200,
                true
            )
        }
    }
}
