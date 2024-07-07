namespace Island {
    let player1Sprite: Sprite
    let player2Sprite: Sprite
    
    let _onLeaveIsland: () => void

    function leaveIsland() {
        // Remove all listeners and clear the screen
        controller.player1.A.removeEventListener(ControllerButtonEvent.Pressed, p1Attack)
        controller.player1.B.removeEventListener(ControllerButtonEvent.Pressed, leaveIsland)

        player1Sprite.destroy()
        player2Sprite.destroy()

        _onLeaveIsland()
    }

    function attack(p: string) {
        console.log('attack as ' + p)
    }

    function p1Attack() {
        console.log('attack')
        attack('p1')
    }

    export function init(island: Map.Island) {
        // controller.player.left.addEventListener(ControllerButtonEvent.Pressed, goLeft)
        controller.player1.A.addEventListener(ControllerButtonEvent.Pressed, p1Attack)
        controller.player1.B.addEventListener(ControllerButtonEvent.Pressed, leaveIsland)

        player1Sprite = sprites.create(assets.image`pirate_a`)
        player2Sprite = sprites.create(assets.image`empty`)

        animation.runImageAnimation(player1Sprite, assets.animation`pirate_idle`, 500, true)
    }

    export function onLeaveIsland(callback: () => void) {
        _onLeaveIsland = callback
    }

    export function render() {
        player1Sprite.x += controller.player1.dx(50)
        player1Sprite.y += controller.player1.dy(50)
        player2Sprite.x += controller.player2.dx(50)
        player2Sprite.y += controller.player2.dy(50)
    }
}
