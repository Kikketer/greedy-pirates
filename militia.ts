class Militia {
    sprite: Sprite
    currentTarget: Pirate
    public isParrying: boolean = false
    public health: number = 1

    constructor({ x, y }: { x: number, y: number }) {
        this.sprite = sprites.create(assets.image`Enemy`)
        this.place(x, y)
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
