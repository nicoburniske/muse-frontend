import { DetailedPlaylistTrackFragment, GetPlaylistQuery, useGetPlaylistQuery } from 'graphql/generated/schema'
import { RefObject, useCallback, useEffect, useRef } from 'react'
import UserAvatar from 'component/UserAvatar'
import useDoubleClick from 'platform/hook/useDoubleClick'
import LikeButton from 'component/LikeButton'
import {
   useAddTracksToPlaylistMutation,
   usePlayMutation,
   useReorderPlaylistTracksMutation,
} from 'component/sdk/ClientHooks'
import { useLikeSvgStyle, useTrackColor } from './useSyncedStyles'
import { cn, msToTimeStr } from 'util/Utils'
import { useDrag, useDrop } from 'react-dnd'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useCurrentUserId } from 'state/CurrentUser'
import { CommentAndOptions } from './CommentAndOptions'

export interface PlaylistTrackProps {
   index: number
   playlistTrack: DetailedPlaylistTrackFragment
   reviewId: string
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ index, playlistTrack, reviewId }: PlaylistTrackProps) {
   const {
      addedAt,
      addedBy,
      track,
      playlist: { id: playlistId },
   } = playlistTrack
   const { data: playlistOwner } = useGetPlaylistQuery(
      { id: playlistId },
      {
         select: useCallback((data: GetPlaylistQuery) => data.getPlaylist?.owner.id, []),
      }
   )

   const artistNames = track.artists
      ?.slice(0, 3)
      .map(a => a.name)
      .join(', ')
   // Sorted biggest to smallest.
   const albumImage = track.album?.images?.at(-1)

   // Get track styles.
   const styles = useTrackColor(track.id)

   const { playPlaylistOffset, isLoading } = usePlayMutation()

   const onPlayTrack = () => {
      if (!isLoading) {
         playPlaylistOffset(playlistId, track.id)
      }
   }

   // Play on div double click.
   const trackDivRef = useRef<HTMLDivElement>()
   useDoubleClick({ ref: trackDivRef as RefObject<HTMLDivElement>, onDoubleClick: onPlayTrack })

   const { minutes, seconds } = msToTimeStr(track.durationMs)

   const dateAdded = new Date(addedAt).toLocaleDateString()

   const queryClient = useQueryClient()
   const reloadPlaylist = () => queryClient.invalidateQueries(useGetPlaylistQuery.getKey({ id: playlistId }))

   // On success optimistic update for atoms!
   const { mutate: addTracksToPlaylist } = useAddTracksToPlaylistMutation({
      onSuccess: () => {
         reloadPlaylist()
         toast.success('Added track to playlist.')
      },
      onError: () => toast.error('Failed to add track to playlist.'),
   })

   const { mutate: reorder } = useReorderPlaylistTracksMutation({
      onSuccess: () => {
         reloadPlaylist()
         toast.success('Reordered playlist tracks.')
      },
      onError: () => toast.error('Failed to reorder playlist tracks.'),
   })

   const currentUserId = useCurrentUserId()
   type TrackDndEvent = { trackId: string; playlistId?: string; index?: number }
   // Drop to add to playlist.
   const [{ canDrop, isAbove }, drop] = useDrop(
      () => ({
         accept: 'Track',
         canDrop: (item: TrackDndEvent) => currentUserId === playlistOwner && item.trackId !== trackId,
         drop: (item: TrackDndEvent) => {
            const lastIsAbove = lastIsAboveRef.current
            const insertIndex = lastIsAbove ? index : index + 1
            if (item.playlistId === playlistId && item.index !== undefined) {
               reorder({ playlistId, insertBefore: insertIndex, rangeStart: item.index, rangeLength: 1 })
            } else {
               addTracksToPlaylist({ trackIds: [item.trackId], playlistId, position: insertIndex })
            }
         },
         collect: monitor => {
            const canDrop = !!monitor.isOver() && monitor.canDrop()

            const clientOffset = monitor.getClientOffset()
            const currentDiv = trackDivRef.current?.getBoundingClientRect()
            if (clientOffset && currentDiv) {
               const { y } = clientOffset
               const { top, bottom } = currentDiv
               const isAbove = y < top + (bottom - top) / 2
               return { canDrop, isAbove }
            } else {
               return { canDrop, isAbove: undefined }
            }
         },
      }),
      [reorder, addTracksToPlaylist, currentUserId, playlistOwner]
   )

   // isAbove will be undefined after drag is released!
   // So we need to save last value in ref.
   const lastIsAboveRef = useRef<boolean>(false)
   useEffect(() => {
      if (isAbove !== undefined) {
         lastIsAboveRef.current = isAbove
      }
   }, [isAbove])

   // Drag to re-order.
   const trackId = track.id
   const [{ isDragging }, drag] = useDrag(
      () => ({
         type: 'Track',
         item: { trackId, playlistId, index },
         canDrag: true,
         collect: monitor => ({
            isDragging: !!monitor.isDragging(),
         }),
      }),
      [trackId]
   )

   const svgStyle = useCallback((isLiked: boolean | undefined) => useLikeSvgStyle(trackId)(isLiked), [trackId])

   return (
      <div
         className={cn(
            'group flex items-center justify-between',
            'm-0 select-none border-2 border-transparent p-0.5',
            styles,
            isDragging ? 'opacity-50' : '',
            isAbove === undefined || !canDrop
               ? ''
               : isAbove
               ? 'border-t-2 border-t-primary'
               : 'border-b-2 border-b-primary'
         )}
      >
         <div
            ref={(el: HTMLDivElement) => {
               drag(el)
               drop(el)
               trackDivRef.current = el
            }}
            className={cn('grid grow grid-cols-4 items-center justify-center md:grid-cols-5 lg:grid-cols-6')}
         >
            <div className='col-span-2 flex flex-row items-center justify-start space-x-1'>
               <div className='avatar ml-1 flex-none'>
                  <div className='h-8 w-8 rounded md:h-12 md:w-12'>
                     <img src={albumImage} />
                  </div>
               </div>

               <div className='flex min-w-0 flex-col pl-1'>
                  <div className='select-none truncate p-0.5 text-sm md:text-base'> {track.name} </div>
                  <div className='select-none truncate p-0.5 text-xs font-light md:text-sm'> {artistNames ?? ''} </div>
               </div>
            </div>

            <div className='hidden place-items-center lg:grid'>
               <UserAvatar dateAdded={dateAdded} user={addedBy} />
            </div>

            <div className='hidden select-none place-items-center truncate p-0.5 text-center text-sm md:grid lg:text-base'>
               {`${minutes}:${seconds}`}
            </div>
            <div className='cols-span-1 grid place-items-center'>
               <LikeButton trackId={track.id} svgStyle={svgStyle} options={{ staleTime: 1000 * 60 }} />
            </div>

            <div className='flex flex-none items-center justify-center space-x-2'>
               <CommentAndOptions trackId={track.id} reviewId={reviewId} playlistId={playlistId} />
            </div>
         </div>
      </div>
   )
}
