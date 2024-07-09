namespace Island {
    // let player1Sprite: Sprite
    // let player2Sprite: Sprite

    let player1: Pirate
    let player2: Pirate
    
    let _onLeaveIsland: () => void

    function leaveIsland() {
        player1.destroy()
        player2.destroy()
        // Remove all listeners and clear the screen
        // controller.player1.A.removeEventListener(ControllerButtonEvent.Pressed, p1Attack)
        controller.player1.B.removeEventListener(ControllerButtonEvent.Pressed, leaveIsland)

        // player1Sprite.destroy()
        // player2Sprite.destroy()

        _onLeaveIsland()
    }

    // function attack(player: Player) {
    //     console.log('Player facing ' + player.facing)
    //     const flippedAnimation: Image[] = player.facing === 'left' ? assets.animation`Pirate Swing w Sword`.map((frame: Image) => {
    //         frame.flipX()
    //         return frame
    //     }) : assets.animation`Pirate Swing w Sword`

    //     animation.runImageAnimation(player.sprite, flippedAnimation, 50, false)
    //     pause(assets.animation`Pirate Swing w Sword`.length * 50)
    //     // animation.runImageAnimation(player.sprite, assets.animation`Pirate Stand`, 200, true)
    // }

    // function parry(playerSprite: Sprite) {}

    // function p1Attack() {
    //     attack(player1)
    // }

    // function p2Attack() {
    //     attack(player2)
    // }

    export function init(island: Map.Island) {
        player1 = new Pirate({ controller: controller.player1 })
        player2 = new Pirate({ controller: controller.player2 })

        Pirate.registerEvents(player1)

        player1.place(10, 90)

        // controller.player.left.addEventListener(ControllerButtonEvent.Pressed, goLeft)
        // controller.player1.A.addEventListener(ControllerButtonEvent.Pressed, p1Attack)
        controller.player1.B.addEventListener(ControllerButtonEvent.Pressed, leaveIsland)

        // player1Sprite = sprites.create(assets.image`Pirate`)
        // player2Sprite = sprites.create(assets.image`empty`)

        // player1 = {
        //     sprite: player1Sprite,
        //     facing: 'right',
        //     health: 100
        // }

        // // animation.runImageAnimation(player1Sprite, assets.animation``, 500, true)

        // controller.player1.left.addEventListener(ControllerButtonEvent.Pressed, () => {
        //     if (player1.facing === 'right') {
        //         player1.sprite.image.flipX()
        //     }
        //     player1.facing = 'left'
        // })

        // controller.player1.right.addEventListener(ControllerButtonEvent.Pressed, () => {
        //     if (player1.facing === 'left') {
        //         player1.sprite.image.flipX()
        //     }
        //     player1.facing = 'right'
        // })
    }

    export function onLeaveIsland(callback: () => void) {
        _onLeaveIsland = callback
    }

    export function render() {
        player1.render()
        player2.render()
        // player1Sprite.x += controller.player1.dx(50)
        // player1Sprite.y += controller.player1.dy(50)
        // player2Sprite.x += controller.player2.dx(50)
        // player2Sprite.y += controller.player2.dy(50)
    }
}
