import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import { useEffect } from 'react'
import { nonNullable } from 'util/Utils'
import { DeviceIdOptions, RepeatState, SpotifyClient } from 'component/playbackSDK/SpotifyClient'

export const SPOTIFY_WEB_PLAYBACK_SDK_URL = 'https://sdk.scdn.co/spotify-player.js'

// This needs to be imported at top level to setup spotify sdk.
export function SpotifyPlaybackSdk() {
    useAtom(sdkReadyAtom)
    useAtom(loadable(playerAtom))
    useAtom(loadable(deviceIdAtom))
    useAtom(loadable(asyncPlaybackStateAtom))
    useAtom(loadable(accessTokenAtom))
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
const accessTokenAtom = atom<Promise<string>>(async (get) => {
    const accessToken = get(maybeAccessTokenAtom)
    if (accessToken) {
        return accessToken
    } else {
        return await new Promise(() => { })
    }
})
maybeAccessTokenAtom.debugLabel = 'accessTokenAtom'
export const useSetAccessToken = () => useSetAtom(maybeAccessTokenAtom)

/**
 * Spotify Player.
 **/
const playerAtom = atom<Promise<Spotify.Player>>(async (get) => {
    const isSdkReady = get(sdkReadyAtom)
    const accessToken = get(accessTokenAtom)
    if (isSdkReady) {
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
const isPlaybackStateInitAtom = atom(false)
const transferPlaybackOnMount = atom(false)
const playbackStatesAtom = atom<(Spotify.PlaybackState | null)[]>([])
// const playbackStatesAtom = atomWithStorage<(Spotify.PlaybackState | null)[]>('PlaybackStates', [])
playbackStatesAtom.debugLabel = 'playbackStatesAtom'
export const usePlaybackStates = () => useAtomValue(playbackStatesAtom)
// First set will signal that player has been connected 
const setPlaybackStateAtom = atom(null, (_get, set, state: Spotify.PlaybackState | null) => {
    set(isPlaybackStateInitAtom, true)
    set(playbackStatesAtom, (old) => [state, ...old].slice(0, 5))
})

// Latest Playback State.
const latestPlaybackStateAtom = atom<Spotify.PlaybackState | null>((get) => get(playbackStatesAtom)[0] ?? null)
latestPlaybackStateAtom.debugLabel = 'latestPlaybackStateAtom'
export const useLatestPlaybackState = () => useAtomValue(latestPlaybackStateAtom)

// Needs Reconnect.
const needsReconnectAtom = atom<boolean>((get) => {
    const isInit = get(isPlaybackStateInitAtom)
    const latestValid = get(latestValidPlaybackStateMaybeAtom)
    const latest = get(latestPlaybackStateAtom)

    return !isInit || (!nonNullable(latestValid) || !nonNullable(latest)
        || latestValid.timestamp !== latest.timestamp
    )
})
needsReconnectAtom.debugLabel = 'needsReconnectAtom'
export const useNeedsReconnect = () => useAtomValue(needsReconnectAtom)

const latestValidPlaybackStateMaybeAtom = atom<Spotify.PlaybackState | null>((get) => {
    const states = get(playbackStatesAtom)
    return states.find(s => nonNullable(s?.track_window.current_track)) ?? null
})
const existsPlaybackStateAtom = atom<boolean>((get) => (get(latestValidPlaybackStateMaybeAtom)) !== null)
export const useExistsPlaybackState = () => useAtomValue(existsPlaybackStateAtom)
latestValidPlaybackStateMaybeAtom.debugLabel = 'latestValidPlaybackStateMaybeAtom'

const asyncPlaybackStateAtom = atom<Promise<Spotify.PlaybackState>>(async (get) => {
    const state = get(latestValidPlaybackStateMaybeAtom)
    if (state) {
        return state
    } else {
        return await new Promise(() => { })
    }
})
asyncPlaybackStateAtom.debugLabel = 'asyncPlaybackStateAtom'
export const usePlaybackState = () => useAtomValue(asyncPlaybackStateAtom)

const currentTrackAtom = atom<Spotify.Track>((get) => get(asyncPlaybackStateAtom).track_window.current_track)
export const useCurrentTrack = () => useAtomValue(currentTrackAtom)


// This can't be an atom because listener runs multiple times.
export const useSyncPlaybackState = () => {
    const player = useSpotifyPlayer()
    const setPlaybackState = useSetAtom(setPlaybackStateAtom)

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
    const playbackState = useAtomValue(latestPlaybackStateAtom)
    const setPlaybackState = useSetAtom(setPlaybackStateAtom)

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
 * Spotify Client.
 */

const spotifyClientAtom = atom((get) => SpotifyClient(get(accessTokenAtom)))
export const useSpotifyClient = () => useAtomValue(spotifyClientAtom)

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
    const needsReconnect = get(needsReconnectAtom)

    const disallows = current.disallows
    const positionMs = current.position
    return {
        positionMs,
        durationMs: current.duration,

        isShuffled: current.shuffle,
        toggleShuffleDisabled: needsReconnect || (disallows.toggling_shuffle ?? false),
        setShuffle: client.setShuffle,

        repeatMode: current.repeat_mode as 0 & 1 & 2,
        repeatModeDisabled: needsReconnect || (disallows.toggling_repeat_context ?? false),
        setRepeatMode: client.setRepeat,

        isPlaying: !current.paused,
        togglePlayDisabled: needsReconnect || ((current.paused ? disallows.resuming : disallows.pausing) ?? false),
        togglePlay: () => player.togglePlay(),
        pause: () => player.pause(),
        play: () => player.resume(),

        seekDisabled: needsReconnect || (disallows.seeking ?? false),
        seekForward: () => player.seek(positionMs + seekInterval),
        seekBackward: () => player.seek(positionMs - seekInterval),
        seekTo: (positionMs: number) => player.seek(positionMs),

        nextTrackDisabled: needsReconnect || (disallows.skipping_next ?? false),
        nextTrack: () => player.nextTrack(),
        prevTrackDisabled: needsReconnect || (disallows.skipping_prev ?? false),
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

interface UseVolume {
    disabled: boolean,
    volume: number,
    setVolume: (volume: number) => void,
    toggleMute: (update: boolean | undefined) => void
}
export function useVolume(): UseVolume {
    const player = useSpotifyPlayer()
    const disabled = useAtomValue(needsReconnectAtom)
    const volume = useAtomValue(volumeWithMute)
    const toggleMute = useSetAtom(isMutedAtom)
    const setVolume = useSetAtom(setVolumeAtom)

    useEffect(() => {
        player.setVolume(volume)
    }, [player, volume])

    return { disabled, volume, setVolume, toggleMute }
}


