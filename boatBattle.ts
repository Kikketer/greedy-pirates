namespace BoatBattle {
    let enemies: EnemyPirate[] = []
    let player1: Pirate
    let player2: Pirate
    let treasure: Sprite

    const player1StatLocation: number[] = [12, 10]
    const player2StatLocation: number[] = [130, 10]
    let _onWinCallback: () => void
    let _onLooseCallback: () => void

    let _isDone = false
    const _boundingBox: number[] = [0, 10, 160, 100]
    const _enemyBoatBox: number[] = [0, 10, 160, 60]
    const _ourBoatBox: number[] = [0, 90, 160, 100]

    export function init() {
        scene.setBackgroundColor(6)
        scene.setBackgroundImage(assets.image`Boat Battle`)

        // Spawn the players
        player1 = new Pirate({ control: controller.player1, playerNumber: 0, onAttack: onPirateAttack, onDie: onPirateDeath, boundaries: _boundingBox, statLocation: player1StatLocation })
        player2 = new Pirate({ control: controller.player2, playerNumber: 1, onAttack: onPirateAttack, onDie: onPirateDeath, boundaries: _boundingBox, statLocation: player2StatLocation })
        player1.sprite.x = Math.randomRange(_ourBoatBox[0], _ourBoatBox[2])
        player1.sprite.y = Math.randomRange(_ourBoatBox[1], _ourBoatBox[3])
        player2.sprite.x = Math.randomRange(_ourBoatBox[0], _ourBoatBox[2])
        player2.sprite.y = Math.randomRange(_ourBoatBox[1], _ourBoatBox[3])

        // Spawn the treasure!
        treasure = sprites.create(assets.image`Chest`)
        treasure.x = Math.randomRange(_ourBoatBox[0], _ourBoatBox[2])
        treasure.y = Math.randomRange(_ourBoatBox[1], _ourBoatBox[3])

        // Spawn the enemies!
        // Based on the amount of treasure you have, more enemies will appear!
        const boatTreasure = TreasureStats.currentTreasure.onBoat
        let numberOfEnemies = 1
        if (boatTreasure > 1000) {
            numberOfEnemies = 8
        } else {
            // A log curve to determine the number of enemies
            numberOfEnemies = 4 + Math.max(Math.floor(boatTreasure / 1000 * 4), 4);
        }

        Utils.getArrayOfLength(numberOfEnemies).forEach((index) => {
            const locX = Math.randomRange(_enemyBoatBox[0], _enemyBoatBox[2])
            const locY = Math.randomRange(_enemyBoatBox[1], _enemyBoatBox[3])
            // Had to do this to make it easy and running out of time!
            const treasurePretendingToBePirate = { hit: () => {}, health: 1, sprite: treasure }
            
            // At least 3 enemies go for the treasure
            let target = Math.pickRandom([player1, player2, treasurePretendingToBePirate])
            if (index <= 2) {
                target = treasurePretendingToBePirate
            }

            const enemyPirate = new EnemyPirate({ x: locX, y: locY, target })
            enemies.push(enemyPirate)
        })

        PirateLives.show()
    }
    
    export function render() {
        player1.render()
        player2.render()

        enemies.forEach(enemy => enemy.render())

        if (!_isDone) {
            checkIfOver()
        }
    }

    export function destroy() {
        player1.destroy()
        player2.destroy()
        enemies.forEach((e) => e.destroy())
        treasure.destroy()

        scene.setBackgroundImage(assets.image`empty`)
    }

    export function onWin(callback: () => void) {
        _onWinCallback = callback
    }

    export function onLoose(callback: () => void) {
        _onLooseCallback = callback
    }

    function onPirateAttack({ pirate }: { pirate: Pirate }) {
        const hitEnemies = Utils.getHitEnemies({ pirate, enemies })
        hitEnemies.forEach((enemy) => {
            // No looting of EnemyPirates
            if (enemy.health > 0) {
                enemy.hit(1)
            }
        })

        checkIfOver()
    }

    function onPirateDeath() {
        checkIfOver()
    }

    function checkIfOver() {
        const anyAlive = enemies.some((enemy) => enemy.health > 0)
        const anyGotTreasure = enemies.some((enemy) => Utils.getDistance(enemy.sprite, treasure) < 5)
        const allPlayersDead = player1.health <= 0 && player2.health <= 0
        // if any enemy pirates are on top of the treasure, BOOM LOOSE!
        if (anyGotTreasure) {
            _isDone = true
            pause(1500)

            game.showLongText('Thee pirates stole ye booty!', DialogLayout.Center)

            TreasureStats.currentTreasure = {
                onBoat: 0,
                onIsland: TreasureStats.currentTreasure.onIsland,
                inPocket: 0
            }

            destroy()
            _onLooseCallback()
        }

        if (allPlayersDead) {
            _isDone = true
            pause(1500)

            game.showLongText('Thar enemy has taken thee boat! Luckily they\'ve accepted you to join their crew!', DialogLayout.Center)

            TreasureStats.currentTreasure = {
                onBoat: TreasureStats.currentTreasure.onBoat + TreasureStats.currentTreasure.inPocket,
                onIsland: 0,
                inPocket: 0
            }
            PirateLives.updatePirateCount(-2)

            destroy()
            _onLooseCallback()
        }

        if (!anyAlive) {
            _isDone = true
            pause(1500)

            game.showLongText('Ye have warded off the enemy pirates! For now...', DialogLayout.Center)

            destroy()
            _onWinCallback()
        }
    }
}
