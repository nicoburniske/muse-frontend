import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { needsReconnectAtom, validPlaybackStateAtom } from './PlaybackSDK'

export type PlayerState = {
   timestamp: number
   positionMs: number
   durationMs: number

   getCurrentPositionMs: () => number

   repeatMode: 0 & 1 & 2
   repeatModeDisabled: boolean

   isShuffled: boolean
   toggleShuffleDisabled: boolean

   isPlaying: boolean
   togglePlayDisabled: boolean

   seekDisabled: boolean

   nextTrackDisabled: boolean
   prevTrackDisabled: boolean
}

export const usePlayerState = (): PlayerState => {
   const current = useAtomValue(validPlaybackStateAtom)
   const needsReconnect = useAtomValue(needsReconnectAtom)

   const disallows = current.disallows
   const positionMs = current.position
   const timestamp = current.timestamp

   const getCurrentPositionMs = useCallback(
      () => (current.paused ? positionMs : Date.now() - timestamp + positionMs),
      [current.paused, positionMs, timestamp]
   )

   return {
      timestamp,
      positionMs,
      durationMs: current.duration,
      getCurrentPositionMs,

      isShuffled: current.shuffle,
      toggleShuffleDisabled: needsReconnect || (disallows.toggling_shuffle ?? false),

      repeatMode: current.repeat_mode as 0 & 1 & 2,
      repeatModeDisabled: needsReconnect || (disallows.toggling_repeat_context ?? false),

      isPlaying: !current.paused,
      togglePlayDisabled: needsReconnect || ((current.paused ? disallows.resuming : disallows.pausing) ?? false),

      seekDisabled: needsReconnect || (disallows.seeking ?? false),

      nextTrackDisabled: needsReconnect || (disallows.skipping_next ?? false),
      prevTrackDisabled: needsReconnect || (disallows.skipping_prev ?? false),
   }
}
