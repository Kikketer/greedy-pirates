class Pirate {
    static idleRightSprite: Image = assets.image`Pirate`
    static idleLeftSprite: Image = assets.image`Pirate`
    static attackLeftAnimation: Image[] = assets.animation`Pirate Swing w Sword`.map((frame: Image) => {
        frame.flipX()
        return frame
    })
    static attackRightAnimation: Image[] = assets.animation`Pirate Swing w Sword`
    static parryLeftSprite: Image = assets.image`Pirate`
    static parryRightSprite: Image = assets.image`Pirate`
    static walkRightSprite: Image = assets.image`Pirate`
    static walkLeftSprite: Image = assets.image`Pirate`

    static registerEvents = function(pirate: Pirate) {
        
    }

    currentSprite: Sprite
    facing: 'left' | 'right'
    _controller: controller.Controller

    public health: number

    constructor({ controller }: { controller: controller.Controller }) {
        // Setup event listeners
        this.health = 100
        this.facing = 'right'
        this._controller = controller

        this.currentSprite = sprites.create(Pirate.idleRightSprite)
        animation.runImageAnimation(this.currentSprite, assets.animation`Pirate Stand`, 300, true)

        // Setup the controller handlers
        // this._controller.A.addEventListener(ControllerButtonEvent.Pressed, Pirate.player1Attack)
    }

    public place(x: number, y: number) {
        // Starting location or teleport
        this.currentSprite.x = x
        this.currentSprite.y = y
    }

    public destroy() {
        // Remove all event listeners
        // this._controller.A.removeEventListener(ControllerButtonEvent.Pressed, Pirate.punch)
    }

    public render() { }

    public attack(me: Pirate) {
        console.log('Attack!')
        const attackAnimationSpeed = 50
        const anim = me.facing === 'right' ?
            Pirate.attackRightAnimation :
            Pirate.attackLeftAnimation

        animation.runImageAnimation(
            me.currentSprite,
            anim,
            attackAnimationSpeed,
            false
        )
        pause(anim.length * attackAnimationSpeed)
    }
}
