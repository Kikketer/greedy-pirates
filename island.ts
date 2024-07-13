namespace Island {
    const treasureImage: Image = assets.image`Chest`
    const openTreasureAnimation: Image[] = assets.animation`Chest Open`
    const civilianOneRunRightAnimation: Image[] = assets.animation`Innocent Civilian 1`
    const civilianTwoRunRightAnimation: Image[] = assets.animation`Innocent Civilian 2`

    let player1: Pirate
    let player2: Pirate
    let currentEnemies: Array<Militia> = []
    let currentCivilians: Array<Sprite> = []
    let currentSegment: number = 0
    let isSegmentComplete: boolean = false
    let arrow: Sprite
    
    const player1StatLocation: number[] = [12, 10]
    const player2StatLocation: number[] = [130, 10]
    // This is the bounding box for enemy and player movement (aka the street)
    // [topleftX, topLeftY, bottomLeftX, bottomLeftY]
    let _boundingBox: number[] = [0, 55, 160, 120]
    let _island: Map.Island
    let _onUpdateTreasure: (T: OnUpdateTreasureProps) => void = () => undefined
    let _onLeaveIsland: () => void
    let _dirtSpeckles: Sprite[] = []
    let _treasureSprite: Sprite
    let _treasureOpened: boolean = false

    function onPirateAttack({ pirate, direction }: { pirate: Pirate, direction: 'left' | 'right' }) {
        const dirPix = direction === 'left' ? -1 : 1
        // The hit zone is the pirate "sword" box: [center, right|left] and [top, bottom]
        const hitXZone = [pirate.sprite.x, pirate.sprite.x + (13 * dirPix)]
        // The sword is only near the top of the sprite, we don't kill with feet
        const hitYZone = [pirate.sprite.y - 4, pirate.sprite.y + 2]

        // Check to see if we slashed the treasure!
        if (_treasureSprite && isSegmentComplete 
            && Math.abs(pirate.sprite.x - _treasureSprite.x) < 10
            && Math.abs(pirate.sprite.y - _treasureSprite.y) < 10) {
            openTreasure()
            return
        }
        
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

        checkIfSegmentIsComplete()
    }

    function checkIfSegmentIsComplete() {
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
                    // Recheck if complete just in case we walked before this appeared
                    if (isSegmentComplete && _island) {
                        arrow = sprites.create(assets.image`Arrow`)
                        arrow.x = 140
                        arrow.y = 80
                        arrow.z = 300
                    }
                }, 1500)
            } else {
                // We completed the last segment!
                showTreasure()
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
        drawBackground()
        placeEnemies()
    }

    function drawBackground() {
        scene.setBackgroundImage(assets.image`myImage`)
        // Clear any exisitng speckles
        _dirtSpeckles.forEach((speckle: Sprite) => {
            speckle.destroy()
        })

        Utils.getArrayOfLength(20).forEach(() => {
            const speckle = image.create(4, 4)
            speckle.drawLine(0, 0, 1, 1, 14)
            const sprite = sprites.create(speckle)
            sprite.x = Math.randomRange(10, 140)
            sprite.y = Math.randomRange(80, 110)

            _dirtSpeckles.push(sprite)
        })
    }

    function showTreasure() {
        _treasureOpened = false
        _treasureSprite = sprites.create(treasureImage)
        const randX = Math.randomRange(_boundingBox[0] + 20, _boundingBox[2] - 15)
        const randY = Math.randomRange(_boundingBox[1] + 50, _boundingBox[3] - 15)
        _treasureSprite.x = randX
        _treasureSprite.y = randY
        _treasureSprite.z = randY
    }

    function openTreasure() {
        // Prevent both players from opening this at once
        if (!_treasureOpened) {
            _treasureOpened = true
            animation.runImageAnimation(
                _treasureSprite,
                openTreasureAnimation,
                200,
                false
            )
            setTimeout(() => {
                // Add the islands riches to the boat!
                _onUpdateTreasure({ onBoat: _island.riches, pulledFromIsland: _island.id })
            }, openTreasureAnimation.length * 100)
            
            setTimeout(() => {
                // Exit the island after the animation!
                leaveIsland()
            }, openTreasureAnimation.length * 200 + 500)
        }
    }

    function placeEnemies() {
        // The number of enemies is based on the risk level of the island
        // number of players AND segment level
        // Start most enemies a bit from the left (avoiding starting ON the players)
        const averageAmount = Math.floor(_island.risk + (2 * currentSegment))
        const numberOfEnemies = Math.max(Math.randomRange(averageAmount - 2, averageAmount + 2), 1)
        console.log('Enemies ' + currentSegment + ':' + _island.risk)
        Utils.getArrayOfLength(numberOfEnemies).forEach(() => {
            const locX = Math.randomRange(_boundingBox[0] + 20, _boundingBox[2])
            const locY = Math.randomRange(_boundingBox[1], _boundingBox[3])
            const randomTarget = Math.randomRange(0, 1) === 0 ? player1 : player2
            
            currentEnemies.push(new Militia({ x: locX, y: locY, target: randomTarget }))
        })

        Utils.getArrayOfLength(Math.randomRange(1, 3)).forEach(() => {
            const locX = Math.randomRange(_boundingBox[0] + 20, _boundingBox[2])
            const locY = Math.randomRange(_boundingBox[1], _boundingBox[3])

            const civilianSprite = sprites.create(assets.image`empty`)
            civilianSprite.x = locX
            civilianSprite.y = locY
            civilianSprite.z = locY
            civilianSprite.setVelocity(30, 0)
            animation.runImageAnimation(
                civilianSprite,
                Math.pickRandom([civilianOneRunRightAnimation, civilianTwoRunRightAnimation]),
                100,
                true
            )
            currentCivilians.push(civilianSprite)
        })
    }

    function leaveIsland() {
        _island = undefined
        
        player1.destroy()
        player2.destroy()

        currentEnemies.map(enemy => enemy.destory())
        currentEnemies = []
        currentCivilians.map(civilian => civilian.destroy())
        currentCivilians = []

        if (_treasureSprite) {
            _treasureSprite.destroy()
        }
        scene.setBackgroundImage(assets.image`empty`)
        if (_dirtSpeckles.length) {
            _dirtSpeckles.forEach((speckle) => speckle.destroy())
        }

        music.stopAllSounds()

        // Remove all listeners and clear the screen
        controller.player1.B.removeEventListener(ControllerButtonEvent.Pressed, leaveIsland)

        _onLeaveIsland()
    }

    export function init({ island, onTreasureUpdate }: { island: Map.Island, onTreasureUpdate: (T: TreasureStat) => void }) {
        _island = island
        _onUpdateTreasure = onTreasureUpdate
        isSegmentComplete = false
        currentSegment = 0

        scene.setBackgroundColor(8)
        player1 = new Pirate({ control: controller.player1, playerNumber: 0, onAttack: onPirateAttack, topBoundary: _boundingBox[1], statLocation: player1StatLocation })
        player2 = new Pirate({ control: controller.player2, playerNumber: 1, onAttack: onPirateAttack, topBoundary: _boundingBox[1], statLocation: player2StatLocation })

        music.play(music.createSong(assets.song`Theme`), music.PlaybackMode.LoopingInBackground)

        drawBackground()
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
        if (isSegmentComplete && (player1.sprite.x > 150 || player2.sprite.x > 150) && currentSegment < (_island.segments - 1)) {
            panCameraToNextSegment()
        }
    }
}
