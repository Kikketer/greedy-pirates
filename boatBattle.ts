namespace BoatBattle {
    let enemies: Sprite[]
    let player1: Pirate
    let player2: Pirate

    export function init() {
        scene.setBackgroundColor(6)
        scene.setBackgroundImage(assets.image`empty`)

        // Spawn the players
        // player1 = new Pirate({ control: controller.player1 })
    }

    export function destory() {}
}
