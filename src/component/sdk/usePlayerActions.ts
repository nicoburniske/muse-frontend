import { useAtomValue } from 'jotai'
import { RepeatState } from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { DeviceIdOptions } from 'spotify-web-api-ts/types/types/SpotifyOptions'
import { validPlaybackStateAtom, deviceIdAtom, playerAtom } from './PlaybackSDK'
import { seekIntervalAtom } from 'state/UserPreferences'
import { spotifyClientAtom } from './ClientAtoms'
import { useTransientAtom } from 'platform/hook/useTransientAtom'

/**
 * Playback Actions
 */

export type PlayerActions = {
   getCurrentPositionMs: () => number

   /**
    * 0: NO_REPEAT
    * 1: ONCE_REPEAT
    * 2: FULL_REPEAT
    */
   setRepeatMode: (state: RepeatState, options?: DeviceIdOptions) => Promise<void>

   setShuffle: (state: boolean, options?: DeviceIdOptions) => Promise<void>

   togglePlay: () => Promise<void>
   pause: () => Promise<void>
   play: () => Promise<void>

   seekForward: () => Promise<void>
   seekBackward: () => Promise<void>
   seekTo: (positionMs: number) => Promise<void>

   nextTrack: () => Promise<void>
   previousTrack: () => Promise<void>
}

export const usePlayerActions = (): PlayerActions => {
   const deviceId = useAtomValue(deviceIdAtom)
   const player = useAtomValue(playerAtom)
   const seekInterval = useAtomValue(seekIntervalAtom)
   const client = useAtomValue(spotifyClientAtom)

   const [getCurrent] = useTransientAtom(validPlaybackStateAtom)

   const getCurrentPositionMs = () => {
      const current = getCurrent()
      const positionMs = current.position
      const timestamp = current.timestamp
      return current.paused ? positionMs : Date.now() - timestamp + positionMs
   }

   return {
      getCurrentPositionMs,

      setShuffle: (state: boolean, options?: DeviceIdOptions) =>
         client.player.setShuffle(state, options ?? { device_id: deviceId }),

      setRepeatMode: (state: RepeatState, options?: DeviceIdOptions) =>
         client.player.setRepeat(state, options ?? { device_id: deviceId }),

      togglePlay: () => player.togglePlay(),
      pause: () => player.pause(),
      play: () => player.resume(),

      seekForward: async () => {
         const current = getCurrentPositionMs()
         return player.seek(current + seekInterval)
      },
      seekBackward: async () => {
         const current = getCurrentPositionMs()
         return player.seek(current - seekInterval)
      },
      seekTo: (positionMs: number) => player.seek(positionMs),

      nextTrack: () => player.nextTrack(),
      previousTrack: async () => {
         const current = getCurrentPositionMs()
         if (current > 3000) {
            return player.seek(0)
         } else {
            return player.previousTrack()
         }
      },
   }
}
