import { DetailedTrackFragment } from 'graphql/generated/schema'
import { PrimitiveAtom } from 'jotai'
import { RefObject, useCallback, useRef } from 'react'
import useDoubleClick from 'platform/hook/useDoubleClick'
import LikeButton from 'component/LikeButton'
import { usePlayMutation } from 'component/sdk/ClientHooks'
import { useLikeSvgStyle, useTrackColor } from './useSyncedStyles'
import { classNames, msToTimeStr } from 'util/Utils'
import { FireIcon } from '@heroicons/react/20/solid'
import TrackOptions from './TrackDropdown'

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

   const { albumOffset, isLoading } = usePlayMutation()

   const onPlayTrack = () => {
      if (!isLoading) {
         // TODO: fix this?
         albumOffset(track?.album?.id ?? '', track.id)
      }
   }

   // Play on div double click.
   const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>
   useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: onPlayTrack })

   const { minutes, seconds } = msToTimeStr(track.durationMs)

   return (
      <div
         ref={playOnDoubleClickRef}
         className={classNames(
            'group card card-body m-0 flex select-none flex-row items-center justify-between border-2 border-base-300 p-0.5',
            styles
         )}
      >
         <div className='flex w-24 flex-col pl-1 md:w-40 lg:w-48'>
            <div className='select-none	truncate p-0.5 text-base'> {track.name} </div>
            <div className='select-none	truncate p-0.5 text-sm font-light'> {artistNames ?? ''} </div>
         </div>

         <div className='hidden	select-none place-items-center truncate p-0.5 text-center text-sm md:grid lg:text-base'>
            {`${minutes}:${seconds}`}
         </div>
         <div className='hidden place-items-center md:grid'>
            <TrackPopularity popularity={track.popularity} />
         </div>
         <div className='grid place-items-center'>
            <LikeButton
               trackId={track.id}
               svgStyle={svgStyle}
               options={{ staleTime: 1000 * 60, refetchOnMount: false, refetchOnWindowFocus: false }}
               className={'btn btn-ghost btn-sm p-0'}
            />
         </div>
         <div className='mr-5 flex w-5'>
            <TrackOptions trackId={track.id} reviewId={reviewId} />
         </div>
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
         <FireIcon className={classNames('h-6 w-6', color)} />
      </div>
   )
}
