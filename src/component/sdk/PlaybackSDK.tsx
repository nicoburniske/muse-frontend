import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import atomValueOrThrow from 'platform/atom/atomValueOrThrow'
import { useTransientAtom } from 'platform/hook/useTransientAtom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { nonNullable } from 'util/Utils'

type SpotifyErrorHandler = {
   initializationError: (error: Spotify.Error) => void
   authenticationError: (error: Spotify.Error) => void
   accountError: (error: Spotify.Error) => void
   playbackError: (error: Spotify.Error) => void
}

// This needs to be imported at top level to setup spotify sdk.
export function SpotifyPlaybackSdk({ errorHandler }: { errorHandler: SpotifyErrorHandler }) {
   useSetupSdk()

   const player = useAtomValue(maybePlayerAtom)
   const { isReady, initPlayer } = useInitPlayer()

   useEffect(() => {
      const execute = () => initPlayer()
      if (isReady) {
         execute()
      }
   }, [isReady, initPlayer])

   // Disconnect on window close.
   useEffect(() => {
      const cleanup = () => player?.disconnect()

      window.addEventListener('beforeunload', cleanup)

      return () => {
         window.removeEventListener('beforeunload', cleanup)
      }
   }, [player])

   // Event handling.
   const setPlaybackState = useSetAtom(setPlaybackStateAtom)
   useEffect(() => {
      if (player) {
         player.addListener('player_state_changed', setPlaybackState)

         const { initializationError, authenticationError, accountError, playbackError } = errorHandler
         player.addListener('initialization_error', initializationError)
         player.addListener('authentication_error', authenticationError)
         player.addListener('account_error', accountError)
         player.addListener('playback_error', playbackError)

         return () => {
            player.removeListener('player_state_changed', setPlaybackState)
            player.removeListener('initialization_error', initializationError)
            player.removeListener('authentication_error', authenticationError)
            player.removeListener('account_error', accountError)
            player.removeListener('playback_error', playbackError)
         }
      }
   }, [player, setPlaybackState])

   return null
}

const useInitPlayer = () => {
   const setPlayer = useSetAtom(maybePlayerAtom)
   const setDeviceId = useSetAtom(maybeDeviceIdAtom)

   const { isReady, createPlayer } = useCreatePlayer()

   const initPlayer = useCallback(async () => {
      const { player, deviceId } = await createPlayer()
      setPlayer(player)
      setDeviceId(deviceId)
   }, [isReady, createPlayer, setPlayer, setDeviceId])

   return {
      isReady,
      initPlayer,
   }
}

const useCreatePlayer = () => {
   const sdkReady = useAtomValue(sdkReadyAtom)
   const accessTokenFunc = useAtomValue(maybeTokenAtom)

   const isReady = sdkReady && accessTokenFunc !== null
   const createPlayer = useCallback(async () => {
      if (isReady) {
         const getOAuthToken = accessTokenFunc.getOAuthToken
         const player = new Spotify.Player({
            name: 'Muse',
            getOAuthToken,
         })
         const successPromise = player.connect()
         const deviceIdPromise = new Promise<string>((resolve, reject) => {
            player.addListener('ready', ({ device_id }) => {
               resolve(device_id)
            })

            player.addListener('not_ready', () => {
               reject(new Error('Spotify player not ready.'))
            })
         })

         await Promise.all([successPromise, deviceIdPromise])
         const success = await successPromise
         const deviceId = await deviceIdPromise

         if (success) {
            return { player, deviceId }
         } else {
            throw new Error('Failed to connect to Spotify Player.')
         }
      } else {
         throw new Error('Spotify SDK not ready.')
      }
   }, [sdkReady, accessTokenFunc])

   return {
      isReady,
      createPlayer,
   }
}

const isPlayerReadyAtom = atom(
   get => get(sdkReadyAtom) && get(maybePlayerAtom) !== null && get(maybeDeviceIdAtom) !== null
)
export const useIsPlayerReady = () => useAtomValue(isPlayerReadyAtom)

export const useDisconnectPlayer = () => {
   const [getPlayer] = useTransientAtom(maybePlayerAtom)

   return useCallback(() => getPlayer()?.disconnect(), [getPlayer])
}

export const sdkReadyAtom = atom<boolean>(false)
sdkReadyAtom.debugLabel = 'sdkReadyAtom'
const useSetupSdk = () => {
   const [isReady, setReady] = useAtom(sdkReadyAtom)

   useEffect(() => {
      if (!isReady) {
         const script = document.createElement('script')
         script.src = 'https://sdk.scdn.co/spotify-player.js'
         script.async = true
         document.body.appendChild(script)

         window.onSpotifyWebPlaybackSDKReady = () => {
            setReady(true)
         }

         return () => {
            document.body.removeChild(script)
         }
      }
   }, [isReady, setReady])
}

export const useResetSpotifySdk = () => {
   const setReady = useSetAtom(sdkReadyAtom)
   return useCallback(() => setReady(false), [setReady])
}

type GetTokenObject = {
   getOAuthToken: Spotify.PlayerInit['getOAuthToken']
}

const maybeTokenAtom = atom<GetTokenObject | null>(null)
maybeTokenAtom.debugLabel = 'getAccessTokenAtom'
export const useSetTokenFunction = () => useSetAtom(maybeTokenAtom)

/**
 * Spotify Player.
 **/
const maybePlayerAtom = atom<Spotify.Player | null>(null)
export const playerAtom = atomValueOrThrow(maybePlayerAtom)
playerAtom.debugLabel = 'playerAtom'
export const useSpotifyPlayer = () => useAtomValue(playerAtom)

/**
 * Device ID.
 */

const maybeDeviceIdAtom = atom<string | null>(null)
export const deviceIdAtom = atomValueOrThrow(maybeDeviceIdAtom)
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

export const validPlaybackStateAtom = atomValueOrThrow(latestValidPlaybackStateMaybeAtom)
validPlaybackStateAtom.debugLabel = 'asyncPlaybackStateAtom'
export const usePlaybackState = () => useAtomValue(validPlaybackStateAtom)

const currentTrackAtom = atom<Promise<Spotify.Track>>(async get => {
   const state = await get(validPlaybackStateAtom)
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
