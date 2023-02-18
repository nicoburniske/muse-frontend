import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import atomValueOrSuspend from 'platform/atom/atomValueOrSuspend'
import atomWithSuspend from 'platform/atom/atomWithSuspend'
import { useExecuteOnce } from 'platform/hook/useExecuteOnce'
import { useTransientAtom } from 'platform/hook/useTransientAtom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { nonNullable } from 'util/Utils'

export const SPOTIFY_WEB_PLAYBACK_SDK_URL = 'https://sdk.scdn.co/spotify-player.js'

type HasData<T> = { state: 'hasData'; data: T }
type SpotifyErrorHandler = {
   initializationError: (error: Spotify.Error) => void
   authenticationError: (error: Spotify.Error) => void
   accountError: (error: Spotify.Error) => void
   playbackError: (error: Spotify.Error) => void
}

// This needs to be imported at top level to setup spotify sdk.
export function SpotifyPlaybackSdk({ errorHandler }: { errorHandler: SpotifyErrorHandler }) {
   const isReady = useAtomValue(sdkReadyAtom)
   const load = useAtomValue(loadable(getTokenAtom))
   const [getPlayer, setPlayer] = useTransientAtom(playerAtom)
   const setPlaybackState = useSetAtom(setPlaybackStateAtom)

   useExecuteOnce(
      () => isReady && load.state === 'hasData',
      () => {
         ;(async () => {
            const player = new Spotify.Player({
               name: 'Muse',
               getOAuthToken: (load as HasData<GetTokenObject>).data.getOAuthToken,
            })
            const success = await player.connect()

            if (success) {
               player.addListener('player_state_changed', state => setPlaybackState(state))
               const { initializationError, authenticationError, accountError, playbackError } = errorHandler
               player.addListener('initialization_error', error => initializationError(error))
               player.addListener('authentication_error', error => authenticationError(error))
               player.addListener('account_error', error => accountError(error))
               player.addListener('playback_error', error => playbackError(error))

               setPlayer(player)
            } else {
               throw new Error('Failed to connect to Spotify Player.')
            }
         })()
      },
      [load, setPlayer, setPlaybackState]
   )
   useEffect(
      () => () => {
         getPlayer().then(p => p.disconnect())
      },
      [getPlayer]
   )

   return null
}

export const useDisconnectPlayer = () => {
   const [getPlayer] = useTransientAtom(playerAtom)

   return useCallback(() => getPlayer().then(p => p.disconnect()), [getPlayer])
}

export const sdkReadyAtom = atom<boolean>(false)
sdkReadyAtom.debugLabel = 'sdkReadyAtom'
sdkReadyAtom.onMount = setAtom => {
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
export const playerAtom = atomWithSuspend<Spotify.Player>()
playerAtom.debugLabel = 'playerAtom'
export const useSpotifyPlayer = () => useAtomValue(playerAtom)

/**
 * Device ID.
 */

export const deviceIdAtom = atom<Promise<string>>(async get => {
   const player = await get(playerAtom)
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
   set(playbackStatesAtom, old => [state, ...old].slice(0, 5))
})

// Latest Playback State.
const latestPlaybackStateAtom = atom<Spotify.PlaybackState | null>(get => get(playbackStatesAtom)[0] ?? null)
latestPlaybackStateAtom.debugLabel = 'latestPlaybackStateAtom'
export const useLatestPlaybackState = () => useAtomValue(latestPlaybackStateAtom)

// Needs Reconnect.
// When playback gets disconnected (due to transfer to another device), we get a single NULL playbackstate.
export const needsReconnectAtom = atom<boolean>(get => {
   const isInit = get(isPlaybackStateInitAtom)
   const latestValid = get(latestValidPlaybackStateMaybeAtom)
   const latest = get(latestPlaybackStateAtom)

   return !isInit || !nonNullable(latestValid) || !nonNullable(latest) || latestValid.timestamp !== latest.timestamp
})
needsReconnectAtom.debugLabel = 'needsReconnectAtom'
export const useNeedsReconnect = () => useAtomValue(needsReconnectAtom)

const latestValidPlaybackStateMaybeAtom = atom<Spotify.PlaybackState | null>(get => {
   const states = get(playbackStatesAtom)
   return states.find(s => nonNullable(s?.track_window.current_track)) ?? null
})
latestValidPlaybackStateMaybeAtom.debugLabel = 'latestValidPlaybackStateMaybeAtom'
const existsPlaybackStateAtom = atom<boolean>(get => get(latestValidPlaybackStateMaybeAtom) !== null)
export const useExistsPlaybackState = () => useAtomValue(existsPlaybackStateAtom)

export const asyncPlaybackStateAtom = atomValueOrSuspend(latestValidPlaybackStateMaybeAtom)
asyncPlaybackStateAtom.debugLabel = 'asyncPlaybackStateAtom'
export const usePlaybackState = () => useAtomValue(asyncPlaybackStateAtom)

const currentTrackAtom = atom<Promise<Spotify.Track>>(async get => {
   const state = await get(asyncPlaybackStateAtom)
   return state.track_window.current_track
})
export const useCurrentTrack = () => useAtomValue(currentTrackAtom)

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
   useEffect(() => {
      lastUpdateTimestampRef.current = timestamp
   }, [timestamp])

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
      const intervalId = setInterval(() => execute(), refreshInterval)
      return () => clearInterval(intervalId)
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
const volumeWithMute = atom(get => {
   const volume = get(volumeAtom)
   const muted = get(isMutedAtom)
   return muted ? 0 : volume
})

interface UseVolume {
   disabled: boolean
   volume: number
   setVolume: (volume: number) => void
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
