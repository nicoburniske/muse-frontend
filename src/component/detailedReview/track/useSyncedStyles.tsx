import { useDerivedAtomValue } from 'platform/hook/useDerivedAtomValue'
import { nowPlayingTrackIdAtom } from 'state/NowPlayingAtom'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'
import { cn } from 'util/Utils'

// Only change styling if derived values are different.

const trackAnimation = ''
export const useTrackColor = (trackId: string) =>
   useDerivedAtomValue(
      get => {
         const isPlaying = get(nowPlayingTrackIdAtom) === trackId
         const isSelected = get(selectedTrackAtom)?.trackId === trackId

         if (isPlaying) {
            return cn(trackAnimation, 'bg-primary text-primary-foreground')
         } else if (isSelected) {
            return cn(trackAnimation, 'bg-secondary text-secondary-foreground')
         } else {
            return cn(
               trackAnimation,
               'bg-background text-foreground',
               'hover:bg-accent hover:text-accent-foreground',
               'active:text-accent-foreground active:bg-accent/90'
            )
         }
      },
      [trackId]
   )

const animation = 'transition-all duration-200 hover:scale-125'
export const useLikeSvgStyle = (trackId: string) => (isLiked: boolean | undefined) =>
   useDerivedAtomValue(
      get => {
         if (isLiked !== undefined) {
            const isPlaying = get(nowPlayingTrackIdAtom) === trackId
            if (isLiked && isPlaying) {
               return cn('fill-primary-foreground', animation)
            } else if (isLiked) {
               return cn('fill-primary', animation)
            } else if (isPlaying) {
               return cn('stroke-primary-foreground', animation)
            } else {
               return cn(
                  'stroke-foreground group-active:stroke-accent-foreground group-hover:stroke-accent-foreground ',
                  animation
               )
            }
         }
         return ''
      },
      [trackId, isLiked]
   )
