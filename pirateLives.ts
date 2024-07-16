namespace PirateLives {
    let _liveCountSprite: Sprite
    let _liveCountIcon: Sprite
    export let currentPirateCount: number = 10

    // If a pirate dies, call this with a negative number
    export function updatePirateCount(byHowMuch: number) {
        currentPirateCount += byHowMuch
        if (currentPirateCount < 0) {
            currentPirateCount = 0
        }
        show()
    }

    export function show() {
        hide()
        _liveCountIcon = sprites.create(assets.image`Pirate Lives`)
        _liveCountIcon.x = 5
        _liveCountIcon.y = 115
        _liveCountIcon.z = 120

        _liveCountSprite = textsprite.create(currentPirateCount + '', 0, 1)
        _liveCountSprite.x = 8 + 5 + (_liveCountSprite.width / 2)
        _liveCountSprite.y = 115
        _liveCountSprite.z = 120
    }

    export function hide() {
        if (_liveCountSprite) {
            _liveCountSprite.destroy()
        }
        if (_liveCountIcon) {
            _liveCountIcon.destroy()
        }
    }
}
