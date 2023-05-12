import { defaultRangeExtractor, Range, useVirtualizer, VirtualItem } from '@tanstack/react-virtual'
import { atom, useAtom, useSetAtom } from 'jotai'
import { CSSProperties, useCallback, useEffect, useRef } from 'react'

import { TrackContextMenuContent } from '@/component/track/TrackContextMenu'
import { ContextMenu, ContextMenuTrigger } from '@/lib/component/ContextMenu'
import { useDerivedAtomValue } from '@/lib/hook/useDerivedAtomValue'
import useEffectDeepEqual from '@/lib/hook/useEffectDeepEqual'
import useSyncAtoms from '@/lib/hook/useSyncAtoms'
import { useTransientAtom } from '@/lib/hook/useTransientAtom'
import { nowPlayingEnabledAtom, nowPlayingTrackAtom } from '@/state/NowPlayingAtom'
import { usePrefetchLikes } from '@/state/useTrackLikeQuery'

import { Group } from './Helpers'
import {
   expandedGroupsAtom,
   headerIndicesAtom,
   indexToJsxAtom,
   indexToSizeAtom,
   reviewOrderAtom,
   rootReviewIdAtom,
   setResultsAtom,
   tracksAtom,
} from './TableAtoms'
import { useKeepMountedRangeExtractor, useScrollToSelected, useSmoothScroll } from './TableHooks'

interface GroupedTrackTableProps {
   rootReview: string
   results: Group[]
}

const trackIdsAtom = atom(get => get(tracksAtom).map(t => t.id))
const uniqueTrackIdsAtom = atom(get => new Set(get(trackIdsAtom)))
const nowPlayingEnabledAtomLocal = atom(get => {
   const trackId = get(nowPlayingTrackAtom)?.trackId
   const allTracks = get(uniqueTrackIdsAtom)
   return trackId !== undefined && allTracks.has(trackId)
})

export const GroupedTrackTableWrapper = ({ rootReview, results }: GroupedTrackTableProps) => {
   const [trackIds] = useTransientAtom(trackIdsAtom)
   usePrefetchLikes(trackIds())
   // Ensure that seeking for now playing works properly.
   useSyncAtoms(nowPlayingEnabledAtom, nowPlayingEnabledAtomLocal)

   // useAtom is intentional so we trigger a re-render when the rootReviewId changes.
   const [, setRootReviewId] = useAtom(rootReviewIdAtom)
   useEffect(() => {
      setRootReviewId(rootReview)
   }, [rootReview, setRootReviewId])

   const setResults = useSetAtom(setResultsAtom)
   useEffectDeepEqual(() => {
      setResults(results)
      return () => setResults([])
   }, [results, setResults])

   return <GroupedTrackTable />
}

/**
 * COMPONENT
 */
export const GroupedTrackTable = () => {
   const parentRef = useRef<HTMLDivElement>(null)

   const [getHeaderIndices] = useTransientAtom(headerIndicesAtom)

   const activeStickyIndexRef = useRef<number>()
   const isActiveSticky = useCallback((index: number) => activeStickyIndexRef.current === index, [])
   const isSticky = useCallback((index: number) => getHeaderIndices().includes(index), [getHeaderIndices])

   //Incorporate sticky headers into the range extractor.
   //There can be no headers so we account for undefined.
   const rangeExtractor = useCallback(
      (range: Range) => {
         const newActiveSticky = getHeaderIndices().find(index => range.startIndex >= index)
         activeStickyIndexRef.current = newActiveSticky
         if (newActiveSticky !== undefined) {
            const next = new Set([newActiveSticky, ...defaultRangeExtractor(range)])
            const sorted = [...next].sort((a, b) => a - b)
            return sorted
         } else {
            return defaultRangeExtractor(range)
         }
      },
      [getHeaderIndices]
   )

   const scrollToFn = useSmoothScroll(parentRef)
   const [getIndexToSize] = useTransientAtom(indexToSizeAtom)
   const rowVirtualizer = useVirtualizer({
      overscan: 40,
      count: getIndexToSize().length,
      estimateSize: index => getIndexToSize()[index],
      getScrollElement: () => parentRef.current,
      scrollToFn,
      rangeExtractor,
   })

   // Ensure new sizes are measured on re-order.
   // Derived atom ensures that values must be different for re-render.
   const order = useDerivedAtomValue(get => get(reviewOrderAtom).join(','), [])

   useEffect(() => {
      rowVirtualizer.measure()
   }, [order, rowVirtualizer])

   // To account for tracks being added, removed, or re-ordered.
   useDerivedAtomValue(
      get =>
         get(tracksAtom)
            .map(t => t.id)
            .join(''),
      []
   )

   useScrollToSelected(rowVirtualizer)

   const indexToStyle = useCallback(
      (virtualRow: VirtualItem) => {
         return {
            ...(isSticky(virtualRow.index) ? { zIndex: 1 } : {}),
            ...(isActiveSticky(virtualRow.index)
               ? {
                    position: 'sticky',
                 }
               : {
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`,
                 }),
            top: 0,
            left: 0,
            width: '100%',
            ...(isSticky(virtualRow.index) ? {} : { height: `${virtualRow.size}px` }),
         }
      },
      [isSticky, isActiveSticky]
   )

   const [getRows] = useTransientAtom(indexToJsxAtom)
   const rows = getRows()
   return (
      <ContextMenu>
         <ContextMenuTrigger asChild>
            {/* <MuseTransition option={'Simple'} as={Fragment} duration='duration-300'> */}
            <div ref={parentRef} className='muse-scrollbar w-full overflow-y-auto'>
               <div
                  className='muse-tracks relative w-full'
                  style={{
                     height: `${rowVirtualizer.getTotalSize()}px`,
                  }}
               >
                  {rowVirtualizer
                     .getVirtualItems()
                     .filter(Boolean)
                     .map(virtualRow => {
                        return (
                           <div key={virtualRow.index} style={indexToStyle(virtualRow) as CSSProperties}>
                              {rows[virtualRow.index]}
                           </div>
                        )
                     })}
               </div>
            </div>
            {/* </MuseTransition> */}
         </ContextMenuTrigger>
         <TrackContextMenuContent />
      </ContextMenu>
   )
}
