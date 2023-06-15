import { ChatBubbleLeftIcon, EllipsisVerticalIcon, FireIcon } from '@heroicons/react/24/outline'
import { ColumnDef, flexRender } from '@tanstack/react-table'
import { memo, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

import { LikeButton } from '@/component/LikeButton'
import { usePlayMutation } from '@/component/sdk/ClientHooks'
import { useSetTrackContextMenu } from '@/component/track/TrackContextMenu'
import { useCommentModalTrack } from '@/component/track/useCommentModalTrack'
import { useSimulateRightClick } from '@/component/track/useSimulateRightClick'
import { useLikeSvgStyle, useTrackColor } from '@/component/track/useSyncedStyles'
import { DetailedTrackFragment } from '@/graphql/generated/schema'
import { Button } from '@/lib/component/Button'
import { TableCell, TableHead } from '@/lib/component/Table'
import useDoubleClick from '@/lib/hook/useDoubleClick'
import { useCurrentUserId } from '@/state/CurrentUser'
import { useReviewOverviewAtom } from '@/state/useReviewOverviewAtom'
import { usePrefetchLikes } from '@/state/useTrackLikeQuery'
import { cn, msToTimeStr } from '@/util/Utils'

import { useScrollToSelectedSingle, useSortOnClick, useSyncNowPlaying } from './TableHooks'
import { RenderRow, TrackTableAbstract } from './TrackTableAbstract'

export type AlbumTrackTableProps = {
   reviewId: string
   tracks: DetailedTrackFragment[]
}

export const AlbumTrackTable = ({ reviewId, tracks }: AlbumTrackTableProps) => {
   const columns = makeColumns(reviewId)
   const getTrackId = useCallback((track: DetailedTrackFragment) => track.id, [])
   const sync = useScrollToSelectedSingle(tracks, getTrackId, getTrackId)

   const trackIds = tracks.map(t => t.id)
   useSyncNowPlaying(trackIds)
   usePrefetchLikes(trackIds)

   return (
      <TrackTableAbstract
         columns={columns}
         data={tracks}
         getRowId={row => row.id}
         renderRow={MemoTrackRow}
         sync={sync}
      />
   )
}

const TrackRow: RenderRow<DetailedTrackFragment> = ({ row, virtual }) => {
   const trackId = row.original.id
   const albumId = row.original.album?.id ?? ''
   const styles = useTrackColor(trackId)
   const { playAlbumOffset, isLoading } = usePlayMutation({
      onError: () => toast.error('Failed to play track.'),
   })

   const onPlayTrack = () => {
      if (!isLoading) {
         playAlbumOffset(albumId, trackId)
      }
   }

   // Play on div double click.
   const trackRef = useRef() as React.MutableRefObject<HTMLTableRowElement | null>
   useDoubleClick({ ref: trackRef, onDoubleClick: onPlayTrack })

   const setContextMenu = useSetTrackContextMenu()
   const showContextMenu = () => setContextMenu({ trackId })

   const simulateRightClick = useSimulateRightClick()
   const optionsRef = useRef<HTMLButtonElement>(null)
   const onMenuClick = () => simulateRightClick(trackRef, optionsRef)
   return (
      <tr
         key={row.id}
         data-index={virtual.index}
         ref={ref => {
            trackRef.current = ref
         }}
         className={cn('group max-w-full select-none border-b', styles)}
         onContextMenu={showContextMenu}
      >
         {row.getVisibleCells().map(cell => flexRender(cell.column.columnDef.cell, cell.getContext()))}
         <TableCell id='context'>
            <button onClick={onMenuClick} ref={optionsRef} className='h-5 w-5 cursor-pointer'>
               <EllipsisVerticalIcon className='hidden group-hover:inline-block' />
            </button>
         </TableCell>
      </tr>
   )
}
const MemoTrackRow = memo(TrackRow, (prev, next) => prev.row.id === next.row.id)

const makeColumns = (reviewId: string): ColumnDef<DetailedTrackFragment>[] => [
   {
      id: 'Title',
      header: ({ header, column }) => {
         const { onClick, icon } = useSortOnClick(column)
         return (
            <TableHead id={header.id}>
               <Button variant='ghost' onClick={onClick}>
                  Title
                  {icon}
               </Button>
            </TableHead>
         )
      },
      accessorFn: row => row.name,
      cell: ({ row, cell }) => {
         const track = row.original
         const artistNames = track.artists?.map(a => a.name).join(', ')
         return (
            <TableCell key={cell.id}>
               <div className='flex w-40 min-w-0 flex-col pl-1'>
                  <div className='select-none truncate p-0.5 text-sm md:text-base'> {track.name} </div>
                  <div className='select-none truncate p-0.5 text-xs font-light md:text-sm'> {artistNames ?? ''} </div>
               </div>
            </TableCell>
         )
      },
   },
   {
      id: 'Duration',
      header: row => (
         <TableHead id={row.header.id} className='hidden md:table-cell'>
            Duration
         </TableHead>
      ),
      cell: ({ row, cell }) => {
         const track = row.original
         const { minutes, seconds } = msToTimeStr(track.durationMs)
         return <TableCell key={cell.id} className='hidden md:table-cell'>{`${minutes}:${seconds}`}</TableCell>
      },
   },
   {
      id: 'Popularity',
      header: row => (
         <TableHead id={row.header.id} className='hidden md:table-cell'>
            Popularity
         </TableHead>
      ),
      cell: ({ row, cell }) => {
         const popularity = row.original.popularity
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
            <TableCell key={cell.id} className='hidden md:table-cell'>
               <div className='flex flex-row items-center space-x-0.5'>
                  <div>{popularity}</div>
                  <FireIcon className={cn('h-6 w-6', color)} />
               </div>
            </TableCell>
         )
      },
   },
   {
      id: 'Like Button',
      header: row => <TableHead id={row.header.id}></TableHead>,
      cell: ({ row, cell }) => {
         const trackId = row.original.id
         const svgStyle = useCallback((isLiked: boolean | undefined) => useLikeSvgStyle(trackId)(isLiked), [trackId])

         return (
            <TableCell key={cell.id}>
               <LikeButton trackId={trackId} svgStyle={svgStyle} />
            </TableCell>
         )
      },
   },
   {
      id: 'Comment Button',
      header: row => <TableHead id={row.header.id}></TableHead>,
      cell: ({ row, cell }) => {
         const data = useReviewOverviewAtom(reviewId)
         const userId = useCurrentUserId()

         const canComment =
            data?.review?.creator?.id === userId ||
            data?.review?.collaborators?.filter(c => c.accessLevel === 'Collaborator').some(c => c.user.id === userId)

         const showCommentModal = useCommentModalTrack(reviewId, row.original.id)
         if (canComment) {
            return (
               <TableCell key={cell.id}>
                  <Button variant='ghost' size='square' onClick={showCommentModal} className='transition-none'>
                     <ChatBubbleLeftIcon className='h-5 w-5' />
                  </Button>
               </TableCell>
            )
         } else {
            return null
         }
      },
   },

   // Add fake row so that the options button is aligned with the other rows.
   {
      id: 'Options',
      header: row => <TableHead id={row.header.id}></TableHead>,
      cell: () => null,
   },
]
