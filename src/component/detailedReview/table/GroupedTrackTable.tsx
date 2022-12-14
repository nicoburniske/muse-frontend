import { CSSProperties, useMemo, useRef, useCallback, useEffect, RefObject } from 'react'
import { useVirtualizer, defaultRangeExtractor, Range, VirtualItem, VirtualizerOptions, elementScroll, Virtualizer } from '@tanstack/react-virtual'
import { ReviewOverview } from '../DetailedReview'
import { DetailedAlbumFragment, DetailedPlaylistFragment, DetailedTrackFragment } from 'graphql/generated/schema'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { nonNullable, uniqueByProperty, zip } from 'util/Utils'
import { useTransientAtom } from 'hook/useTransientAtom'
import { allReviewTracks, selectedTrackAtom } from 'state/Atoms'
import derivedAtomWithWrite from 'state/derivedAtomWithWrite'
import { getTrack, getTrackId, getTracks, GroupData, TrackRow } from './Helpers'
import { MemoizedGroupHeader } from './GroupHeader'
import { MemoTrack } from './MemoTrack'


const resultsAtom = atom<[DetailedPlaylistFragment | DetailedAlbumFragment, ReviewOverview][]>([])
const expandedGroupsAtom = atom<string[]>([])
expandedGroupsAtom.debugLabel = 'expandedGroupsAtom'

type Group = { tracks: TrackRow[], overview: ReviewOverview }
const allGroupsAtom = atom<Group[]>(get => get(resultsAtom)
    .map(group => ({ tracks: getTracks(group[0]), overview: group[1] }))
    .filter(group => nonNullable(group.tracks))
)
allGroupsAtom.debugLabel = 'allGroupsAtom'

const validGroupsAtom = atom(get => get(allGroupsAtom).map(({ tracks, overview }) => {
    if (get(expandedGroupsAtom).includes(overview.reviewId)) {
        return { overview, tracks }
    } else {
        return { overview, tracks: [] }
    }
}))
validGroupsAtom.debugLabel = 'validGroupsAtom'

// Header is false, Track is true.
const rowsAtom = atom(get => {
    const expandedGroups = get(expandedGroupsAtom)
    return get(validGroupsAtom).reduce((acc, k) => {
        if (expandedGroups.includes(k.overview.reviewId)) {
            // Add the group header and all tracks. 
            return [...acc, false, ...k.tracks!.map(() => true)]
        } else {
            // Only add the header.
            return [...acc, false]
        }
    }, new Array<boolean>())
})
rowsAtom.debugLabel = 'rowsAtom'

/**
 * Cached values.
 */

//TODO: when there are multiple same tracks this will break.
const trackIdToEntityOverviewIdAtom = atom(get => new Map(
    get(validGroupsAtom)
        .map(g => ({ overview: g.overview.entityId, trackIds: g.tracks!.map(t => getTrackId(t)) }))
        .flatMap(({ overview, trackIds: tracks }) => tracks.map(t => ([t, overview])))))
trackIdToEntityOverviewIdAtom.debugLabel = 'trackIdToEntityOverviewAtom'

const trackIdToEntityOverviewTypeAtom = atom(get => new Map(
    get(validGroupsAtom)
        .map(g => ({ overview: g.overview.entityType, trackIds: g.tracks!.map(t => getTrackId(t)) }))
        .flatMap(({ overview, trackIds: tracks }) => tracks.map(t => ([t, overview])))))
trackIdToEntityOverviewTypeAtom.debugLabel = 'trackIdToEntityOverviewTypeAtom'

const trackIdToReviewIdAtom = atom(get => new Map(
    get(validGroupsAtom)
        .map(g => ({ reviewId: g.overview.reviewId, tracks: g.tracks!.map(t => getTrackId(t)) }))
        .flatMap(({ reviewId, tracks }) => tracks.map(t => ([t, reviewId])))))
trackIdToReviewIdAtom.debugLabel = 'trackIdToReviewIdAtom'

// Need to consider album types.
const indexToTrackAtom = atom(get => new Map(zip(
    get(rowsAtom).map((isTrack, i) => isTrack ? i : -1).filter(i => i !== -1),
    get(validGroupsAtom).flatMap(g => g.tracks!))))
indexToTrackAtom.debugLabel = 'indexToTrackAtom'

const indexToHeaderAtom = atom(get => new Map(zip(
    get(rowsAtom).map((isTrack, i) => !isTrack ? i : -1).filter(i => i !== -1),
    get(validGroupsAtom).map(g => g.overview))))
indexToHeaderAtom.debugLabel = 'indexToHeaderAtom'

const tracksAtom = atom<DetailedTrackFragment[]>(get =>
    get(allGroupsAtom)
        .flatMap(g => g.tracks)
        .map(t => getTrack(t))
        .filter(nonNullable))
tracksAtom.debugLabel = 'tracksAtom'

const derivedUniqueTracksAtom = atom<DetailedTrackFragment[]>(get => uniqueByProperty(get(tracksAtom), t => t.id))
const uniqueTracksAtom = derivedAtomWithWrite(derivedUniqueTracksAtom)
uniqueTracksAtom.debugLabel = 'uniqueTracksAtom'

const headerIndicesAtom = atom(get => get(rowsAtom).map((r, i) => r ? -1 : i).filter(i => i !== -1).reverse())
headerIndicesAtom.debugLabel = 'headerIndicesAtom'

interface GroupedTrackTableProps {
    rootReview: string,
    results: [GroupData, ReviewOverview][]
}
export const GroupedTrackTable = ({ results, rootReview }: GroupedTrackTableProps) => {
    const parentRef = useRef<HTMLDivElement>(null)

    const setResults = useSetResultsAtom()
    useEffect(() => {
        setResults(results)
    }, [results])

    const [headerIndices] = useTransientAtom(headerIndicesAtom)

    const activeStickyIndexRef = useRef(0)
    const isActiveSticky = useCallback((index: number) => activeStickyIndexRef.current === index, [])
    const isSticky = useCallback((index: number) => headerIndices().includes(index), [])

    // Keep all previously rendered tracks mounted for performance. 
    // Combining sticky headers + keepMounted.
    const keepMounted = useKeepMountedRangeExtractor()
    const rangeExtractor = useCallback((range: Range) => {
        activeStickyIndexRef.current = [...headerIndices()]
            .find((index) => range.startIndex >= index) ?? 0
        const next = new Set([
            activeStickyIndexRef.current,
            ...keepMounted(range)
        ])
        const sorted = [...next].sort((a, b) => a - b)
        return sorted
    }, [headerIndices])

    const scrollToFn = useSmoothScroll(parentRef)
    // True is track. False is Group header.
    const [rows] = useTransientAtom(rowsAtom)
    const rowVirtualizer = useVirtualizer({
        overscan: 20,
        count: rows().length,
        estimateSize: (index) => rows()[index] ? 60 : 40,
        getScrollElement: () => parentRef.current,
        scrollToFn,
        rangeExtractor
    })

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
    }, [])

    // Cache stuff for lookups.
    const [trackIdToEntityOverview] = useTransientAtom(trackIdToEntityOverviewIdAtom)
    const [trackIdToEntityOverviewType] = useTransientAtom(trackIdToEntityOverviewTypeAtom)
    const [trackIdToReviewId] = useTransientAtom(trackIdToReviewIdAtom)
    const [indexToTrack] = useTransientAtom(indexToTrackAtom)
    const [indexToHeader] = useTransientAtom(indexToHeaderAtom)

    /**
     * Toggle Expanded group on header click.
     */
    const [expandedGroups, setExpandedGroups] = useAtom(expandedGroupsAtom)
    const setSelectedTrack = useSetAtom(selectedTrackAtom)
    const toggleExpandedGroup = useCallback((reviewId: string) => {
        // Clear selected track to avoid conflict with expanded group.
        setSelectedTrack(undefined)
        const currentExpanded = expandedGroups
        const exists = currentExpanded.includes(reviewId)
        if (exists) {
            const postRemove = currentExpanded.filter(group => group !== reviewId)
            setExpandedGroups(postRemove)
        } else {
            const postAdd = [...currentExpanded, reviewId]
            setExpandedGroups(postAdd)
            const maybeHeaderIndex = headerIndices().find(i => {
                const header = indexToHeader().get(i)
                return nonNullable(header) ? header.reviewId === reviewId : false
            })
            if (nonNullable(maybeHeaderIndex)) {
                setTimeout(() => rowVirtualizer.scrollToIndex(maybeHeaderIndex, { align: 'start' }), 200)
            }
        }
    }, [expandedGroups, setExpandedGroups, headerIndices])

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
                        // Track Maybies.
                        const maybeTrack = indexToTrack().get(virtualRow.index)
                        const maybeTrackId = maybeTrack ? getTrackId(maybeTrack) : undefined
                        const maybeOverviewId = maybeTrack ? trackIdToEntityOverview().get(maybeTrackId!) : undefined
                        const maybeReviewId = maybeTrack ? trackIdToReviewId().get(maybeTrackId!) : undefined
                        const maybeEntityType = maybeTrack ? trackIdToEntityOverviewType().get(maybeTrackId!) : undefined

                        // Header Maybies.
                        const maybeOverview = indexToHeader().get(virtualRow.index)
                        const maybeHeaderReviewId = maybeOverview?.reviewId
                        // This should probably be the entity name.
                        const maybeHeaderName = maybeOverview?.reviewName

                        // Consider a compound key.
                        return (
                            <div
                                // key={`${virtualRow.index}${maybeId ?? maybeHeaderReviewId}`}
                                key={virtualRow.index}
                                style={indexToStyle(virtualRow) as CSSProperties}>
                                {
                                    currRows[virtualRow.index] ?
                                        <MemoTrack
                                            overviewId={maybeOverviewId!}
                                            reviewId={maybeReviewId!}
                                            track={maybeTrack!}
                                            tracksAtom={uniqueTracksAtom}
                                            entityType={maybeEntityType!}
                                        /> :
                                        <MemoizedGroupHeader
                                            reviewId={maybeHeaderReviewId!}
                                            parentReviewId={rootReview}
                                            name={maybeHeaderName!}
                                            entityType={maybeOverview?.entityType!}
                                            handleClick={toggleExpandedGroup} />
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
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
        // return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
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

        let maybeTrack = undefined
        const indexToTrack = get(indexToTrackAtom)
        const trackIdToReviewId = get(trackIdToReviewIdAtom)
        indexToTrack.forEach((track, index) => {
            const trackId = getTrackId(track)
            if (trackId === selectedTrack?.trackId && trackIdToReviewId.get(trackId) === selectedTrack.reviewId) {
                maybeTrack = index
            }
        })
        return maybeTrack
    }), [])

    const selectedIndex = useAtomValue(selectedIndexAtom)
    useEffect(() => {
        if (selectedIndex !== undefined) {
            virtualizer.scrollToIndex(selectedIndex, { align: 'center' })
        }
    }, [selectedIndex])
}



