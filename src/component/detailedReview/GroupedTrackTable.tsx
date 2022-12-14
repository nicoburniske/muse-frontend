import { CSSProperties, useMemo, useRef, useCallback, useState, memo, useEffect, RefObject } from 'react'
import { useVirtualizer, defaultRangeExtractor, Range, VirtualItem, VirtualizerOptions, elementScroll } from '@tanstack/react-virtual'
import { ReviewOverview } from './DetailedReview'
import { useQueryClient } from '@tanstack/react-query'
import { DetailedPlaylistFragment, DetailedPlaylistTrackFragment, DetailedTrackFragment, EntityType, useDeleteReviewLinkMutation, useDetailedReviewQuery } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { atom, PrimitiveAtom, useAtomValue, useSetAtom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import PlaylistTrack from './PlaylistTrack'
import { nonNullable, uniqueByProperty, zip } from 'util/Utils'
import { useNavigate } from 'react-router-dom'
import { ArrowTopRightIcon, HazardIcon, ReplyIcon, TrashIcon } from 'component/Icons'
import { allReviewTracks, selectedTrackAtom } from 'state/Atoms'


export const GroupedTrackTable = ({ results, rootReview }: { rootReview: string, results: [DetailedPlaylistFragment, ReviewOverview][] }) => {
    const parentRef = useRef<HTMLDivElement>(null)

    const allGroups = useMemo(() => results
        .map(group => ({ tracks: group[0].tracks, overview: group[1] }))
        .filter(group => nonNullable(group.tracks)), [results])

    // ONLY FOR ATOMS/STATE. Does not account for collapse.
    const tracks = useMemo(() => allGroups.flatMap(g => g.tracks).map(t => t?.track).filter(nonNullable), [allGroups])
    const setReviewTracks = useSetAtom(allReviewTracks)
    useEffect(() => {
        setReviewTracks(new Set<string>(tracks.map(t => t.id)))
    }, [tracks])

    const [expandedGroups, setExpandedGroups] = useState<string[]>(results.length === 0 ? [] : [results[0][1].reviewId])

    const toggleExpandedGroup = useCallback((reviewId: string) => {
        const exists = expandedGroups.includes(reviewId)
        if (exists) {
            const postRemove = expandedGroups.filter(group => group !== reviewId)
            setExpandedGroups(postRemove)
        } else {
            const postAdd = [...expandedGroups, reviewId]
            setExpandedGroups(postAdd)
            const maybeHeaderIndex = headerIndices.find(i => {
                const header = indexToHeader.get(i)
                return nonNullable(header) ? header.reviewId === reviewId : false
            })
            if (nonNullable(maybeHeaderIndex)) {
                setTimeout(() => rowVirtualizer.scrollToIndex(maybeHeaderIndex, { align: 'start' }), 200)
            }
        }

    }, [expandedGroups, setExpandedGroups])

    const validGroups = useMemo(() => allGroups.map(({ tracks, overview }) => {
        if (expandedGroups.includes(overview.reviewId)) {
            return { overview, tracks }
        } else {
            return { overview, tracks: [] }
        }
    }), [allGroups, expandedGroups])

    // True is track. False is Group header.
    const rows: boolean[] = useMemo(() => validGroups.reduce((acc, k) => {
        if (expandedGroups.includes(k.overview.reviewId)) {
            // Add the group header and all tracks. 
            return [...acc, false, ...k.tracks!.map(_t => true)]
        } else {
            // Only add the header.
            return [...acc, false]
        }
    }, new Array<boolean>()), [validGroups, expandedGroups])


    // Cache stuff for lookups.
    // Is there any case where there can be a conflict?
    const trackIdToEntityOverview = useMemo(() => new Map(validGroups.map(g => ({ overview: g.overview.entityId, trackIds: g.tracks!.map(t => t!.track!.id) })).flatMap(({ overview, trackIds: tracks }) => tracks.map(t => ([t, overview])))), [validGroups])
    const trackIdToReviewId = useMemo(() => new Map(validGroups.map(g => ({ reviewId: g.overview.reviewId, tracks: g.tracks!.map(t => t!.track!.id) })).flatMap(({ reviewId, tracks }) => tracks.map(t => ([t, reviewId])))), [validGroups])
    const indexToTrack = useMemo(() => new Map(zip(rows.map((isTrack, i) => isTrack ? i : -1).filter(i => i !== -1), validGroups.flatMap(g => g.tracks!))), [rows, validGroups])
    const indexToHeader = useMemo(() => new Map(zip(rows.map((isTrack, i) => !isTrack ? i : -1).filter(i => i !== -1), validGroups.map(g => g.overview))), [rows, validGroups])

    const tracksAtom = useMemo(() => atom(uniqueByProperty(tracks, t => t.id)), [tracks])
    const headerIndices = useMemo(() => rows.map((r, i) => r ? -1 : i).filter(i => i !== -1).reverse(), [rows])

    const activeStickyIndexRef = useRef(0)
    const isSticky = useCallback((index: number) => headerIndices.includes(index), [headerIndices])
    const isActiveSticky = useCallback((index: number) => activeStickyIndexRef.current === index, [])

    // Keep all previously rendered tracks mounted for performance. 
    // Combining sticky headers + keepMounted.
    const keepMounted = useKeepMountedRangeExtractor()
    const rangeExtractor = useCallback((range: Range) => {
        activeStickyIndexRef.current = [...headerIndices]
            .find((index) => range.startIndex >= index) ?? 0
        const next = new Set([
            activeStickyIndexRef.current,
            ...keepMounted(range)
        ])
        const sorted = [...next].sort((a, b) => a - b)
        return sorted
    }, [headerIndices])

    const scrollToFn = useSmoothScroll(parentRef)
    const rowVirtualizer = useVirtualizer({
        overscan: 20,
        count: rows.length,
        estimateSize: (index) => rows[index] ? 60 : 40,
        getScrollElement: () => parentRef.current,
        scrollToFn,
        rangeExtractor
    })

    // Need to consider same song in different contexts.
    const selectedTrack = useAtomValue(selectedTrackAtom)
    useEffect(() => {
        if (selectedTrack !== undefined && tracks.length > 0) {
            if (!expandedGroups.includes(selectedTrack.reviewId)) {
                setExpandedGroups([...expandedGroups, selectedTrack.reviewId])
                // Not working as intended.
                setTimeout(() => scrollToSelected(), 1000)
            } else {
                scrollToSelected()
            }
        }
    }, [selectedTrack])

    const selectedIndex = useMemo(() => {
        let maybeTrack = undefined
        indexToTrack.forEach((track, index) => {
            const trackId = track.track.id
            if (trackId === selectedTrack?.trackId && trackIdToReviewId.get(trackId) === selectedTrack.reviewId) {
                maybeTrack = index
            }
        })
        return maybeTrack
    }, [selectedTrack])

    const scrollToSelected = () => {
        if (selectedIndex !== undefined) {
            rowVirtualizer.scrollToIndex(selectedIndex, { align: 'center' })
        }
    }

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
    }, [rows])

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
                        const maybeTrack = indexToTrack.get(virtualRow.index)
                        const maybeId = trackIdToEntityOverview.get(maybeTrack?.track?.id ?? '')
                        const maybeReviewId = trackIdToReviewId.get(maybeTrack?.track?.id ?? '')

                        // Header Maybies.
                        const maybeOverview = indexToHeader.get(virtualRow.index)
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
                                    rows[virtualRow.index] ?
                                        <MemoizedTrack
                                            playlistId={maybeId!}
                                            playlistTrack={maybeTrack!}
                                            reviewId={maybeReviewId!}
                                            atom={tracksAtom} /> :
                                        <MemoizedGroupHeader
                                            reviewId={maybeHeaderReviewId!}
                                            parentReviewId={rootReview}
                                            name={maybeHeaderName!}
                                            entityType={EntityType.Playlist}
                                            handleClick={toggleExpandedGroup} />
                                }
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

const useSmoothScroll = (parentRef: RefObject<HTMLDivElement>) => {
    // Smooth Scroll function.
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

function easeInOutQuint(t: number) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
}


interface ReviewGroupHeaderProps {
    reviewId: string
    parentReviewId: string
    name: string
    entityType: EntityType
    handleClick: (reviewId: string) => void
}

const MemoizedGroupHeader = memo((props: ReviewGroupHeaderProps) => (<ReviewGroupHeader {...props} />),
    (prevProps, nextProps) =>
        prevProps.reviewId === nextProps.reviewId
        && prevProps.handleClick === nextProps.handleClick
)

const ReviewGroupHeader = ({ reviewId, parentReviewId, name, entityType, handleClick }: ReviewGroupHeaderProps) => {
    const isChild = reviewId !== parentReviewId
    const [isDeleting, setIsDeletingRaw] = useState(false)
    const nav = useNavigate()
    const queryClient = useQueryClient()
    const linkToReviewPage = () => nav(`/reviews/${reviewId}`)
    const { mutateAsync: deleteReviewLink } = useDeleteReviewLinkMutation({
        onError: () => toast.error('Failed to delete review link'),
    })

    const handleDeleteReviewLink = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        await deleteReviewLink({ input: { childReviewId: reviewId, parentReviewId } })
        e.stopPropagation()
        queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId: parentReviewId }))
    }

    const setIsDeleting = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => (isDeleting: boolean) => {
        setIsDeletingRaw(isDeleting)
        e.stopPropagation()
    }

    const gridStyle = isChild ? 'grid-cols-5' : 'grid-cols-2'
    const nameStyle = isChild ? 'col-span-2' : 'col-span-1'

    const onClick = () => handleClick(reviewId)

    return (
        <div className='card py-0 w-full bg-secondary'
            onClick={onClick}>
            <div className={`grid ${gridStyle} card-body p-1 justify-around w-full items-center`}>
                <div className={`${nameStyle}`}>
                    <h2 className={'text-md md:text-xl text-secondary-content w-full truncate'}>{name}</h2>
                </div>
                <div className="m-auto">
                    <div className="badge badge-primary text-secondary-content text-center">{entityType}</div>
                </div>
                {isChild ?
                    <>
                        <button className="btn btn-sm btn-ghost" onClick={() => linkToReviewPage()} >
                            <ArrowTopRightIcon />
                        </button>
                        {isDeleting ?
                            <div className="btn-group justify-center" >
                                <button className="btn btn-sm btn-error tooltip tooltip-error tooltip-left" data-tip="remove review link" onClick={e => handleDeleteReviewLink(e)}>
                                    <HazardIcon />
                                </button>
                                <button className="btn btn-sm btn-info" onClick={(e) => setIsDeleting(e)(false)}>
                                    <ReplyIcon />
                                </button>
                            </div>
                            :
                            <button className="btn btn-sm btn-ghost" onClick={(e) => setIsDeleting(e)(true)}>
                                <TrashIcon />
                            </button>
                        }
                    </>
                    : null
                }
            </div>
        </div>
    )
}

export interface MemoPlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    playlistId: string
    atom: PrimitiveAtom<DetailedTrackFragment[]>
}

const MemoizedTrack = memo(({ playlistId, reviewId, playlistTrack, atom }: MemoPlaylistTrackProps) => {
    const isLikedAtom = useTrackLikeAtom(atom, playlistTrack.track.id)
    return (
        <div className="py-0.5 m-0">
            <PlaylistTrack
                playlistId={playlistId}
                reviewId={reviewId}
                playlistTrack={playlistTrack}
                isLikedAtom={isLikedAtom}
            />
        </div>
    )
}, (a, b) =>
    a.playlistId === b.playlistId &&
    a.reviewId === b.reviewId &&
    a.playlistTrack.track.id === b.playlistTrack.track.id)

function useTrackLikeAtom(tracksAtom: PrimitiveAtom<DetailedTrackFragment[]>, trackId: string): PrimitiveAtom<boolean> {
    return useMemo(() => {
        const focused = focusAtom(tracksAtom, (optic) =>
            optic
                .find(t => t.id === trackId)
                .prop('isLiked')
                .valueOr(false))
        return atom((get) => get(focused) ?? false, (_get, set, value) => set(focused, value))
    }, [tracksAtom, trackId])
}

