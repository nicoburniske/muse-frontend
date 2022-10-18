export function msToTime(duration: number) {
    const
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        seconds = Math.floor((duration / 1000) % 60),
        ms = Math.floor((duration % 1000) / 100)

    return { hours, minutes, seconds, ms }
}