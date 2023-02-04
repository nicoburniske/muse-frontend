import { atom, useAtomValue } from 'jotai'
import { RepeatState } from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { DeviceIdOptions } from 'spotify-web-api-ts/types/types/SpotifyOptions'
import { asyncPlaybackStateAtom, needsReconnectAtom, playerAtom } from './PlaybackSDK'
import { seekIntervalAtom } from 'state/UserPreferences'
import { spotifyClientAtom } from './ClientAtoms'

/**
 * Playback Actions
 */

interface PlayerActions {
   timestamp: number
   positionMs: number
   durationMs: number

   getCurrentPositionMs: () => number

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

export const playerActionsAtom = atom<Promise<PlayerActions>>(async get => {
   const player = await get(playerAtom)
   const current = await get(asyncPlaybackStateAtom)
   const seekInterval = get(seekIntervalAtom)
   const client = await get(spotifyClientAtom)
   const needsReconnect = get(needsReconnectAtom)

   const disallows = current.disallows
   const positionMs = current.position
   const timestamp = current.timestamp

   const getCurrentPositionMs = () => (current.paused ? positionMs : Date.now() - timestamp + positionMs)

   return {
      timestamp,
      positionMs,
      durationMs: current.duration,
      getCurrentPositionMs,

      isShuffled: current.shuffle,
      toggleShuffleDisabled: needsReconnect || (disallows.toggling_shuffle ?? false),
      setShuffle: (state: boolean, options?: DeviceIdOptions) => client.player.setShuffle(state, options),

      repeatMode: current.repeat_mode as 0 & 1 & 2,
      repeatModeDisabled: needsReconnect || (disallows.toggling_repeat_context ?? false),
      setRepeatMode: (state: RepeatState, options?: DeviceIdOptions) => client.player.setRepeat(state, options),

      isPlaying: !current.paused,
      togglePlayDisabled: needsReconnect || ((current.paused ? disallows.resuming : disallows.pausing) ?? false),
      togglePlay: () => player.togglePlay(),
      pause: () => player.pause(),
      play: () => player.resume(),

      seekDisabled: needsReconnect || (disallows.seeking ?? false),
      seekForward: () => player.seek(getCurrentPositionMs() + seekInterval),
      seekBackward: () => player.seek(getCurrentPositionMs() - seekInterval),
      seekTo: (positionMs: number) => player.seek(positionMs),

      nextTrackDisabled: needsReconnect || (disallows.skipping_next ?? false),
      nextTrack: () => player.nextTrack(),
      prevTrackDisabled: needsReconnect || (disallows.skipping_prev ?? false),
      previousTrack: () => player.previousTrack(),
   }
})
playerActionsAtom.debugLabel = 'playerActionsAtom'
export const usePlayerActions = () => useAtomValue(playerActionsAtom)
