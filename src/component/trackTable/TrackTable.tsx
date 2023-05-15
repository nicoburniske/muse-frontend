import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, useCallback, useRef, useState } from 'react'

import { UserAvatar } from '@/component/avatar/UserAvatar'
import { TrackContextMenuContent, useSetTrackContextMenu } from '@/component/track/TrackContextMenu'
import { DetailedPlaylistTrackFragment } from '@/graphql/generated/schema'
import { ContextMenu, ContextMenuTrigger } from '@/lib/component/ContextMenu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/component/Table'
import { cn, userDisplayNameOrId } from '@/util/Utils'

export const TrackTable = ({ tracks }: { tracks: DetailedPlaylistTrackFragment[] }) => {
   const parentRef = useRef<HTMLDivElement>(null)

   const rowVirtualizer = useVirtualizer({
      overscan: 20,
      count: tracks.length,
      estimateSize: () => 60,
      getScrollElement: () => parentRef.current,
      // scrollToFn,
   })

   const [data] = useState(() => tracks)

   const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getRowId: row => row.track.id + row.addedAt + row.addedBy.id,
   })
   const { rows } = table.getRowModel()
   const virtualRows = rowVirtualizer.getVirtualItems()
   const totalSize = rowVirtualizer.getTotalSize()

   const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
   const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0

   return (
      <ContextMenu>
         <ContextMenuTrigger asChild>
            <div ref={parentRef} className='muse-scrollbar h-full w-full '>
               <div
                  className='muse-tracks w-full'
                  style={{
                     height: `${totalSize}px`,
                  }}
               >
                  <Table>
                     <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                           <TableRow key={headerGroup.id}>
                              {headerGroup.headers.map(header => {
                                 const headerRendered = header.column.columnDef.header
                                 if (headerRendered) {
                                    return flexRender(header.column.columnDef.header, header.getContext())
                                 }
                                 return null
                              })}
                           </TableRow>
                        ))}
                     </TableHeader>
                     <TableBody>
                        {paddingTop > 0 && (
                           <tr>
                              <td style={{ height: `${paddingTop}px` }} />
                           </tr>
                        )}
                        {virtualRows.map(virtualRow => {
                           const row = rows[virtualRow.index] as Row<DetailedPlaylistTrackFragment>
                           return (
                              <MemoTrackRow
                                 key={row.id}
                                 row={row}
                                 index={virtualRow.index}
                                 measureElement={rowVirtualizer.measureElement}
                              />
                           )
                        })}
                        {paddingBottom > 0 && (
                           <tr>
                              <td style={{ height: `${paddingBottom}px` }} />
                           </tr>
                        )}
                     </TableBody>
                  </Table>
               </div>
            </div>
         </ContextMenuTrigger>

         <TrackContextMenuContent />
      </ContextMenu>
   )
}

import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import * as dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar'
import toast from 'react-hot-toast'

import { LikeButton } from '@/component/LikeButton'
import { usePlayMutation } from '@/component/sdk/ClientHooks'
import { useSimulateRightClick } from '@/component/track/useSimulateRightClick'
import { useLikeSvgStyle, useTrackColor } from '@/component/track/useSyncedStyles'
import useDoubleClick from '@/lib/hook/useDoubleClick'

dayjs.extend(calendar)

type TrackRowProps = {
   row: Row<DetailedPlaylistTrackFragment>
   index: number
   measureElement: (element: HTMLElement | null) => void
}
const TrackRow = ({ row, index, measureElement }: TrackRowProps) => {
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
         data-index={index}
         ref={ref => {
            trackRef.current = ref
            measureElement(ref)
         }}
         className={cn('max-w-full select-none border-b', styles)}
         onContextMenu={showContextMenu}
      >
         {row.getVisibleCells().map(cell => flexRender(cell.column.columnDef.cell, cell.getContext()))}
         <TableCell id='context'>
            <button onClick={onMenuClick} ref={optionsRef}>
               <EllipsisVerticalIcon className='h-5 w-5 cursor-pointer' />
            </button>
         </TableCell>
      </tr>
   )
}
const MemoTrackRow = memo(TrackRow, (prev, next) => prev.row.id === next.row.id)

const columns: ColumnDef<DetailedPlaylistTrackFragment>[] = [
   {
      id: 'Image',
      header: row => <TableHead id={row.header.id}></TableHead>,
      cell: ({ row, cell }) => {
         // Sorted biggest to smallest.
         const albumImage = row.original.track.album?.images?.at(-1)
         return (
            <TableCell key={cell.id} className='flex-none p-0 pl-1'>
               <div className='h-14 w-14'>
                  <img src={albumImage} alt='AlbumImage' />
               </div>
            </TableCell>
         )
      },
   },
   {
      id: 'Title',
      header: row => <TableHead id={row.header.id}>Title</TableHead>,
      cell: ({ row, cell }) => {
         const track = row.original.track
         const artistNames = track.artists?.map(a => a.name).join(', ')
         return (
            <TableCell key={cell.id}>
               <div className='flex w-52 min-w-0 flex-col pl-1 lg:w-64'>
                  <div className='select-none truncate p-0.5 text-sm md:text-base'> {track.name} </div>
                  <div className='select-none truncate p-0.5 text-xs font-light md:text-sm'> {artistNames ?? ''} </div>
               </div>
            </TableCell>
         )
      },
   },
   {
      id: 'Album',
      header: row => <TableHead id={row.header.id}>Album</TableHead>,
      cell: ({ row, cell }) => (
         <TableCell key={cell.id} className='line-clamp-2 hidden w-40 sm:table-cell'>
            {row.original.track.album?.name}
         </TableCell>
      ),
   },
   {
      id: 'Added By',
      header: row => (
         <TableHead id={row.header.id} className='hidden sm:table-cell'>
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
            <TableCell key={cell.id} className='hidden sm:table-cell'>
               <UserAvatar image={image} name={name} />
            </TableCell>
         )
      },
   },
   {
      id: 'Added At',
      header: row => (
         <TableHead id={row.header.id} className='hidden sm:table-cell'>
            Added At
         </TableHead>
      ),
      cell: ({ row, cell }) => (
         <TableCell key={cell.id} className='hidden sm:table-cell'>
            {dayjs().calendar(dayjs(row.original.addedAt))}
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
   // Add fake row so that the options button is aligned with the other rows.
   {
      id: 'Options',
      header: row => <TableHead id={row.header.id}></TableHead>,
      cell: () => null,
   },
]
