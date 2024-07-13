namespace Island {
    let player1: Pirate
    let player2: Pirate
    let currentEnemies: Array<Militia> = []
    
    let _onLeaveIsland: () => void

    function onPirateAttack({ pirate, direction }: { pirate: Pirate, direction: 'left' | 'right' }) {
        const dirPix = direction === 'left' ? -1 : 1
        // The hit zone is the pirate "sword" box: [center, right|left] and [top, bottom]
        const hitXZone = [pirate.currentSprite.x, pirate.currentSprite.x + (13 * dirPix)]
        // The sword is only near the top of the sprite, we don't kill with feet
        const hitYZone = [pirate.currentSprite.y - 4, pirate.currentSprite.y + 2]
        
        // manually check each enemy to see if they overlap, also check for parry
        currentEnemies.forEach((enemy) => {
            if (direction === 'right' 
                && enemy.sprite.x >= hitXZone[0] && enemy.sprite.x <= hitXZone[1]
                // Bottom of pirate is overlapping the top of the enemy (and opposite)
                && hitYZone[1] >= enemy.sprite.y - (enemy.sprite.height / 2) && hitYZone[0] <= enemy.sprite.y + (enemy.sprite.height / 2)) {
                    enemy.hit(1)
            } else if (direction === 'left' 
                && enemy.sprite.x <= hitXZone[0] && enemy.sprite.x >= hitXZone[1]
                // Same vertical check as the right side
                && hitYZone[1] >= enemy.sprite.y - (enemy.sprite.height / 2) && hitYZone[0] <= enemy.sprite.y + (enemy.sprite.height / 2)) {
                enemy.hit(1)
            }
        })
        // clean any enemies off the array if they are dead
        currentEnemies = currentEnemies.reduce((acc, enemy) => {
            if (enemy.health > 0) {
                acc.push(enemy)
            }
            return acc
        }, [])
    }

    function leaveIsland() {
        player1.destroy()
        player2.destroy()

        currentEnemies.map(enemy => enemy.destory())
        currentEnemies = []

        // Remove all listeners and clear the screen
        controller.player1.B.removeEventListener(ControllerButtonEvent.Pressed, leaveIsland)

        _onLeaveIsland()
    }

    export function init(island: Map.Island) {
        scene.setBackgroundColor(8)
        player1 = new Pirate({ control: controller.player1, playerNumber: 0, onAttack: onPirateAttack })
        player2 = new Pirate({ control: controller.player2, playerNumber: 1, onAttack: onPirateAttack })

        // Baddies
        currentEnemies.push(new Militia({ x: 50, y: 50, target: player1 }))

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

        currentEnemies.forEach(enemy => enemy.render())
    }
}
