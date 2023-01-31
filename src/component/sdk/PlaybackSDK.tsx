import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import atomValueOrSuspend from 'platform/atom/atomValueOrSuspend'
import atomWithSuspend from 'platform/atom/atomWithSuspend'
import { useEffect, useRef, useState } from 'react'
import { nonNullable } from 'util/Utils'

export const SPOTIFY_WEB_PLAYBACK_SDK_URL = 'https://sdk.scdn.co/spotify-player.js'

// This needs to be imported at top level to setup spotify sdk.
export function SpotifyPlaybackSdk() {
    useAtom(sdkReadyAtom)
    useAtom(loadable(deviceIdAtom))
    useAtom(loadable(asyncPlaybackStateAtom))

    const maybePlayer = useAtomValue(loadable(playerAtom))
    // Disconnect on unmount.
    useEffect(() => () => {
        if (maybePlayer.state === 'hasData') {
            maybePlayer.data.disconnect()
        }
    }, [])

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

type GetTokenFunction = Spotify.PlayerInit['getOAuthToken']
type GetTokenObject = {
    getOAuthToken: GetTokenFunction
}

const getTokenAtom = atomWithSuspend<GetTokenObject>()
getTokenAtom.debugLabel = 'getAccessTokenAtom'
export const useSetTokenFunction = () => useSetAtom(getTokenAtom)

/**
 * Spotify Player.
 **/
export const playerAtom = atom<Promise<Spotify.Player>>(async (get) => {
    const isSdkReady = get(sdkReadyAtom)
    const getTokenObj = get(getTokenAtom)

    if (isSdkReady) {
        const player = new Spotify.Player({
            name: 'Muse',
            getOAuthToken: getTokenObj.getOAuthToken,
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
const playbackStatesAtom = atomWithStorage<(Spotify.PlaybackState | null)[]>('PlaybackStates', [])
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
export const needsReconnectAtom = atom<boolean>((get) => {
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
latestValidPlaybackStateMaybeAtom.debugLabel = 'latestValidPlaybackStateMaybeAtom'
const existsPlaybackStateAtom = atom<boolean>((get) => (get(latestValidPlaybackStateMaybeAtom)) !== null)
export const useExistsPlaybackState = () => useAtomValue(existsPlaybackStateAtom)

export const asyncPlaybackStateAtom = atomValueOrSuspend(latestValidPlaybackStateMaybeAtom)
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

export const useCurrentPosition = (refreshInterval: number) => {
    const needsReconect = useNeedsReconnect()
    const current = usePlaybackState()

    const positionMs = current.position
    const durationMs = current.duration
    const timestamp = current.timestamp
    const isPlaying = !current.paused

    // Keep track of last pause.
    const lastPausetimestamp = useRef<number | undefined>(undefined)
    useEffect(() => {
        lastPausetimestamp.current = isPlaying ? undefined : timestamp 
    }, [isPlaying, timestamp])

    // Keep track of last update.
    const lastUpdateTimestampRef = useRef(timestamp)
    useEffect(() => { lastUpdateTimestampRef.current = timestamp }, [timestamp])

    const lastPositionRef = useRef(positionMs)
    const [position, setPosition] = useState(positionMs)

    // Sync when we receive new state.
    useEffect(() => {
        setPosition(positionMs)
        lastPositionRef.current = positionMs
    }, [positionMs])

    // Sync every refresh interval.
    useEffect(() => {
        const execute = () => {
            if (isPlaying && !needsReconect) {
                const lastPause = lastPausetimestamp.current ?? 0
                const elapsedTime = Date.now() - lastUpdateTimestampRef.current - lastPause
                const newPosition = elapsedTime + lastPositionRef.current
                setPosition(Math.min(newPosition, durationMs))
            }
        }
        execute()
        const intervalId = window.setInterval(() => execute(), refreshInterval)
        return () => window.clearInterval(intervalId)

    }, [refreshInterval, isPlaying, needsReconect])

    return position
}

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