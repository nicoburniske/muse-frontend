import { ChatBubbleLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { ColumnDef, flexRender } from '@tanstack/react-table'
import { memo, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

import { UserAvatar } from '@/component/avatar/UserAvatar'
import { LikeButton } from '@/component/LikeButton'
import { usePlayMutation } from '@/component/sdk/ClientHooks'
import { useSetTrackContextMenu } from '@/component/track/TrackContextMenu'
import { useCommentModalTrack } from '@/component/track/useCommentModalTrack'
import { useSimulateRightClick } from '@/component/track/useSimulateRightClick'
import { useLikeSvgStyle, useTrackColor } from '@/component/track/useSyncedStyles'
import { DetailedPlaylistTrackFragment } from '@/graphql/generated/schema'
import { Button } from '@/lib/component/Button'
import { TableCell, TableHead } from '@/lib/component/Table'
import useDoubleClick from '@/lib/hook/useDoubleClick'
import { useCurrentUserId } from '@/state/CurrentUser'
import { useReviewOverviewAtom } from '@/state/useReviewOverviewAtom'
import { cn, userDisplayNameOrId } from '@/util/Utils'

import { useScrollToSelectedSingle, useSortOnClick, useSyncNowPlaying } from './TableHooks'
import { RenderRow, TrackTableAbstract } from './TrackTableAbstract'

export type PlaylistTrackTableProps = {
   reviewId: string
   tracks: DetailedPlaylistTrackFragment[]
}

export const PlaylistTrackTable = ({ reviewId, tracks }: PlaylistTrackTableProps) => {
   const columns = makeColumns(reviewId)

   const getRowId = useCallback(
      (track: DetailedPlaylistTrackFragment) => track.track.id + track.addedAt + track.addedBy.id,
      []
   )
   const getTrackId = useCallback((track: DetailedPlaylistTrackFragment) => track.track.id, [])

   const sync = useScrollToSelectedSingle(tracks, getTrackId, getRowId)

   useSyncNowPlaying(tracks.map(t => t.track.id))

   return (
      <TrackTableAbstract columns={columns} data={tracks} getRowId={getRowId} renderRow={MemoTrackRow} sync={sync} />
   )
}

export const PlaylistTrackTableViewOnly = ({ tracks }: { tracks: DetailedPlaylistTrackFragment[] }) => {
   const getRowId = useCallback(
      (track: DetailedPlaylistTrackFragment) => track.track.id + track.addedAt + track.addedBy.id,
      []
   )
   const getTrackId = useCallback((track: DetailedPlaylistTrackFragment) => track.track.id, [])

   const sync = useScrollToSelectedSingle(tracks, getTrackId, getRowId)

   useSyncNowPlaying(tracks.map(t => t.track.id))

   return (
      <TrackTableAbstract
         columns={commonColumns}
         data={tracks}
         getRowId={getRowId}
         renderRow={MemoTrackRow}
         sync={sync}
      />
   )
}

const TrackRow: RenderRow<DetailedPlaylistTrackFragment> = ({ row, virtual, measureElement }) => {
   const trackId = row.original.track.id
   const playlistId = row.original.playlist.id
   const styles = useTrackColor(trackId)
   const { playPlaylistOffset, isLoading } = usePlayMutation({
      onError: () => toast.error('Failed to play track.'),
   })

   const onPlayTrack = () => {
      if (!isLoading) {
         playPlaylistOffset(playlistId, trackId)
      }
   }

   // Play on div double click.
   const trackRef = useRef() as React.MutableRefObject<HTMLTableRowElement | null>
   useDoubleClick({ ref: trackRef, onDoubleClick: onPlayTrack })

   const setContextMenu = useSetTrackContextMenu()
   const showContextMenu = () => setContextMenu({ trackId, playlistId })

   const simulateRightClick = useSimulateRightClick()
   const optionsRef = useRef<HTMLButtonElement>(null)
   const onMenuClick = () => simulateRightClick(trackRef, optionsRef)
   return (
      <tr
         key={row.id}
         data-index={virtual.index}
         ref={ref => {
            trackRef.current = ref
            measureElement(ref)
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

const commonColumns: ColumnDef<DetailedPlaylistTrackFragment>[] = [
   {
      id: 'Image',
      header: row => <TableHead id={row.header.id}></TableHead>,
      cell: ({ row, cell }) => {
         // Sorted biggest to smallest.
         const albumImage = row.original.track.album?.images?.at(-1)
         return (
            <TableCell key={cell.id} className='flex-none p-0 pl-1'>
               <div className='h-12 w-12'>
                  <img src={albumImage} alt='AlbumImage' />
               </div>
            </TableCell>
         )
      },
   },
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
      accessorFn: row => row.track.name,
      cell: ({ row, cell }) => {
         const track = row.original.track
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
      id: 'Album',
      header: row => (
         <TableHead id={row.header.id} className='hidden xl:table-cell'>
            Album
         </TableHead>
      ),
      cell: ({ row, cell }) => (
         <TableCell key={cell.id} className='line-clamp-2 hidden w-40 xl:table-cell'>
            <div className='line-clamp-2'>{row.original.track.album?.name}</div>
         </TableCell>
      ),
   },
   {
      id: 'Added By',
      header: row => (
         <TableHead id={row.header.id} className='hidden 2xl:table-cell'>
            Added By
         </TableHead>
      ),
      cell: ({ row, cell }) => {
         const track = row.original
         const user = track.addedBy
         const images = user?.spotifyProfile?.images
         const image = images?.at(1) ?? images?.at(0)
         const name = userDisplayNameOrId(user)

         return (
            <TableCell key={cell.id} className='hidden truncate 2xl:table-cell'>
               <UserAvatar image={image} name={name} />
            </TableCell>
         )
      },
   },
   {
      id: 'Added At',
      header: ({ header, column }) => {
         const { onClick, icon } = useSortOnClick(column)
         return (
            <TableHead id={header.id} className='hidden truncate xl:table-cell'>
               <Button variant='ghost' onClick={onClick}>
                  Added At
                  {icon}
               </Button>
            </TableHead>
         )
      },
      accessorFn: row => new Date(row.addedAt).getTime(),
      cell: ({ row, cell }) => (
         <TableCell key={cell.id} className='hidden xl:table-cell'>
            {new Date(row.original.addedAt).toLocaleDateString()}
         </TableCell>
      ),
   },
   {
      id: 'Like Button',
      header: row => <TableHead id={row.header.id}></TableHead>,
      cell: ({ row, cell }) => {
         const trackId = row.original.track.id
         const svgStyle = useCallback((isLiked: boolean | undefined) => useLikeSvgStyle(trackId)(isLiked), [trackId])

         return (
            <TableCell key={cell.id}>
               <LikeButton trackId={trackId} svgStyle={svgStyle} />
            </TableCell>
         )
      },
   },
   {
      id: 'Options',
      header: row => <TableHead id={row.header.id}></TableHead>,
      cell: () => null,
   },
]

const makeColumns = (reviewId: string): ColumnDef<DetailedPlaylistTrackFragment>[] => {
   const commentColumn: ColumnDef<DetailedPlaylistTrackFragment> = {
      id: 'Comment Button',
      header: row => <TableHead id={row.header.id}></TableHead>,
      cell: ({ row, cell }) => {
         const showCommentModal = useCommentModalTrack(reviewId, row.original.track.id)
         const data = useReviewOverviewAtom(reviewId)
         const userId = useCurrentUserId()

         const canComment =
            data?.review?.creator?.id === userId ||
            data?.review?.collaborators?.filter(c => c.accessLevel === 'Collaborator').some(c => c.user.id === userId)
         if (canComment) {
            return (
               <TableCell key={cell.id}>
                  <Button variant='ghost' size='square' onClick={showCommentModal}>
                     <ChatBubbleLeftIcon className='h-5 w-5' />
                  </Button>
               </TableCell>
            )
         } else {
            return null
         }
      },
   }

   const newColumns = [...commonColumns]
   newColumns.splice(newColumns.length - 1, 0, commentColumn)
   return newColumns
}
