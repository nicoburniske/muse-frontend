import React, { CSSProperties, useMemo, useRef, useCallback, useEffect, RefObject, memo } from 'react'
import { useVirtualizer, defaultRangeExtractor, Range, VirtualItem, VirtualizerOptions, elementScroll, Virtualizer } from '@tanstack/react-virtual'
import { ReviewOverview } from '../DetailedReview'
import { DetailedAlbumFragment, DetailedPlaylistFragment, DetailedTrackFragment, EntityType } from 'graphql/generated/schema'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { nonNullable, uniqueByProperty } from 'util/Utils'
import { useTransientAtom } from 'hook/useTransientAtom'
import { allReviewTracks, selectedTrackAtom } from 'state/Atoms'
import derivedAtomWithWrite from 'state/derivedAtomWithWrite'
import { getTrack, getTracks, GroupData, TrackRow } from './Helpers'
import { MemoTrack } from './MemoTrack'
import { ReviewGroupHeader } from './GroupHeader'

/**
 * ATOMS
 */

const rootReviewIdAtom = atom<string>('')
rootReviewIdAtom.debugLabel = 'rootReviewIdAtom'
const resultsAtom = atom<[DetailedPlaylistFragment | DetailedAlbumFragment, ReviewOverview][]>([])
resultsAtom.debugLabel = 'resultsAtom'

const expandedGroupsAtom = atom<string[]>([])
expandedGroupsAtom.debugLabel = 'expandedGroupsAtom'

type Group = { tracks: TrackRow[], overview: ReviewOverview }
const allGroupsAtom = atom<Group[]>(get => get(resultsAtom)
    .map(group => ({ tracks: getTracks(group[0]), overview: group[1] }))
    .filter(group => nonNullable(group.tracks))
)
allGroupsAtom.debugLabel = 'allGroupsAtom'

const tracksAtom = atom<DetailedTrackFragment[]>(get =>
    get(allGroupsAtom)
        .flatMap(g => g.tracks)
        .map(t => getTrack(t))
        .filter(nonNullable))
tracksAtom.debugLabel = 'tracksAtom'

const derivedUniqueTracksAtom = atom<DetailedTrackFragment[]>(get => uniqueByProperty(get(tracksAtom), t => t.id))
const uniqueTracksAtom = derivedAtomWithWrite(derivedUniqueTracksAtom)
uniqueTracksAtom.debugLabel = 'uniqueTracksAtom'

type GroupRendered = {
    reviewId: string
    header: SizedElement
    children: SizedElement[]
}

type SizedElement = {
    element: React.ReactNode
    size: number
}

const renderedGroupsAtom = atom<GroupRendered[]>(get => {
    const rootReviewId = get(rootReviewIdAtom)

    return get(allGroupsAtom).map(({ tracks, overview }) => {
        const header = {
            element:
                // TODO: Change Headers for ALBUMS!!!!
                <MemoHeader
                    {...overview}
                    parentReviewId={rootReviewId}
                />,
            size: 40
        }
        const { reviewId, entityId } = overview
        const children = tracks.map(t => ({
            element: (
                <MemoTrack
                    track={t}
                    reviewId={reviewId}
                    overviewId={entityId}
                    tracksAtom={uniqueTracksAtom} />),
            size: 60
        }))
        return { reviewId, header, children }
    })
})

const indexToJsxAtom = atom<React.ReactNode[]>(get => {
    const expandedGroups = get(expandedGroupsAtom)
    return get(renderedGroupsAtom).flatMap(({ reviewId, header, children }) => {
        if (expandedGroups.includes(reviewId)) {
            return [header.element, ...children.map(c => c.element)]
        } else {
            return [header.element]
        }
    })
})

const indexToSizeAtom = atom<number[]>(get => {
    const expandedGroups = get(expandedGroupsAtom)
    return get(renderedGroupsAtom).flatMap(({ reviewId, header, children }) => {
        if (expandedGroups.includes(reviewId)) {
            return [header.size, ...children.map((c) => c.size)]
        } else {
            return [header.size]
        }
    })
})

const headerIndicesAtom = atom<number[]>(get => {
    const expandedGroups = get(expandedGroupsAtom)
    const indices = new Array<number>()
    const groups = get(allGroupsAtom)

    let sum = 0
    for (let i = 0; i < groups.length; i++) {
        // Account for header.
        indices.push(sum)
        sum += 1
        // Skip Tracks.
        if (expandedGroups.includes(groups[i].overview.reviewId)) {
            sum += groups[i].tracks.length
        }
    }
    // Want reverse order because this is used for sticky headers.
    return indices.reverse()
})
headerIndicesAtom.debugLabel = 'headerIndicesAtom'

/**
 * COMPONENT
 */
interface GroupedTrackTableProps {
    rootReview: string,
    results: [GroupData, ReviewOverview][]
}
export const GroupedTrackTable = ({ results, rootReview }: GroupedTrackTableProps) => {
    const parentRef = useRef<HTMLDivElement>(null)

    const setResults = useSetResultsAtom()
    const setRootReview = useSetAtom(rootReviewIdAtom)
    useEffect(() => {
        setResults(results)
    }, [results])
    useEffect(() => {
        setRootReview(rootReview)
    }, [rootReview])

    const [headerIndices] = useTransientAtom(headerIndicesAtom)

    const activeStickyIndexRef = useRef(0)
    const isActiveSticky = useCallback((index: number) => activeStickyIndexRef.current === index, [])
    const isSticky = useCallback((index: number) => headerIndices().includes(index), [headerIndices])

    // Keep all previously rendered tracks mounted for performance. 
    const keepMounted = useKeepMountedRangeExtractor()
    //Incorporate sticky headers into the range extractor.
    const rangeExtractor = useCallback((range: Range) => {
        const newActiveSticky = headerIndices()
            .find((index) => range.startIndex >= index) ?? 0
        activeStickyIndexRef.current = newActiveSticky
        const next = new Set([
            newActiveSticky,
            ...keepMounted(range)
        ])
        const sorted = [...next].sort((a, b) => a - b)
        return sorted
    }, [headerIndices])

    const scrollToFn = useSmoothScroll(parentRef)
    // True is track. False is Group header.
    const [indexToSize] = useTransientAtom(indexToSizeAtom)
    const rowVirtualizer = useVirtualizer({
        overscan: 20,
        count: indexToSize().length,
        estimateSize: (index) => indexToSize()[index],
        getScrollElement: () => parentRef.current,
        scrollToFn,
        rangeExtractor
    })
    // This is to force a re-render when the expanded groups change.
    useAtom(expandedGroupsAtom)
    useScrollToSelected(rowVirtualizer)

    const indexToStyle = useCallback((virtualRow: VirtualItem) => {
        return {
            ...(isSticky(virtualRow.index)
                ? { zIndex: 1 }
                : {}),
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
    }, [isSticky, isActiveSticky])

    const [rows] = useTransientAtom(indexToJsxAtom)
    const currRows = rows()
    return (
        <div
            ref={parentRef}
            className="overflow-y-auto w-full"
        >
            <div
                className="w-full relative"
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                }}
            >
                {
                    rowVirtualizer.getVirtualItems().filter(Boolean).map((virtualRow) => {

                        // Consider a compound key.
                        return (
                            <div
                                key={virtualRow.index}
                                style={indexToStyle(virtualRow) as CSSProperties}>
                                {
                                    currRows[virtualRow.index]
                                }
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

const useSetResultsAtom = () => {
    const hasOpenedAtom = useMemo(() => atom(false), [])
    const allTrackIdsAtom = useMemo(() => atom(get => new Set<string>(get(tracksAtom).map(t => t.id))), [])

    const setResultsAtom = useMemo(() => atom(null, (get, set, results: [GroupData, ReviewOverview][]) => {
        set(resultsAtom, results)
        set(allReviewTracks, get(allTrackIdsAtom))
        const hasOpened = get(hasOpenedAtom)
        // On first load, expand the first group if it exists.
        if (!hasOpened && results.length > 0) {
            set(hasOpenedAtom, true)
            set(expandedGroupsAtom, [results[0][1].reviewId])
        }
    }), [])
    return useSetAtom(setResultsAtom)
}

const useSmoothScroll = (parentRef: RefObject<HTMLDivElement>) => {
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

const useKeepMountedRangeExtractor = () => {
    const renderedRef = useRef(new Set<number>())

    const rangeExtractor = useCallback((range: Range) => {
        const newRange = [
            ...renderedRef.current,
            ...defaultRangeExtractor(range)
        ]
        renderedRef.current = new Set(newRange)
        return newRange
    }, [])

    return rangeExtractor
}

// ReviewId => TrackId => Index
const trackIndexAtom = atom<Map<string, Map<string, number>>>(get => {
    const expandedGroups = get(expandedGroupsAtom)
    const groups = get(allGroupsAtom)
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

const useScrollToSelected = (virtualizer: Virtualizer<any, any>) => {
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

/**
 * Memoized header for a review group.
 * Includes collapse group function.
 */

type MemoHeaderProps = {
    reviewId: string
    parentReviewId: string
    reviewName: string
    entityName: string
    entityType: EntityType
}

const toggleExpandedGroupAtom = atom(null, (get, set, reviewId: string) => {
    // Clear selected track to avoid conflict with expanded group.
    set(selectedTrackAtom, undefined)
    const currentExpanded = get(expandedGroupsAtom)
    const exists = currentExpanded.includes(reviewId)
    if (exists) {
        const postRemove = currentExpanded.filter(group => group !== reviewId)
        set(expandedGroupsAtom, postRemove)
    } else {
        const postAdd = [...currentExpanded, reviewId]
        set(expandedGroupsAtom, postAdd)
    }
})

export const MemoHeader = memo((props: MemoHeaderProps) => {
    const isParent = props.parentReviewId === props.reviewId
    const toggleExpandedGroup = useSetAtom(toggleExpandedGroupAtom)
    const onClick = isParent ? () => { } : () => toggleExpandedGroup(props.reviewId)
    return (
        < ReviewGroupHeader
            {...props}
            onClick={onClick}
        />)
}, (prevProps, nextProps) =>
    prevProps.reviewId === nextProps.reviewId &&
    prevProps.parentReviewId === nextProps.parentReviewId
)


