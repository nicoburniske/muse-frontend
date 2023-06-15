import {
   ColumnDef,
   CoreOptions,
   flexRender,
   getCoreRowModel,
   getSortedRowModel,
   Row,
   SortingState,
   Table as TanTable,
   useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'

import { TrackContextMenuContent } from '@/component/track/TrackContextMenu'
import { ContextMenu, ContextMenuTrigger } from '@/lib/component/ContextMenu'
import { Table, TableBody, TableHeader, TableRow } from '@/lib/component/Table'

export type TrackTableAbstractProps<T> = {
   columns: ColumnDef<T>[]
   data: T[]
   getRowId: CoreOptions<T>['getRowId']
   renderRow: RenderRow<T>

   sync: (virtualizer: Virtualizer<any, Element>, table: TanTable<T>) => void
}

export type RenderRow<T> = React.ComponentType<{
   row: Row<T>
   virtual: VirtualItem
}>

export const TrackTableAbstract = <T,>(props: TrackTableAbstractProps<T>) => {
   const { columns, data: dataProp, getRowId, sync } = props
   const [data] = useState(() => dataProp)
   const [sorting, setSorting] = useState<SortingState>([])

   const parentRef = useRef<HTMLDivElement>(null)

   const rowVirtualizer = useVirtualizer({
      overscan: 20,
      count: data.length,
      estimateSize: () => 60,
      getScrollElement: () => parentRef.current,
   })

   const table = useReactTable<T>({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getRowId,
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      state: {
         sorting,
      },
   })

   useEffect(() => {
      sync(rowVirtualizer, table)
   }, [sync, rowVirtualizer, table])

   const { rows } = table.getRowModel()
   const virtualRows = rowVirtualizer.getVirtualItems()
   const totalSize = rowVirtualizer.getTotalSize()

   const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
   const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0

   return (
      <ContextMenu>
         <ContextMenuTrigger asChild>
            <div
               ref={parentRef}
               className='muse-scrollbar h-full w-full overflow-y-auto overscroll-none animate-in fade-in duration-300'
            >
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
                        {virtualRows.map(virtual => {
                           const row = rows[virtual.index]
                           return <props.renderRow key={row.id + virtual.index} row={row} virtual={virtual} />
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
