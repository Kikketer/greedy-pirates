namespace Island {
    let player1: Pirate
    let player2: Pirate
    let currentEnemies: Array<Militia> = []
    let currentSegment: number = 0
    let isSegmentComplete: boolean = false
    let arrow: Sprite
    
    // This is the bounding box for enemy and player movement (aka the street)
    // [topleftX, topLeftY, bottomLeftX, bottomLeftY]
    let _boundingBox: number[] = [0, 60, 160, 120]
    let _island: Map.Island
    let _onLeaveIsland: () => void

    function onPirateAttack({ pirate, direction }: { pirate: Pirate, direction: 'left' | 'right' }) {
        const dirPix = direction === 'left' ? -1 : 1
        // The hit zone is the pirate "sword" box: [center, right|left] and [top, bottom]
        const hitXZone = [pirate.sprite.x, pirate.sprite.x + (13 * dirPix)]
        // The sword is only near the top of the sprite, we don't kill with feet
        const hitYZone = [pirate.sprite.y - 4, pirate.sprite.y + 2]
        
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

        if (currentEnemies.length) {
            isSegmentComplete = false
        }

        // If there are no enemies left, signal to go to the next segment
        if (currentEnemies.length <= 0 && !isSegmentComplete) {
            isSegmentComplete = true

            // Show the "go" arrow if we have a place to go
            if (currentSegment < (_island.segments - 1)) {
                // Tiny delay to show the arrow, cuz... TMNT
                setTimeout(() => {
                    arrow = sprites.create(assets.image`Arrow`)
                    arrow.x = 140
                    arrow.y = 80
                }, 1500)
            }
        }
    }

    function panCameraToNextSegment() {
        console.log("Go to next segment! " + screen.width + ':' + screen.height)
        // This is a little rough but for now it works
        // Place the pirates on the far left side
        player1.sprite.x = 10
        player2.sprite.x = 10
        isSegmentComplete = false
        
        if (arrow) {
            arrow.destroy()
        }
        currentSegment++

        // Move the background image 160px left
        placeEnemies()
    }

    function placeEnemies() {
        // The number of enemies is based on the risk level of the island
        // Start most enemies a bit from the left (avoiding starting ON the players)
        const locX = Math.randomRange(_boundingBox[0] + 20, _boundingBox[2])
        const locY = Math.randomRange(_boundingBox[1], _boundingBox[3])
        const randomTarget = Math.randomRange(0,1) === 0 ? player1 : player2

        currentEnemies.push(new Militia({ x: locX, y: locY, target: randomTarget }))
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
        _island = island
        scene.setBackgroundColor(8)
        player1 = new Pirate({ control: controller.player1, playerNumber: 0, onAttack: onPirateAttack })
        player2 = new Pirate({ control: controller.player2, playerNumber: 1, onAttack: onPirateAttack })

        // Baddies
        placeEnemies()

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

        // Check to see if we've completed the segment, there's another segment to go to
        // and that at least one pirate is on the far right side:
        if (isSegmentComplete && (player1.sprite.x > 150 || player2.sprite.x > 150) && currentSegment < _island.segments) {
            panCameraToNextSegment()
        }
    }
}
