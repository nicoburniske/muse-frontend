import { CSSProperties, useMemo, useRef, useCallback, useEffect } from 'react'
import { useVirtualizer, Range, VirtualItem } from '@tanstack/react-virtual'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useTransientAtom } from 'hook/useTransientAtom'
import { allReviewTracksAtom } from 'state/Atoms'
import { Group } from './Helpers'
import { expandedGroupsAtom, headerIndicesAtom, indexToJsxAtom, indexToSizeAtom, resultsAtom, rootReviewIdAtom, tracksAtom } from './TableAtoms'
import { useKeepMountedRangeExtractor, useScrollToSelected, useSmoothScroll } from './TableHooks'


interface GroupedTrackTableProps {
    rootReview: string,
    results: Group[]
}

// Constructor. Don't understand why jotai Provider doesn't work here.
// Got infinite suspense when trying to use provider even though none of the atoms are async.
// TODO: Figure out if there's a better pattern than this. 
export const GroupedTrackTableWrapper = ({ rootReview, results }: GroupedTrackTableProps) => {
    const allTrackIdsAtom = useMemo(() => atom(get => new Set<string>(get(tracksAtom).map(t => t.id))), [])

    // Ensure first group is open on load.
    const setResultsAtom = useMemo(() => atom(null, (get, set, results: Group[]) => {
        set(resultsAtom, results)
        // Ensure that seeking for now playing works properly.
        set(allReviewTracksAtom, get(allTrackIdsAtom))

        if (results.length > 0) {
            set(expandedGroupsAtom, [results[0].overview.reviewId])
        }
    }), [])

    const setResults = useSetAtom(setResultsAtom)
    const setRootReview = useSetAtom(rootReviewIdAtom)

    useEffect(() => {
        setRootReview(rootReview)
        setResults(results)
    }, [results])

    return (
        <GroupedTrackTable />
    )
}


/**
 * COMPONENT
 */
export const GroupedTrackTable = () => {
    const parentRef = useRef<HTMLDivElement>(null)

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
                    willChange: 'transform'
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

