import { TrackRow } from 'component/trackTable/Helpers'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ContextMenu, ContextMenuTrigger } from 'lib/component/ContextMenu'
import { useKeepMountedRangeExtractorSorted, useSmoothScroll } from 'component/trackTable/TableHooks'
import { TrackContextMenuContent } from 'component/track/TrackContextMenu'
import { EitherTrackMemo } from 'component/track/EitherTrack'
import { useRef } from 'react'

export const TrackTable = ({ tracks }: { tracks: TrackRow[] }) => {
   const parentRef = useRef<HTMLDivElement>(null)

   const scrollToFn = useSmoothScroll(parentRef)
   const rangeExtractor = useKeepMountedRangeExtractorSorted()

   const rowVirtualizer = useVirtualizer({
      overscan: 20,
      count: tracks.length,
      estimateSize: () => 60,
      getScrollElement: () => parentRef.current,
      scrollToFn,
      rangeExtractor,
   })

   return (
      <ContextMenu>
         <ContextMenuTrigger asChild>
            <div ref={parentRef} className='muse-scrollbar h-full w-full overflow-y-auto'>
               <div
                  className='muse-tracks relative w-full'
                  style={{
                     height: `${rowVirtualizer.getTotalSize()}px`,
                  }}
               >
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                     const index = virtualRow.index
                     return (
                        <div
                           key={virtualRow.index}
                           style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                           }}
                        >
                           <EitherTrackMemo reviewId={''} track={tracks[index]} index={index} />
                        </div>
                     )
                  })}
               </div>
            </div>
         </ContextMenuTrigger>

         <TrackContextMenuContent />
      </ContextMenu>
   )
}
