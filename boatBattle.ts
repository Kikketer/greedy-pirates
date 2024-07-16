namespace BoatBattle {
    let enemies: EnemyPirate[] = []
    let player1: Pirate
    let player2: Pirate

    const player1StatLocation: number[] = [12, 10]
    const player2StatLocation: number[] = [130, 10]
    let _onWinCallback: () => void
    let _onAllDeadCallback: () => void

    const _timeAllowed = 10
    let _currentTime = _timeAllowed
    let _lastTick = 0
    let _isDone = false
    const _boundingBox: number[] = [0, 10, 160, 120]
    const _enemyBoatBox: number[] = [0, 10, 160, 60]

    export function init() {
        scene.setBackgroundColor(6)
        scene.setBackgroundImage(assets.image`empty`)

        _currentTime = _timeAllowed
        _lastTick = control.millis()

        // Spawn the players
        player1 = new Pirate({ control: controller.player1, playerNumber: 0, onAttack: onPirateAttack, onDie: onPirateDeath, topBoundary: _boundingBox[1], statLocation: player1StatLocation })
        player2 = new Pirate({ control: controller.player2, playerNumber: 1, onAttack: onPirateAttack, onDie: onPirateDeath, topBoundary: _boundingBox[1], statLocation: player2StatLocation })

        // Spawn the enemies!
        // Based on the amount of treasure you have, more enemies will appear!
        const totalTreasure = TreasureStats.getTotal()
        let numberOfEnemies = 1
        if (totalTreasure > 1000) {
            numberOfEnemies = 10
        } else {
            // A log curve to determine the number of enemies
            numberOfEnemies = 4 + Math.log(TreasureStats.getTotal() + 1) / Math.log(1000) * 8;
        }

        Utils.getArrayOfLength(numberOfEnemies).forEach(() => {
            const locX = Math.randomRange(_enemyBoatBox[0], _enemyBoatBox[2])
            const locY = Math.randomRange(_enemyBoatBox[1], _enemyBoatBox[3])
            const enemyPirate = new EnemyPirate({ x: locX, y: locY, target: Math.pickRandom([player1, player2]) })
            enemies.push(enemyPirate)
        })
    }
    
    export function render() {
        player1.render()
        player2.render()

        enemies.forEach(enemy => enemy.render())

        // Show timer (I know there's an extension but I want to try and roll my own)
        if (control.millis() - _lastTick > 1000 && !_isDone) {
            _lastTick = control.millis()
            _currentTime -= 1
            console.log('Time! ' + _currentTime)
        }

        if (_currentTime <= 0 && !_isDone && enemies.some((enemy) => enemy.health > 0)) {
            _isDone = true
            console.log('Game over!')
            pause(1000)

            destory()
            _onAllDeadCallback()
        }
    }

    export function destory() {
        player1.destroy()
        player2.destroy()
        enemies.forEach((e) => e.destroy())

        scene.setBackgroundImage(assets.image`empty`)
    }

    export function onWin(callback: () => void) {
        _onWinCallback = callback
    }

    export function onAllDead(callback: () => void) {
        _onAllDeadCallback = callback
    }

    function onPirateAttack({ pirate }: { pirate: Pirate }) {
        const hitEnemies = Utils.getHitEnemies({ pirate, enemies })
        hitEnemies.forEach((enemy) => {
            // No looting of EnemyPirates
            if (enemy.health > 0) {
                enemy.hit(1)
            }
        })

        checkIfWin()
    }

    function onPirateDeath() {}

    function checkIfWin() {
        const anyAlive = enemies.some((enemy) => enemy.health > 0)
        if (!anyAlive) {
            _isDone = true
            console.log("you dit it!")
            pause(1000)

            destory()
            _onWinCallback()
        }
    }
}
