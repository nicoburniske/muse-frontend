import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import { useEffect } from 'react'
import { nonNullable } from 'util/Utils'

export const SPOTIFY_API_URL = 'https://api.spotify.com/v1'
export const SPOTIFY_WEB_PLAYBACK_SDK_URL = 'https://sdk.scdn.co/spotify-player.js'

// This needs to be imported at top level to setup spotify sdk.
export function SpotifyPlaybackSdk() {
    useAtom(sdkReadyAtom)
    useAtom(loadable(playerAtom))
    useAtom(loadable(asyncPlaybackStateAtom))
    return null
}

export const sdkReadyAtom = atom<boolean>(false)
sdkReadyAtom.debugLabel = 'sdkReadyAtom'
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

const maybeAccessTokenAtom = atom<string | null>(null)
const accessTokenAtom = atom<string>((get) => {
    const accessToken = get(maybeAccessTokenAtom)
    if (accessToken) {
        return accessToken
    } else {
        throw new Error('Access token not set.')
    }
})
maybeAccessTokenAtom.debugLabel = 'accessTokenAtom'
export const useSetAccessToken = () => useSetAtom(maybeAccessTokenAtom)

/**
 * Spotify Player.
 **/
const playerAtom = atom<Promise<Spotify.Player>>(async (get) => {
    const isSdkReady = get(sdkReadyAtom)
    const accessToken = get(maybeAccessTokenAtom)
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
    return await new Promise(() => { })
})
playerAtom.debugLabel = 'playerAtom'
export const useSpotifyPlayer = () => useAtomValue(playerAtom)

/**
 * Device ID.
 */

const deviceIdAtom = atom<Promise<string>>(async (get) => {
    const player = get(playerAtom)
    return await new Promise((resolve, reject) => {
        player.addListener('ready', ({ device_id }) => {
            resolve(device_id)
        })

        player.addListener('not_ready', () => {
            reject('Spotify player not ready.')
        })
    })
})
deviceIdAtom.debugLabel = 'deviceIdAtom'
export const useDeviceId = () => useAtomValue(deviceIdAtom)

/**
 * Playback State.
 */

const syncPlaybackStateAtom = atom<Spotify.PlaybackState | null>(null)
syncPlaybackStateAtom.debugLabel = 'syncPlaybackStateAtom'
export const usePlaybackStateSync = () => useAtomValue(syncPlaybackStateAtom)

const asyncPlaybackStateAtom = atom<Promise<Spotify.PlaybackState>>(async (get) => {
    const state = get(syncPlaybackStateAtom)
    if (state) {
        return state
    } else {
        return await new Promise(() => { })
    }
})
asyncPlaybackStateAtom.debugLabel = 'asyncPlaybackStateAtom'
export const usePlaybackState = () => useAtomValue(asyncPlaybackStateAtom)

// Current track will be null when transfered to another device.
const currentTrackAtom = atom<Spotify.Track | null>((get) => get(asyncPlaybackStateAtom).track_window.current_track)
currentTrackAtom.debugLabel = 'currentTrackAtom'
export const useMaybeCurrentTrack = () => useAtomValue(syncPlaybackStateAtom)?.track_window.current_track ?? null
export const useCurrentTrack = () => {
    const current = useAtomValue(currentTrackAtom)
    if (current) {
        return current
    } else {
        throw new Error('No current track.')
    }
}

// This can't be an atom because listener runs multiple times.
export const useSyncPlaybackState = () => {
    const player = useSpotifyPlayer()
    const setPlaybackState = useSetAtom(syncPlaybackStateAtom)

    useEffect(() => {
        player.addListener('player_state_changed', (state) => {
            setPlaybackState(state)
        })
        return () => player.removeListener('player_state_changed')
    }, [player])
}

/**
 * Sync playback state atom to auto-refresh every interval
 * @param refreshInterval in milliseconds. 
 */
export const useSyncPlaybackStateInterval = ({ refreshInterval }: { refreshInterval: number }) => {
    const player = useSpotifyPlayer()
    const [playbackState, setPlaybackState] = useAtom(syncPlaybackStateAtom)

    const isValidState = nonNullable(playbackState)
    const isPlaying = !playbackState?.paused

    useEffect(() => {
        if (isValidState && isPlaying) {
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

/**
 * Playback Actions
 */

interface PlayerActions {
    positionMs: number
    durationMs: number

    /**
     * 0: NO_REPEAT
     * 1: ONCE_REPEAT
     * 2: FULL_REPEAT
     */
    repeatMode: 0 & 1 & 2
    repeatModeDisabled: boolean
    setRepeatMode: (state: RepeatState, options?: DeviceIdOptions) => Promise<void>

    isShuffled: boolean
    toggleShuffleDisabled: boolean
    setShuffle: (state: boolean, options?: DeviceIdOptions) => Promise<void>

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

export const seekIntervalAtom = atom(10000)
export const playerActionsAtom = atom<PlayerActions>((get) => {
    const player = get(playerAtom)
    const current = get(asyncPlaybackStateAtom)
    const seekInterval = get(seekIntervalAtom)
    const client = get(spotifyClientAtom)

    const disallows = current.disallows
    const positionMs = current.position
    return {
        positionMs,
        durationMs: current.duration,

        isShuffled: current.shuffle,
        toggleShuffleDisabled: disallows.toggling_shuffle ?? false,
        setShuffle: client.setShuffle,

        repeatMode: current.repeat_mode as 0 & 1 & 2,
        repeatModeDisabled: disallows.toggling_repeat_context ?? false,
        setRepeatMode: client.setRepeat,

        isPlaying: !current.paused,
        togglePlayDisabled: (current.paused ? disallows.resuming : disallows.pausing) ?? false,
        togglePlay: () => player.togglePlay(),
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
})
export const usePlayerActions = () => useAtomValue(playerActionsAtom)

/**
 * Volume.
 */

const volumeAtom = atomWithStorage('MusePlayerVolume', 0.5)
const isMutedAtom = atom(false, (get, set, muted: boolean | undefined) => {
    const update = muted ?? !get(isMutedAtom)
    set(isMutedAtom, update)
})
const setVolumeAtom = atom(null, (_get, set, volume: number) => {
    if (volume >= 0 || volume <= 1) {
        set(isMutedAtom, false)
        set(volumeAtom, volume)
    }
})
const volumeWithMute = atom((get) => {
    const volume = get(volumeAtom)
    const muted = get(isMutedAtom)
    return muted ? 0 : volume
})
export function useVolume(): [number, (volume: number) => void, (update: boolean | undefined) => void] {
    const player = useSpotifyPlayer()
    const volume = useAtomValue(volumeWithMute)
    const toggleMute = useSetAtom(isMutedAtom)
    const setVolume = useSetAtom(setVolumeAtom)

    useEffect(() => {
        player.setVolume(volume)
    }, [player, volume])

    return [volume, setVolume, toggleMute]
}

/**
 * Spotify Client.
 */

const spotifyClientAtom = atom((get) => spotifyClient(get(accessTokenAtom)))

type RepeatState = 'track' | 'context' | 'off'
type DeviceIdOptions = {
    device_id?: string
}

const spotifyClient = (accessToken: string) => {
    async function spotifyRequest<T>(endpoint: string, method: string, body?: any, params?: any): Promise<T> {
        const paramString = params ? `?${new URLSearchParams(params)}` : ''
        const url = `${SPOTIFY_API_URL}${endpoint}${paramString}`
        const response = await fetch(url, {
            method, body, headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
        return response.body as T
    }

    /**
     * Set the Repeat Mode for the User's Playback
     *
     * Set the repeat mode for the user's playback.
     *
     * @param state The desired repeat mode.
     * @param options Optional request information.
     */
    const setRepeat = (state: RepeatState, options?: DeviceIdOptions): Promise<void> =>
        spotifyRequest<void>('/me/player/repeat', 'PUT', undefined, {
            ...options,
            state,
        })

    /**
     * Toggle Shuffle For User's Playback
     *
     * Toggle shuffle on or off for user's playback.
     *
     * @param state The desired shuffle state.
     * @param options Optional request information.
     */
    const setShuffle = (state: boolean, options?: DeviceIdOptions): Promise<void> =>
        spotifyRequest<void>('/me/player/shuffle', 'PUT', undefined, {
            ...options,
            state,
        })

    return {
        setRepeat,
        setShuffle
    }
}
