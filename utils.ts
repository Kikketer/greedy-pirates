namespace Utils {
    export function getArrayOfLength(length: number) {
        const result = []
        for (let i = 0; i < length; i++) {
            result.push('')
        }
        return result
    }

    // Used to re-use an animation but flip it horizontally (x)
    export function flipAnimation(frames: Image[]) {
        return frames.map((frame: Image) => {
            frame.flipX()
            return frame
        })
    }

    export function swapAnimationColors(anim: Image[], fromColor: number, toColor: number) {
        return anim.map(frame => frame.replace(fromColor, toColor))
    }
}
