class Pirate {
    static idleRightSprite: Image = assets.image`Pirate`
    static idleLeftSprite: Image = assets.image`Pirate`
    static attackRightSprite: Image = assets.image`Pirate`
    static attackLeftSprite: Image = assets.image`Pirate`
    static parryRightSprite: Image = assets.image`Pirate`
    static parryLeftSprite: Image = assets.image`Pirate`
    static walkRightSprite: Image = assets.image`Pirate`
    static walkLeftSprite: Image = assets.image`Pirate`

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
    }

    public place(x: number, y: number) {
        // Starting location or teleport
        this.currentSprite.x = x
        this.currentSprite.y = y
    }

    public destroy() {
        // Remove all event listeners
    }

    public attack() { }

    public render() { }
}
