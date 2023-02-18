import { CSSProperties, useMemo, useRef, useCallback, useEffect, Fragment } from 'react'
import { useVirtualizer, Range, VirtualItem } from '@tanstack/react-virtual'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useTransientAtom } from 'platform/hook/useTransientAtom'
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
import useSyncAtoms from 'platform/hook/useSyncAtoms'
import { nowPlayingEnabledAtom, nowPlayingTrackAtom } from 'state/NowPlayingAtom'
import { usePrefetchLikes } from 'state/useTrackLikeQuery'
import useEffectDeepEqual from 'platform/hook/useEffectDeepEqual'
import { MuseTransition } from 'platform/component/MuseTransition'
import { useDerivedAtomValue } from 'platform/hook/useDerivedAtomValue'

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

   // Keep all previously rendered tracks mounted for performance.
   const [mountedRef, keepMounted] = useKeepMountedRangeExtractor()

   // Reset mounted indices to avoid expensive mount.
   const expandedGroups = useDerivedAtomValue(get => get(expandedGroupsAtom).join(','), [])
   useEffect(() => {
      mountedRef.current = new Set()
      return () => {
         mountedRef.current = new Set()
      }
   }, [expandedGroups])

   //Incorporate sticky headers into the range extractor.
   //There can be no headers so we account for undefined.
   const rangeExtractor = useCallback(
      (range: Range) => {
         const newActiveSticky = getHeaderIndices().find(index => range.startIndex >= index)
         activeStickyIndexRef.current = newActiveSticky
         if (newActiveSticky !== undefined) {
            const next = new Set([newActiveSticky, ...keepMounted(range)])
            const sorted = [...next].sort((a, b) => a - b)
            return sorted
         } else {
            return [...new Set([...keepMounted(range)])]
         }
      },
      [getHeaderIndices]
   )

   const scrollToFn = useSmoothScroll(parentRef)
   const [getIndexToSize] = useTransientAtom(indexToSizeAtom)
   const rowVirtualizer = useVirtualizer({
      overscan: 20,
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
      <MuseTransition option={'Simple'} as={Fragment} duration='duration-300'>
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
      </MuseTransition>
   )
}
