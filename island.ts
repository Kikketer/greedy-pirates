namespace Island {
    const treasureImage: Image = assets.image`Chest`
    const openTreasureAnimation: Image[] = assets.animation`Chest Open`
    const civilianOneRunRightAnimation: Image[] = assets.animation`Innocent Civilian 1`
    const civilianTwoRunRightAnimation: Image[] = assets.animation`Innocent Civilian 2`

    let player1: Pirate
    let player2: Pirate
    let currentEnemies: Array<Enemy> = []
    let currentCivilians: Array<Sprite> = []
    let currentSegment: number = 0
    let isSegmentComplete: boolean = false
    let arrow: Sprite
    
    const player1StatLocation: number[] = [12, 10]
    const player2StatLocation: number[] = [130, 10]
    // This is the bounding box for enemy and player movement (aka the street)
    // [topleftX, topLeftY, bottomLeftX, bottomLeftY]
    const _boundingBox: number[] = [0, 55, 160, 120]
    let _island: Map.Island
    let _onUpdateTreasure: (T: TreasureStats.OnUpdateTreasureProps) => void = () => undefined
    let _onLeaveIsland: () => void
    let _onAllDead: () => void
    // So we can't trigger "all dead" more than once (happens if multiple shots hit a dead guy)
    let _allDead: boolean = false
    let _dirtSpeckles: Sprite[] = []
    let _treasureSprite: Sprite
    let _treasureOpened: boolean = false

    function onPirateAttack({ pirate }: { pirate: Pirate }) {
        // Check to see if we slashed the treasure!
        if (_treasureSprite && isSegmentComplete 
            && Math.abs(pirate.sprite.x - _treasureSprite.x) < 10
            && Math.abs(pirate.sprite.y - _treasureSprite.y) < 10) {
            openTreasure()
            return
        }

        const hitEnemies = Utils.getHitEnemies({ pirate, enemies: currentEnemies })
        hitEnemies.forEach((enemy) => {
            if (enemy.health <= 0 && enemy.riches > 0) {
                enemy.lootTheBody()
            } else {
                enemy.hit({ attacker: pirate, damage: 1 })
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

    function retargetEnemies(pirate: EnemyTarget) {
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


        // Destroy all enemies!
        currentEnemies.forEach((enemy) => enemy.destroy())
        currentEnemies = []
        // And civilians, just in case
        currentCivilians.map(civilian => civilian.destroy())
        currentCivilians = []
        
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
                TreasureStats.currentTreasure = { 
                    onIsland: TreasureStats.currentTreasure.onIsland,
                    onBoat: TreasureStats.currentTreasure.onBoat + _island.riches + TreasureStats.currentTreasure.inPocket,
                    inPocket: 0
                }
                _island.riches = 0
                TreasureStats.show({})

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
        const averageAmount = Math.floor(_island.risk + (1 * currentSegment))
        const numberOfEnemies = Math.max(Math.randomRange(averageAmount - 2, averageAmount), 1)

        Utils.getArrayOfLength(numberOfEnemies).forEach(() => {
            const locX = Math.randomRange(_boundingBox[0] + 20, _boundingBox[2])
            const locY = Math.randomRange(_boundingBox[1], _boundingBox[3])
            const livingPirates = []
            if (player1.health > 0) livingPirates.push(player1)
            if (player2.health > 0) livingPirates.push(player2)
            const randomTarget = Math.pickRandom(livingPirates)
            
            currentEnemies.push(new Militia({ x: locX, y: locY, target: randomTarget, riches: 1 + currentSegment }))
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

        currentEnemies.map(enemy => enemy.destroy())
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
        if (!_allDead) {
            _allDead = true
            // You lose all your inPocket AND boat coin!
            TreasureStats.currentTreasure = {
                onIsland: TreasureStats.currentTreasure.onIsland,
                inPocket: 0,
                onBoat: 0
            }

            // Take a breather
            pause(2000)

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
        TreasureStats.show({ combination: ['pocket'], location: 'center' })
        PirateLives.show()
        
        player1 = new Pirate({ control: controller.player1, playerNumber: 0, onAttack: onPirateAttack, onDie: onPirateDeath, boundaries: _boundingBox, statLocation: player1StatLocation })
        player2 = new Pirate({ control: controller.player2, playerNumber: 1, onAttack: onPirateAttack, onDie: onPirateDeath, boundaries: _boundingBox, statLocation: player2StatLocation })

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
