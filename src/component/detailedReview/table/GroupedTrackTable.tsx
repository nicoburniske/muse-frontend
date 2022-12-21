import { CSSProperties, useMemo, useRef, useCallback, useEffect } from 'react'
import { useVirtualizer, Range, VirtualItem } from '@tanstack/react-virtual'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useTransientAtom } from 'hook/useTransientAtom'
import { allReviewTracksAtom } from 'state/Atoms'
import { Group } from './Helpers'
import { headerIndicesAtom, indexToJsxAtom, indexToSizeAtom, reviewOrderAtom, setResultsAtom, tracksAtom } from './TableAtoms'
import { useKeepMountedRangeExtractor, useScrollToSelected, useSmoothScroll } from './TableHooks'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MuseTransition } from 'component/transitions/MuseTransition'


interface GroupedTrackTableProps {
    rootReview: string,
    results: Group[]
}

// Constructor. Don't understand why jotai Provider doesn't work here.
// Got infinite suspense when trying to use provider even though none of the atoms are async.
// TODO: Figure out if there's a better pattern than this. 
export const GroupedTrackTableWrapper = ({ rootReview, results }: GroupedTrackTableProps) => {

    // Ensure first group is open on load.
    const setAllTrackIds = useSetAtom(useMemo(() => atom(null, (get, set) => {
        const allTrackIds = new Set<string>(get(tracksAtom).map(t => t.id))
        // Ensure that seeking for now playing works properly.
        set(allReviewTracksAtom, allTrackIds)
    }), []))

    const setResults = useSetAtom(setResultsAtom)

    useEffect(() => {
        setResults({
            rootReviewId: rootReview,
            results
        })
        setAllTrackIds()
    }, [results])

    return (
        <DndProvider backend={HTML5Backend}>
            <GroupedTrackTable />
        </DndProvider>
    )
}


/**
 * COMPONENT
 */
export const GroupedTrackTable = () => {
    const parentRef = useRef<HTMLDivElement>(null)

    const [getHeaderIndices] = useTransientAtom(headerIndicesAtom)

    const activeStickyIndexRef = useRef(0)
    const isActiveSticky = useCallback((index: number) => activeStickyIndexRef.current === index, [])
    const isSticky = useCallback((index: number) => getHeaderIndices().includes(index), [getHeaderIndices])

    // Keep all previously rendered tracks mounted for performance. 
    const keepMounted = useKeepMountedRangeExtractor()
    //Incorporate sticky headers into the range extractor.
    const rangeExtractor = useCallback((range: Range) => {
        const newActiveSticky = getHeaderIndices()
            .find((index) => range.startIndex >= index) ?? 0
        activeStickyIndexRef.current = newActiveSticky
        const next = new Set([
            newActiveSticky,
            ...keepMounted(range)
        ])
        const sorted = [...next].sort((a, b) => a - b)
        return sorted
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
            <MuseTransition option='Notification'>
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
            </MuseTransition>
        </div>
    )
}

