// Unique id for a sheet row. The "e" prefix keeps it text, so sheets never returns it formatted as a number
export function createId() {
    return `e${Date.now()}`
}
