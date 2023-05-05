import { FireIcon } from '@heroicons/react/20/solid'
import LikeButton from 'component/LikeButton'
import { RefObject, useCallback, useRef } from 'react'
import { useDrag } from 'react-dnd'

import { usePlayMutation } from '@/component/sdk/ClientHooks'
import { DetailedTrackFragment } from '@/graphql/generated/schema'
import useDoubleClick from '@/lib/hook/useDoubleClick'
import { cn, msToTimeStr } from '@/util/Utils'

import { CommentAndOptions } from './CommentAndOptions'
import { useSetTrackContextMenu } from './TrackContextMenu'
import { useSimulateRightClick } from './useSimulateRightClick'
import { useLikeSvgStyle, useTrackColor } from './useSyncedStyles'

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
   const trackDivRef = useRef<HTMLDivElement>(null)
   useDoubleClick({ ref: trackDivRef, onDoubleClick: onPlayTrack })

   const { minutes, seconds } = msToTimeStr(track.durationMs)

   const trackId = track.id
   const [{ isDragging }, drag] = useDrag(
      () => ({
         type: 'Track',
         item: { trackId },
         canDrag: true,
         collect: monitor => ({
            isDragging: !!monitor.isDragging(),
         }),
      }),
      [trackId]
   )

   const setContextMenu = useSetTrackContextMenu()
   const showContextMenu = () => setContextMenu({ trackId })
   // Making context menu appear on options button regular click.
   const simulateRightClick = useSimulateRightClick()
   const onMenuClick = (referenceRef: RefObject<HTMLElement>) => simulateRightClick(trackDivRef, referenceRef)

   return (
      <div
         ref={drag}
         className={cn(
            'muse-track group flex items-center justify-between',
            'm-0 select-none border-2 border-transparent p-0.5',
            styles,
            isDragging ?? 'opacity-50'
         )}
         onContextMenu={showContextMenu}
      >
         <div
            ref={trackDivRef}
            className={cn(
               'grid grow select-none grid-cols-4 items-center justify-center md:grid-cols-5 lg:grid-cols-6'
            )}
         >
            <div className='col-span-2 flex min-w-0 flex-col pl-1'>
               <div className='truncate p-0.5 text-sm md:text-base'> {track.name} </div>
               <div className='truncate p-0.5 text-xs font-light md:text-sm'> {artistNames ?? ''} </div>
            </div>

            <div className='hidden select-none place-items-center truncate p-0.5 text-center text-sm md:grid lg:text-base'>
               {`${minutes}:${seconds}`}
            </div>
            <div className='hidden place-items-center lg:grid'>
               <TrackPopularity popularity={track.popularity} />
            </div>
            <div className='grid place-items-center'>
               <LikeButton trackId={track.id} svgStyle={svgStyle} options={{ staleTime: 1000 * 60 }} />
            </div>

            <div className='flex flex-none items-center justify-center space-x-2'>
               <CommentAndOptions trackId={track.id} reviewId={reviewId} onMenuClick={onMenuClick} />
            </div>
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
         <FireIcon className={cn('h-6 w-6', color)} />
      </div>
   )
}
