import { defaultRangeExtractor, elementScroll, Virtualizer, VirtualizerOptions, Range } from '@tanstack/virtual-core'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react'
import { selectedTrackAtom } from 'state/Atoms'
import { getTrack } from './Helpers'
import { groupWithTracksAtom, expandedGroupsAtom } from './TableAtoms'

export const useSmoothScroll = (parentRef: RefObject<HTMLDivElement>) => {
    const easeInOutQuint = useCallback((t: number) => {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
    }, [])
    const scrollingRef = useRef<number>()
    const scrollToFn: VirtualizerOptions<any, any>['scrollToFn'] =
        useCallback((offset, canSmooth, instance) => {
            const duration = 1000
            const start = parentRef!.current!.scrollTop
            const startTime = (scrollingRef.current = Date.now())

            const run = () => {
                if (scrollingRef.current !== startTime) return
                const now = Date.now()
                const elapsed = now - startTime
                const progress = easeInOutQuint(Math.min(elapsed / duration, 1))
                const interpolated = start + (offset - start) * progress

                if (elapsed < duration) {
                    elementScroll(interpolated, canSmooth, instance)
                    requestAnimationFrame(run)
                } else {
                    elementScroll(interpolated, canSmooth, instance)
                }
            }

            requestAnimationFrame(run)
        }, [])
    return scrollToFn
}

// Keeps rows mounted in virtualizer so that they don't have to re-render.
export const useKeepMountedRangeExtractor = () => {
    const mounted = useRef(new Set<number>())

    const rangeExtractor = useCallback((range: Range) => {
        const newRange = [
            ...mounted.current,
            ...defaultRangeExtractor(range)
        ]
        mounted.current = new Set(newRange)
        return newRange
    }, [])

    // Reset mounted indices to avoid expensive mount.
    const expandedGroups = useAtomValue(useMemo(() => atom(get => get(expandedGroupsAtom).join(',')), []))
    useEffect(() => {
        mounted.current = new Set()
        return () => { mounted.current = new Set() }
    }, [expandedGroups])

    return rangeExtractor
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
        const { overview: { reviewId }, tracks } = groups[i]
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
    const groupToExpandAtom = useMemo(() => atom(get => {
        const selectedTrack = get(selectedTrackAtom)

        if (selectedTrack !== undefined && !get(expandedGroupsAtom).includes(selectedTrack.reviewId)) {
            return selectedTrack.reviewId
        }
    }), [])

    const groupToExpand = useAtomValue(groupToExpandAtom)
    const setExpandedGroups = useSetAtom(expandedGroupsAtom)
    useEffect(() => {
        if (groupToExpand !== undefined) {
            setExpandedGroups(currentGroups => [...currentGroups, groupToExpand!])
        }
    }, [groupToExpand])

    /**
     * Scroll to selected.
     */
    const selectedIndexAtom = useMemo(() => atom(get => {
        const selectedTrack = get(selectedTrackAtom)
        if (selectedTrack === undefined) {
            return undefined
        }

        const trackIndex = get(trackIndexAtom)

        return trackIndex.get(selectedTrack.reviewId)?.get(selectedTrack.trackId)
    }), [])

    const selectedIndex = useAtomValue(selectedIndexAtom)
    useEffect(() => {
        if (selectedIndex !== undefined) {
            virtualizer.scrollToIndex(selectedIndex, { align: 'center' })
        }
    }, [selectedIndex])
}



