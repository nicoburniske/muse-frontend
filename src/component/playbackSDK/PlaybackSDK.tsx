import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import { useEffect } from 'react'
import { AppConfig } from 'util/AppConfig'
import { nonNullable } from 'util/Utils'

export const SPOTIFY_WEB_PLAYBACK_SDK_URL = 'https://sdk.scdn.co/spotify-player.js'

// This needs to be imported at top level to setup spotify sdk.
export function SpotifySdk() {
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

const accessTokenAtom = atom(async () => {
    const r = await fetch(AppConfig.httpAccessTokenEndpoint, { method: 'GET', credentials: 'include' })
    return await r.text()
})
accessTokenAtom.debugLabel = 'accessTokenAtom'

export const useAccessToken = () => {
    return useAtomValue(accessTokenAtom)
}

/**
 * Spotify Player.
 **/
const playerAtom = atom<Promise<Spotify.Player>>(async (get) => {
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
const asyncPlaybackStateAtom = atom<Promise<Spotify.PlaybackState>>(async (get) => {
    const state = get(syncPlaybackStateAtom)
    if (state) {
        return state
    } else {
        return await new Promise(() => { })
    }
})
const currentTrackAtom = atom((get) => get(asyncPlaybackStateAtom).track_window.current_track)
export const usePlaybackStateSync = () => useAtomValue(syncPlaybackStateAtom)
export const usePlaybackState = () => useAtomValue(asyncPlaybackStateAtom)
export const useCurrentTrack = () => useAtomValue(currentTrackAtom)

// This can't be an atom because listener runs multiple times.
export const useSetupPlaybackState = () => {
    const player = useSpotifyPlayer()
    const setPlaybackState = useSetAtom(syncPlaybackStateAtom)

    useEffect(() => {
        player.addListener('player_state_changed', (state) => {
            setPlaybackState(state)
        })
        return () => player.removeListener('player_state_changed')
    }, [player])
}

// Sync playback state atom to auto-refresh.
export const useSetupPlaybackStateAutoRefresh = ({ refreshInterval }: { refreshInterval: number }) => {
    const player = useAtomValue(playerAtom)
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

export const seekIntervalAtom = atom(10000)
export const playerActionsAtom = atom<PlayerActions>((get) => {
    const player = get(playerAtom)
    const current = get(asyncPlaybackStateAtom)
    const seekInterval = get(seekIntervalAtom)

    const disallows = current.disallows
    const positionMs = current.position
    return {
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
})
export const usePlayerActions = () => useAtomValue(playerActionsAtom)

/**
 * Volume.
 */

const volumeAtom = atomWithStorage('MusePlayerVolume', 0.5)
export function useVolume(): [number, (volume: number) => Promise<void>] {
    const player = useSpotifyPlayer()
    const [volume, setVolume] = useAtom(volumeAtom)

    useEffect(() => {
        player.setVolume(volume)
    }, [player])


    async function setVolumeWithUpdate(newVolume: number): Promise<void> {
        if (newVolume < 0 || newVolume > 1) return

        await player.setVolume(newVolume)
        const playerVolume = await player.getVolume()
        setVolume(playerVolume)
    }

    return [volume, setVolumeWithUpdate]
} 
