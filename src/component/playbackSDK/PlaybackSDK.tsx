import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { AppConfig } from 'util/AppConfig'
import { nonNullable } from 'util/Utils'

export const SPOTIFY_WEB_PLAYBACK_SDK_URL = 'https://sdk.scdn.co/spotify-player.js'

const sdkReadyAtom = atom<boolean>(false)

export const useSetupSpotifySDK = () => {
    const setSdkReady = useSetAtom(sdkReadyAtom)

    // load Web Playback SDK.
    useEffect(() => {
        const script = document.createElement('script')
        script.src = SPOTIFY_WEB_PLAYBACK_SDK_URL
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])


    // set sdk ready.
    useEffect(() => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            setSdkReady(true)
        }
    }, [])
}


const getAccessToken = async () => {
    const r = await fetch(AppConfig.httpAccessTokenEndpoint, { method: 'GET', credentials: 'include' })
    return await r.text()
}
const accessTokenAtom = atom(() => getAccessToken())

export const useAccessToken = () => {
    return useAtomValue(accessTokenAtom)
}

const playerAtom = atom(async (get) => {
    const isSdkReady = get(sdkReadyAtom)
    const accessToken = get(accessTokenAtom)
    if (isSdkReady && accessToken) {
        const player = new Spotify.Player({
            name: 'Muse',
            getOAuthToken: (callback) => callback(accessToken),
        })

        const success = await player.connect()
        return success ? player : null
    }
    return undefined
})

export const useSpotifyPlayer = () => {
    return useAtomValue(playerAtom)
}

const deviceIdAtom = atom<Promise<string | null>>(async (get) => {
    const player = get(playerAtom)
    if (player) {
        return await new Promise((resolve) => {
            player.addListener('ready', ({ device_id }) => {
                resolve(device_id)
            })

            player.addListener('not_ready', () => {
                resolve(null)
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


