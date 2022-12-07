import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect } from 'react'
import { AppConfig } from 'util/AppConfig'
import { nonNullable } from 'util/Utils'


export const SPOTIFY_WEB_PLAYBACK_SDK_URL = 'https://sdk.scdn.co/spotify-player.js'

export const sdkReadyAtom = atom<boolean>(false)
sdkReadyAtom.onMount = (setAtom) => {
    const script = document.createElement('script')
    script.src = SPOTIFY_WEB_PLAYBACK_SDK_URL
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
        setAtom(true)
    }

    return () => {
        document.body.removeChild(script)
    }
}

export const useSetupSpotifySDK = () => {
    useAtom(sdkReadyAtom)
}

const accessTokenAtom = atom(async () => {
    const r = await fetch(AppConfig.httpAccessTokenEndpoint, { method: 'GET', credentials: 'include' })
    return await r.text()
})

export const useAccessToken = () => {
    return useAtomValue(accessTokenAtom)
}

const playerAtom = atom<Promise<Spotify.Player | null>>(async (get) => {
    const isSdkReady = get(sdkReadyAtom)
    const accessToken = get(accessTokenAtom)
    if (isSdkReady && accessToken) {
        const player = new Spotify.Player({
            name: 'Muse',
            getOAuthToken: (callback) => callback(accessToken),
        })
        const success = await player.connect()

        if (success) {
            return player
        } else {
            throw new Error('Failed to connect to Spotify player.')
        }
    }
    // return await new Promise((res, rej) => { signal.addEventListener('abort', () => rej('aborted'))})
    return null
})

export const useSpotifyPlayer = () => {
    return useAtomValue(playerAtom)
}

const deviceIdAtom = atom<Promise<string | null>>(async (get) => {
    const player = get(playerAtom)
    if (player) {
        return await new Promise((resolve, reject) => {
            player.addListener('ready', ({ device_id }) => {
                resolve(device_id)
            })

            player.addListener('not_ready', () => {
                reject('Spotify player not ready.')
            })
        })
    } else {
        return null
    }
})

export const useDeviceId = () => useAtomValue(deviceIdAtom)

const playbackStateAtom = atom<Spotify.PlaybackState | null>(null)
export const usePlaybackState = () => useAtomValue(playbackStateAtom)

// This can't be an atom because listener runs multiple times.
export const useSetupPlaybackState = () => {
    const player = useSpotifyPlayer()
    const setPlaybackState = useSetAtom(playbackStateAtom)

    useEffect(() => {
        if (player) {
            player.addListener('player_state_changed', (state) => setPlaybackState(state))
            return () => player.removeListener('player_state_changed')
        }
    }, [player])
}

// Sync playback state atom.
export const useSetupPlaybackStateAutoRefresh = ({ refreshInterval }: { refreshInterval: number }) => {
    const player = useAtomValue(playerAtom)
    const [playbackState, setPlaybackState] = useAtom(playbackStateAtom)

    const isValidState = nonNullable(playbackState)
    const isPlaying = !playbackState?.paused

    useEffect(() => {
        if (player && isValidState && isPlaying) {
            const intervalId = window.setInterval(async () => {
                const newState = await player.getCurrentState()
                setPlaybackState(newState)
            }, refreshInterval)

            return () => window.clearInterval(intervalId)
        }
    }, [
        player,
        isValidState,
        isPlaying,
        refreshInterval,
    ])
}

interface PlayerActions {
    trackId: string
    positionMs: number
    durationMs: number
    isShuffled: boolean

    isPlaying: boolean
    togglePlayDisabled: boolean
    togglePlay: () => Promise<void>
    pause: () => Promise<void>
    play: () => Promise<void>

    seekDisabled: boolean
    seekForward: () => Promise<void>
    seekBackward: () => Promise<void>
    seekTo: (positionMs: number) => Promise<void>

    nextTrackDisabled: boolean
    nextTrack: () => Promise<void>
    prevTrackDisabled: boolean
    previousTrack: () => Promise<void>
}

export const usePlayerActions = (seekInterval: number): PlayerActions => {
    const player = useSpotifyPlayer()
    const current = usePlaybackState()

    if (current && player) {
        const disallows = current.disallows
        const positionMs = current.position
        return {
            // TODO: is track id safe? 
            trackId: current.track_window.current_track.id!,
            positionMs,
            durationMs: current.duration,
            isShuffled: current.shuffle,

            isPlaying: !current.paused,
            togglePlayDisabled: (current.paused ? disallows.resuming : disallows.pausing) ?? false,
            togglePlay: () => current.paused ? player.resume() : player.pause(),
            pause: () => player.pause(),
            play: () => player.resume(),

            seekDisabled: disallows.seeking ?? false,
            seekForward: () => player.seek(positionMs + seekInterval),
            seekBackward: () => player.seek(positionMs - seekInterval),
            seekTo: (positionMs: number) => player.seek(positionMs),
            nextTrackDisabled: disallows.skipping_next ?? false,
            nextTrack: () => player.nextTrack(),
            prevTrackDisabled: disallows.skipping_prev ?? false,
            previousTrack: () => player.previousTrack(),
        }
    } else {
        return {
            trackId: '',
            positionMs: 0,
            durationMs: 60 * 1000,
            isShuffled: false,

            isPlaying: false,
            togglePlayDisabled: true,
            pause: async () => { },
            play: async () => { },
            togglePlay: async () => { },

            seekDisabled: true,
            seekForward: async () => { },
            seekBackward: async () => { },
            seekTo: async () => { },

            nextTrackDisabled: true,
            nextTrack: async () => { },
            prevTrackDisabled: true,
            previousTrack: async () => { },
        }
    }
}

// const volumeWithUpdateAtom = atom((get) => {
//     return get(initialVolumeAtom) 
// }, async (get, set, newVolume: number) => {
//     const player = get(playerAtom)
//     if (player) {
//         await player.setVolume(newVolume)
//         set(initialVolumeAtom, newVolume)
//     }
// })

const volumeAtom = atomWithStorage('MusePlayerVolume', 0.5)
export function useVolume(): [number, (volume: number) => Promise<void>] {
    const player = useSpotifyPlayer()
    const [volume, setVolume] = useAtom(volumeAtom)

    useEffect(() => {
        if (player) {
            player.setVolume(volume)
        }
    }, [player])


    async function setVolumeWithUpdate(newVolume: number): Promise<void> {
        if (newVolume < 0 || newVolume > 1) return

        if (player) {
            await player.setVolume(newVolume)
            const playerVolume = await player.getVolume()
            setVolume(playerVolume)
        }
    }

    return [volume, setVolumeWithUpdate]
} 
