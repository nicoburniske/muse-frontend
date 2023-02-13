import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { nowPlayingTrackIdAtom } from 'state/NowPlayingAtom'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'
import { cn } from 'util/Utils'

// Only change styling if derived values are different.
export const useTrackColor = (trackId: string) =>
   useAtomValue(
      useMemo(
         () =>
            atom(get => {
               const isPlaying = get(nowPlayingTrackIdAtom) === trackId
               const isSelected = get(selectedTrackAtom)?.trackId === trackId

               return isPlaying
                  ? 'bg-success text-success-content'
                  : isSelected
                  ? 'bg-info text-info-content'
                  : 'bg-base-200 text-base-content active:bg-accent active:text-accent-content hover:bg-base-300 delay-[40ms]'
            }),
         [trackId]
      )
   )

const animation = 'transition-all duration-500 hover:scale-125'
export const useLikeSvgStyle = (trackId: string) => (isLiked: boolean | undefined) => {
   return useAtomValue(
      useMemo(
         () =>
            atom(get => {
               if (isLiked !== undefined) {
                  const isPlaying = get(nowPlayingTrackIdAtom) === trackId
                  if (isLiked && isPlaying) {
                     return cn('fill-success-content', animation)
                  } else if (isLiked) {
                     return cn('fill-success', animation)
                  } else if (isPlaying) {
                     return cn('stroke-success-content', animation)
                  } else {
                     return cn('stroke-base-content', animation)
                  }
               }
               return ''
            }),
         [trackId, isLiked]
      )
   )
}
