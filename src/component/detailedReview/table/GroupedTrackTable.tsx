import { CSSProperties, useMemo, useRef, useCallback, useEffect } from 'react'
import { useVirtualizer, Range, VirtualItem } from '@tanstack/react-virtual'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useTransientAtom } from 'platform/hook/useTransientAtom'
import { allReviewTracksAtom } from 'state/Atoms'
import { Group } from './Helpers'
import { expandedGroupsAtom, headerIndicesAtom, indexToJsxAtom, indexToSizeAtom, reviewOrderAtom, rootReviewIdAtom, setResultsAtom, tracksAtom } from './TableAtoms'
import { useKeepMountedRangeExtractor, useScrollToSelected, useSmoothScroll } from './TableHooks'
import useSyncAtoms from 'platform/hook/useSyncAtoms'


interface GroupedTrackTableProps {
    rootReview: string,
    results: Group[]
}

const allTrackIdsAtom = atom(get => new Set<string>(get(tracksAtom).map(t => t.id)))

export const GroupedTrackTableWrapper = ({ rootReview, results }: GroupedTrackTableProps) => {

    // Ensure that seeking for now playing works properly.
    useSyncAtoms(allReviewTracksAtom, allTrackIdsAtom)

    // useAtom is intentional so we trigger a re-render when the rootReviewId changes.
    const [, setRootReviewId] = useAtom(rootReviewIdAtom)
    useEffect(() => setRootReviewId(rootReview), [rootReview, setRootReviewId])

    const setResults = useSetAtom(setResultsAtom)
    useEffect(() => setResults(results), [results, setResults])

    return (
        <GroupedTrackTable />
    )
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
    const expandedGroups = useAtomValue(useMemo(() => atom(get => get(expandedGroupsAtom).join(',')), []))
    useEffect(() => {
        mountedRef.current = new Set()
        return () => { mountedRef.current = new Set() }
    }, [expandedGroups])

    //Incorporate sticky headers into the range extractor.
    //There can be no headers so we account for undefined.
    const rangeExtractor = useCallback((range: Range) => {
        const newActiveSticky = getHeaderIndices()
            .find((index) => range.startIndex >= index)
        activeStickyIndexRef.current = newActiveSticky
        if (newActiveSticky !== undefined) {
            const next = new Set([
                newActiveSticky,
                ...keepMounted(range)
            ])
            const sorted = [...next].sort((a, b) => a - b)
            return sorted
        } else {
            return [... new Set([...keepMounted(range)])]
        }
    }, [getHeaderIndices])

    const scrollToFn = useSmoothScroll(parentRef)
    const [getIndexToSize] = useTransientAtom(indexToSizeAtom)
    const rowVirtualizer = useVirtualizer({
        overscan: 20,
        count: getIndexToSize().length,
        estimateSize: (index) => getIndexToSize()[index],
        getScrollElement: () => parentRef.current,
        scrollToFn,
        rangeExtractor
    })

    // Ensure new sizes are measured on re-order.
    // Derived atom ensures that values must be different for re-render.
    const order = useAtomValue(useMemo(() => atom(get => get(reviewOrderAtom).join(',')), []))

    useEffect(() => {
        rowVirtualizer.measure()
    }, [order, rowVirtualizer])

    // To account for tracks being added, removed, or re-ordered.
    useAtomValue(useMemo(() => atom(get => get(tracksAtom).map(t => t.id).join('')), []))

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

    const [getRows] = useTransientAtom(indexToJsxAtom)
    const rows = getRows()
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
                        return (
                            <div
                                key={virtualRow.index}
                                style={indexToStyle(virtualRow) as CSSProperties}>
                                {
                                    rows[virtualRow.index]
                                }
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

