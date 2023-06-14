import { defaultRangeExtractor, elementScroll, Range, Virtualizer, VirtualizerOptions } from '@tanstack/virtual-core'
import { atom, useSetAtom } from 'jotai'
import { MutableRefObject, RefObject, useCallback, useEffect, useRef } from 'react'

import { useDerivedAtomValue } from '@/lib/hook/useDerivedAtomValue'
import { selectedTrackAtom } from '@/state/SelectedTrackAtom'

import { getTrack } from './Helpers'
import { expandedGroupsAtom, groupWithTracksAtom } from './TableAtoms'
import { Column } from '@tanstack/react-table'
import { ArrowDownIcon, ArrowsUpDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)

export const useSmoothScroll = (parentRef: RefObject<HTMLDivElement>) => {
   const scrollingRef = useRef<number>()
   const scrollToFn: VirtualizerOptions<any, any>['scrollToFn'] = useCallback(
      (offset, canSmooth, instance) => {
         const duration = 1000
         const start = parentRef!.current!.scrollTop
         const startTime = (scrollingRef.current = Date.now())

         const run = () => {
            if (scrollingRef.current !== startTime) return
            const now = Date.now()
            const elapsed = now - startTime
            const progress = easeInOutCubic(Math.min(elapsed / duration, 1))
            const interpolated = start + (offset - start) * progress

            if (elapsed < duration) {
               elementScroll(interpolated, canSmooth, instance)
               requestAnimationFrame(run)
            } else {
               elementScroll(interpolated, canSmooth, instance)
            }
         }

         requestAnimationFrame(run)
      },
      [parentRef, scrollingRef]
   )
   return scrollToFn
}

// Keeps rows mounted in virtualizer so that they don't have to re-render.
export const useKeepMountedRangeExtractor = () => {
   const mounted = useRef(new Set<number>())

   const rangeExtractor = useCallback(
      (range: Range) => {
         const newRange = [...mounted.current, ...defaultRangeExtractor(range)]
         mounted.current = new Set(newRange)
         return newRange
      },
      [mounted]
   )

   return [mounted, rangeExtractor] as [MutableRefObject<Set<number>>, (range: Range) => number[]]
}

export const useKeepMountedRangeExtractorSorted = () => {
   const mounted = useRef(new Set<number>())

   const rangeExtractor = useCallback(
      (range: Range) => {
         const newRange = [...mounted.current, ...defaultRangeExtractor(range)]
         const asSet = new Set(newRange)
         mounted.current = asSet
         return [...asSet].sort((a, b) => a - b)
      },
      [mounted]
   )

   return rangeExtractor as (range: Range) => number[]
}

// ReviewId => TrackId => Index
const trackIndexAtom = atom<Map<string, Map<string, number>>>(get => {
   const expandedGroups = get(expandedGroupsAtom)
   const groups = get(groupWithTracksAtom)
   const trackIndex = new Map<string, Map<string, number>>()
   let sum = 0
   for (let i = 0; i < groups.length; i++) {
      // Account for the header.
      sum += 1
      const {
         overview: { reviewId },
         tracks,
      } = groups[i]
      if (expandedGroups.includes(reviewId)) {
         const trackMap = new Map<string, number>()
         for (let j = 0; j < tracks.length; j++) {
            trackMap.set(getTrack(tracks[j]).id, sum + j)
         }
         trackIndex.set(reviewId, trackMap)
         sum += tracks.length
      }
   }
   return trackIndex
})

export const useScrollToSelected = (virtualizer: Virtualizer<any, any>) => {
   /**
    * Open group header if not already open.
    */
   const groupToExpand = useDerivedAtomValue(get => {
      const selectedTrack = get(selectedTrackAtom)

      if (selectedTrack !== undefined && !get(expandedGroupsAtom).includes(selectedTrack.reviewId)) {
         return selectedTrack.reviewId
      }
   }, [])

   const setExpandedGroups = useSetAtom(expandedGroupsAtom)
   useEffect(() => {
      if (groupToExpand !== undefined) {
         setExpandedGroups(currentGroups => [...currentGroups, groupToExpand!])
      }
   }, [groupToExpand])

   /**
    * Scroll to selected.
    */
   const selectedIndex = useDerivedAtomValue(get => {
      const selectedTrack = get(selectedTrackAtom)
      if (selectedTrack === undefined) {
         return undefined
      }

      const trackIndex = get(trackIndexAtom)

      return trackIndex.get(selectedTrack.reviewId)?.get(selectedTrack.trackId)
   }, [])

   useEffect(() => {
      if (selectedIndex !== undefined) {
         virtualizer.scrollToIndex(selectedIndex, { align: 'center' })
      }
   }, [selectedIndex])
}

export const useSortOnClick = (column: Column<any, any>) => {
   const onClick = () => {
      const sort = column.getIsSorted()
      if (sort === 'asc') {
         column.clearSorting()
      } else if (sort === 'desc') {
         column.toggleSorting(false)
      } else {
         column.toggleSorting(true)
      }
   }
   const icon = (() => {
      const sort = column.getIsSorted()
      if (sort === 'asc') {
         return <ArrowUpIcon className='ml-2 h-4 w-4' />
      } else if (sort === 'desc') {
         return <ArrowDownIcon className='ml-2 h-4 w-4' />
      } else {
         return <ArrowsUpDownIcon className='ml-2 h-4 w-4' />
      }
   })()
   return { onClick, icon }
}