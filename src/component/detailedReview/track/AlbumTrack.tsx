import { DetailedTrackFragment } from 'graphql/generated/schema'
import { RefObject, useCallback, useRef } from 'react'
import useDoubleClick from 'platform/hook/useDoubleClick'
import LikeButton from 'component/LikeButton'
import { usePlayMutation } from 'component/sdk/ClientHooks'
import { useLikeSvgStyle, useTrackColor } from './useSyncedStyles'
import { cn, msToTimeStr } from 'util/Utils'
import { FireIcon } from '@heroicons/react/20/solid'
import { CommentAndOptions } from './CommentAndOptions'

export interface AlbumTrackProps {
   track: DetailedTrackFragment
   reviewId: string
}

// TODO: Consider making image optional for conciseness.
export default function AlbumTrack({ track, reviewId }: AlbumTrackProps) {
   const artistNames = track.artists
      ?.slice(0, 3)
      .map(a => a.name)
      .join(', ')

   // Get track styles.
   const styles = useTrackColor(track.id)
   const svgStyle = useCallback((isLiked: boolean | undefined) => useLikeSvgStyle(track.id)(isLiked), [track.id])

   const { playAlbumOffset, isLoading } = usePlayMutation()

   const onPlayTrack = () => {
      if (!isLoading) {
         // TODO: fix this?
         playAlbumOffset(track?.album?.id ?? '', track.id)
      }
   }

   // Play on div double click.
   const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>
   useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: onPlayTrack })

   const { minutes, seconds } = msToTimeStr(track.durationMs)

   return (
      <div
         className={cn(
            'group flex items-center justify-between',
            'm-0 select-none border-2 border-transparent p-0.5',
            styles
         )}
      >
         <div
            ref={playOnDoubleClickRef}
            className={cn('grid grow grid-cols-3 items-center justify-center md:grid-cols-4 lg:grid-cols-5')}
         >
            <div className='col-span-2 flex min-w-0 flex-col pl-1'>
               <div className='truncate p-0.5 text-base'> {track.name} </div>
               <div className='truncate p-0.5 text-sm font-light'> {artistNames ?? ''} </div>
            </div>

            <div className='hidden select-none place-items-center truncate p-0.5 text-center text-sm md:grid lg:text-base'>
               {`${minutes}:${seconds}`}
            </div>
            <div className='hidden place-items-center lg:grid'>
               <TrackPopularity popularity={track.popularity} />
            </div>
            <div className='grid place-items-center'>
               <LikeButton
                  trackId={track.id}
                  svgStyle={svgStyle}
                  options={{ staleTime: 1000 * 60, refetchOnMount: false, refetchOnWindowFocus: false }}
               />
            </div>
         </div>
         <CommentAndOptions reviewId={reviewId} trackId={track.id} />
      </div>
   )
}

const TrackPopularity = ({ popularity }: { popularity: number | null | undefined }) => {
   const color = (() => {
      if (!popularity) {
         return 'stroke-gray-500 fill-gray-500'
      } else if (popularity < 25) {
         return 'stroke-blue-500 fill-blue-500'
      } else if (popularity < 50) {
         return 'stroke-yellow-500 fill-yellow-500'
      } else if (popularity < 75) {
         return 'stroke-orange-500 fill-orange-500'
      } else if (popularity < 100) {
         return 'stroke-red-500 fill-red-500'
      }
   })()
   return (
      <div className='flex flex-row items-center space-x-0.5'>
         <div>{popularity}</div>
         <FireIcon className={cn('h-6 w-6', color)} />
      </div>
   )
}
