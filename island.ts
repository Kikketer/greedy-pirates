namespace Island {
    let player1: Pirate
    let player2: Pirate
    let currentEnemies: Array<Sprite>
    
    let _onLeaveIsland: () => void

    function onAttack({ pirate, direction }: { pirate: Pirate, direction: 'left' | 'right' }) {
        console.log('Attacking! ' + pirate.controller.playerIndex + ':' + direction)
    }

    function leaveIsland() {
        player1.destroy()
        player2.destroy()

        // Remove all listeners and clear the screen
        controller.player1.B.removeEventListener(ControllerButtonEvent.Pressed, leaveIsland)

        _onLeaveIsland()
    }

    export function init(island: Map.Island) {
        player1 = new Pirate({ control: controller.player1, playerNumber: 0, onAttack })
        player2 = new Pirate({ control: controller.player2, playerNumber: 1, onAttack })

        // Baddies
        const enemy = sprites.create(assets.image`Enemy`, SpriteKind.Enemy)
        enemy.x = 90
        enemy.y = 70

        // sprites.onOverlap(SpriteKind.PlayerAttackRight, SpriteKind.Enemy, (pirate, enemy) => {
        //     console.log('overlap of stuff! ' + enemy.x + ':' + pirate.x)
        // })

        player1.place(10, 90)
        player2.place(10, 100)

        controller.player1.B.addEventListener(ControllerButtonEvent.Pressed, leaveIsland)
    }

    export function onLeaveIsland(callback: () => void) {
        _onLeaveIsland = callback
    }

    export function render() {
        player1.render()
        player2.render()
    }
}
