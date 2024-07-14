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
    let _onUpdateTreasure: (T: TreasureStats.OnUpdateTreasureProps) => void = () => undefined
    let _onLeaveIsland: () => void
    let _onAllDead: () => void
    // So we can't trigger "all dead" more than once (happens if multiple shots hit a dead guy)
    let _allDead: boolean = false
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
            // Do nothing on dead enemies
            if (enemy.health <= 0) return
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

        checkIfSegmentIsComplete()
    }

    function onPirateDeath({ pirate }: { pirate: Pirate}) {
        // If there's still a living pirate, re-target all enemies to the other pirate
        if (player1.health > 0) {
            retargetEnemies(player1)
        } else if (player2.health > 0) {
            retargetEnemies(player2)
        } else {
            // Everyone is dead!
            whenAllDead()
        }
    }

    function retargetEnemies(pirate: Pirate) {
        currentEnemies.forEach((enemy) => {
            enemy.setCurrentTarget(pirate)
        })
    }

    function checkIfSegmentIsComplete() {
        const aliveEnemies = currentEnemies.filter((enemy) => {
            return enemy.health > 0
        })
        
        if (aliveEnemies.length) {
            isSegmentComplete = false
        }

        // If there are no enemies left, signal to go to the next segment
        if (aliveEnemies.length <= 0 && !isSegmentComplete) {
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
        // TODO someday animate this transition...
        // Clean up any corpses
        if (player1.health <= 0) {
            player1.destroy()
        } else {
            player1.sprite.x = 10
        }

        if (player2.health <= 0) {
            player2.destroy()
        } else {
            player2.sprite.x = 10
        }

        currentEnemies.forEach(enemy => {
            if (enemy.health <= 0) {
                enemy.destory()
            }
        })
        
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
        scene.setBackgroundImage(assets.image`Background`)
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
                TreasureStats.updateTreasure({ onBoat: _island.riches, pulledFromIsland: _island.id })
                // Empty the island of it's treasure and set it's risk to 0 since it's ours now
                _island.riches = 0
                _island.risk = 0
                _island.ownedBy = 'players'
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
        const averageAmount = Math.floor(_island.risk + (1.5 * currentSegment))
        const numberOfEnemies = Math.max(Math.randomRange(averageAmount - 2, averageAmount + 2), 1)
        console.log('Enemies ' + currentSegment + ':' + _island.risk)
        Utils.getArrayOfLength(numberOfEnemies).forEach(() => {
            const locX = Math.randomRange(_boundingBox[0] + 20, _boundingBox[2])
            const locY = Math.randomRange(_boundingBox[1], _boundingBox[3])
            const livingPirates = []
            if (player1.health > 0) livingPirates.push(player1)
            if (player2.health > 0) livingPirates.push(player2)
            const randomTarget = Math.pickRandom(livingPirates)
            
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

    function destroy() {
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

        TreasureStats.hide()
    }

    function whenAllDead() {
        console.log('All dead! ' + _allDead)
        if (!_allDead) {
            _allDead = true
            // You lose all your inPocket AND boat coin!
            TreasureStats.updateTreasure({ inPocket: 0, onBoat: 0 })

            // Take a breather
            pause(2000)

            console.log("And show dead screen")

            destroy()
            _onAllDead()
        }
    }

    function leaveIsland() {
        destroy()
        _onLeaveIsland()
    }

    export function init({ island }: { island: Map.Island }) {
        _island = island
        _allDead = false
        isSegmentComplete = false
        currentSegment = 0

        scene.setBackgroundColor(8)
        TreasureStats.show(['pocket'])
        
        player1 = new Pirate({ control: controller.player1, playerNumber: 0, onAttack: onPirateAttack, onDie: onPirateDeath, topBoundary: _boundingBox[1], statLocation: player1StatLocation })
        player2 = new Pirate({ control: controller.player2, playerNumber: 1, onAttack: onPirateAttack, onDie: onPirateDeath, topBoundary: _boundingBox[1], statLocation: player2StatLocation })

        music.play(music.createSong(assets.song`Invading Them Landlubbers`), music.PlaybackMode.LoopingInBackground)

        drawBackground()
        // Baddies
        placeEnemies()

        player1.place(10, 90)
        player2.place(10, 100)
    }

    export function onLeaveIsland(callback: () => void) {
        _onLeaveIsland = callback
    }

    export function onAllDead(callback: () => void) {
        _onAllDead = callback
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
