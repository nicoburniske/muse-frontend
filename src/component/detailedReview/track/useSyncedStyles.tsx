import { useDerivedAtomValue } from 'platform/hook/useDerivedAtomValue'
import { nowPlayingTrackIdAtom } from 'state/NowPlayingAtom'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'
import { cn } from 'util/Utils'

// Only change styling if derived values are different.

const trackAnimation = 'transition-all duration-100'
export const useTrackColor = (trackId: string) =>
   useDerivedAtomValue(
      get => {
         const isPlaying = get(nowPlayingTrackIdAtom) === trackId
         const isSelected = get(selectedTrackAtom)?.trackId === trackId

         return isPlaying
            ? cn(trackAnimation, 'bg-success text-success-content')
            : isSelected
            ? cn(trackAnimation, 'bg-info text-info-content')
            : cn(
                 trackAnimation,
                 'bg-base-200 text-base-content active:bg-accent active:text-accent-content hover:bg-base-300'
              )
      },
      [trackId]
   )

const animation = 'transition-all duration-500 hover:scale-125'
export const useLikeSvgStyle = (trackId: string) => (isLiked: boolean | undefined) =>
   useDerivedAtomValue(
      get => {
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
      },
      [trackId, isLiked]
   )
