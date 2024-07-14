namespace Utils {
    export function getArrayOfLength(length: number): number[] {
        const result = []
        for (let i = 0; i < length; i++) {
            result.push(i)
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

    export function getDistance(pointA: { x: number, y: number }, pointB: { x: number, y: number }) {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    export function swapAnimationColors(anim: Image[], fromColor: number, toColor: number) {
        anim.map(frame => frame.replace(fromColor, toColor))
        return anim
    }
}
