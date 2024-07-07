namespace Utils {
    export function getArrayOfLength(length: number) {
        const result = []
        for (let i = 0; i < length; i++) {
            result.push('')
        }
        return result
    }
}
