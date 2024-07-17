namespace TreasureIsland {
    let _onComplete: () => void

    export function init() {
        // Do special if we select our own island
        TreasureStats.currentTreasure = {
            onBoat: 0,
            onIsland: TreasureStats.getTotal(),
            inPocket: 0
        }
        TreasureStats.show({})

        destroy()
        _onComplete()
    }

    export function onComplete(callback: () => void) {
        _onComplete = callback
    }

    function destroy() {}
}
