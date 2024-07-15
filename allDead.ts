namespace AllDead {
    let _onRevive: () => void

    export function init() {
        scene.setBackgroundImage(assets.image`empty`)
        scene.setBackgroundColor(0)

        game.showLongText('Yarrgh, ye be swimmin\' with thee fishes! Thar militia have raided ye ship!', DialogLayout.Center)
        console.log('Dismissed')
        _onRevive()
    }

    export function onRevive(callback: () => void) {
        _onRevive = callback
    }
}
