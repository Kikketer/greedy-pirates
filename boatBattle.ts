namespace BoatBattle {
    let enemies: Militia[] = []
    let player1: Pirate
    let player2: Pirate

    const player1StatLocation: number[] = [12, 10]
    const player2StatLocation: number[] = [130, 10]
    let _onWinCallback: () => void
    let _onAllDeadCallback: () => void

    const _boundingBox: number[] = [0, 10, 160, 120]

    export function init() {
        scene.setBackgroundColor(6)
        scene.setBackgroundImage(assets.image`empty`)

        // Spawn the players
        player1 = new Pirate({ control: controller.player1, playerNumber: 0, onAttack: onPirateAttack, onDie: onPirateDeath, topBoundary: _boundingBox[1], statLocation: player1StatLocation })
        // player2 = new Pirate({ control: controller.player2, playerNumber: 1, onAttack: onPirateAttack, onDie: onPirateDeath, topBoundary: _boundingBox[1], statLocation: player2StatLocation })

        // Spawn the enemies!
        // Based on the amount of treasure you have, more enemies will appear!
        const totalTreasure = TreasureStats.getTotal()
        let numberOfEnemies = 1
        if (totalTreasure > 1000) {
            numberOfEnemies = 8
        } else {
            // A log curve to determine the number of enemies
            numberOfEnemies = 1 + Math.log(TreasureStats.getTotal() + 1) / Math.log(1000) * 6;
        }

        Utils.getArrayOfLength(numberOfEnemies).forEach(() => {
            const militia = new Militia({ x: 50, y: 50, target: Math.pickRandom([player1, player2]) })
            enemies.push(militia)
        })
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
            if (enemy.health <= 0 && enemy.riches > 0) {
                enemy.lootTheBody()
            } else {
                enemy.hit(1)
            }
        })
    }

    function onPirateDeath() {}
}
