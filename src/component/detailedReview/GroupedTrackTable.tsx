import { CSSProperties, useMemo, useRef, useCallback, useState, memo, useEffect } from 'react'
import { useVirtualizer, defaultRangeExtractor, Range, VirtualItem } from '@tanstack/react-virtual'
import { ReviewOverview } from './DetailedReview'
import { useQueryClient } from '@tanstack/react-query'
import { DetailedPlaylistFragment, DetailedPlaylistTrackFragment, DetailedTrackFragment, EntityType, useDeleteReviewLinkMutation, useDetailedReviewQuery } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { atom, PrimitiveAtom, useAtomValue, useSetAtom } from 'jotai'
import { focusAtom } from 'jotai/optics'
import PlaylistTrack from './PlaylistTrack'
import { nonNullable, uniqueByProperty, zip } from 'util/Utils'
import { useNavigate } from 'react-router-dom'
import { ArrowTopRightIcon, HazardIcon, ReplyIcon, TrashIcon } from 'component/Icons'
import { allReviewTracks, selectedTrackAtom } from 'state/Atoms'

const useKeepMountedRangeExtractor = () => {
    const renderedRef = useRef(new Set<number>())

    const rangeExtractor = useCallback((range: Range) => {
        renderedRef.current = new Set([
            ...renderedRef.current,
            ...defaultRangeExtractor(range)
        ])
        return Array.from(renderedRef.current)
    }, [])

    return rangeExtractor
}

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
    }, tracks)

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
                setTimeout(() => rowVirtualizer.scrollToIndex(maybeHeaderIndex, { align: 'start', smoothScroll: true }), 200)
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

    const tracksAtom = atom(uniqueByProperty(tracks, t => t.id))
    const headerIndices = useMemo(() => rows.map((r, i) => r ? -1 : i).filter(i => i !== -1).reverse(), [rows])

    const activeStickyIndexRef = useRef(0)
    const isSticky = (index: number) => headerIndices.includes(index)
    const isActiveSticky = (index: number) => activeStickyIndexRef.current === index

    // Keep all previously rendered tracks mounted for performance. 
    const keepMounted = useKeepMountedRangeExtractor()
    const rowVirtualizer = useVirtualizer({
        overscan: 20,
        count: rows.length,
        estimateSize: (index) => rows[index] ? 60 : 40,
        getScrollElement: () => parentRef.current,
        // Combining sticky headers + keepMounted performance.
        rangeExtractor: useCallback((range: Range) => {
            activeStickyIndexRef.current = [...headerIndices]
                .find((index) => range.startIndex >= index) ?? 0
            const next = new Set([
                activeStickyIndexRef.current,
                ...keepMounted(range)
            ])
            const sorted = [...next].sort((a, b) => a - b)
            return sorted
        }, [headerIndices])
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

    const scrollToSelected = () => {
        let maybeTrack = undefined
        indexToTrack.forEach((track, index) => {
            const trackId = track.track.id
            if (trackId === selectedTrack?.trackId && trackIdToReviewId.get(trackId) === selectedTrack.reviewId) {
                maybeTrack = index
            }
        })
        if (maybeTrack !== undefined) {
            rowVirtualizer.scrollToIndex(maybeTrack, { align: 'center', smoothScroll: true })
        }
    }

    const indexToStyle = (virtualRow: VirtualItem<unknown>) => ({
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
    })

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
                    rowVirtualizer.getVirtualItems().map((virtualRow) => {
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
                                key={virtualRow.index}
                                style={indexToStyle(virtualRow) as CSSProperties}>
                                {
                                    rows[virtualRow.index] ?
                                        <MemoizedTrack playlistId={maybeId!} playlistTrack={maybeTrack!} reviewId={maybeReviewId!} atom={tracksAtom} /> :
                                        <ReviewGroupHeader
                                            reviewId={maybeHeaderReviewId!}
                                            parentReviewId={rootReview}
                                            name={maybeHeaderName!}
                                            entityType={EntityType.Playlist}
                                            onClick={() => toggleExpandedGroup(maybeHeaderReviewId!)} />
                                }
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}


interface ReviewGroupHeaderProps {
    className?: string
    reviewId: string
    parentReviewId: string
    name: string
    entityType: EntityType
    onClick: () => void
}


const ReviewGroupHeader = ({ className = '', reviewId, parentReviewId, name, entityType, onClick }: ReviewGroupHeaderProps) => {
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

    return (
        <div className="bg-blue h-10">
            <div className={`card py-0 w-full bg-secondary  ${className}`}
                onClick={onClick}>
                <div className={`grid ${gridStyle} card-body p-1 justify-around w-full items-center`}>
                    <div className={`${nameStyle}`}>
                        <h2 className={'text-md md:text-xl text-secondary-content w-full truncate'}>{name}</h2>
                    </div>
                    <div className="m-auto">
                        <div className="badge badge-primary text-primary-content text-center">{entityType}</div>
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
        </div>
    )
}

export interface MemoPlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    playlistId: string
    atom: PrimitiveAtom<DetailedTrackFragment[]>
}

function useTrackAtIndexAtom(tracksAtom: PrimitiveAtom<DetailedTrackFragment[]>, trackId: string) {
    return useMemo(() => {
        return focusAtom(tracksAtom, (optic) => optic.find(t => t.id === trackId))
    }, [tracksAtom, trackId])
}

const MemoizedTrack = memo(({ playlistId, reviewId, playlistTrack, atom }: MemoPlaylistTrackProps) => {
    const trackAtom = useTrackAtIndexAtom(atom, playlistTrack.track.id)
    return (
        <div className="py-0.5 m-0">
            <PlaylistTrack
                playlistId={playlistId}
                reviewId={reviewId}
                playlistTrack={playlistTrack}
                atom={trackAtom}
            />
        </div>
    )
}, (a, b) =>
    a.playlistId === b.playlistId &&
    a.reviewId === b.reviewId &&
    a.playlistTrack.track.id === b.playlistTrack.track.id)

function setAtom(allReviewTracks: PrimitiveAtom<Set<string>> & { init: Set<string> }) {
    throw new Error('Function not implemented.')
}
