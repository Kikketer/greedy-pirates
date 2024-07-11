class Militia {
    static walkRightAnimation: Image[] = Utils.swapAnimationColors(assets.animation`Pirate Walk`, 14, 6)
    static walkLeftAnimation: Image[] = Utils.flipAnimation(Utils.swapAnimationColors(assets.animation`Pirate Walk`, 14, 6))

    sprite: Sprite
    currentTarget: Pirate
    public isParrying: boolean = false
    public health: number = 1

    constructor({ x, y }: { x: number, y: number }) {
        this.sprite = sprites.create(assets.image`Pirate`)
        this.place(x, y)

        animation.runImageAnimation(
            this.sprite,
            Militia.walkRightAnimation,
            300,
            true
        )
    }

    public place(x: number, y: number) {
        this.sprite.x = x
        this.sprite.y = y
    }

    public hit(damage: number) {
        if (this.isParrying) return
        this.health -= damage
        
        if (this.health <= 0) {
            console.log('You killed me')
            this.destory()
        }
    }

    public destory() {
        this.sprite.destroy()
    }

    public render() {}
}
