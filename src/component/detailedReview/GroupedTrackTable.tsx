import { CSSProperties, useMemo, useRef, useCallback, useState, memo, useEffect } from 'react'
import { useVirtualizer, defaultRangeExtractor, Range, VirtualItem } from '@tanstack/react-virtual'
import { ReviewOverview } from './DetailedReview';
import { UseQueryResult, useQueryClient } from '@tanstack/react-query'
import { DetailedPlaylistTrackFragment, DetailedTrackFragment, EntityType, GetPlaylistQuery, useDeleteReviewLinkMutation, useDetailedReviewQuery } from 'graphql/generated/schema';
import toast from 'react-hot-toast'
import { atom, PrimitiveAtom, useAtomValue } from 'jotai';
import { focusAtom } from 'jotai/optics';
import PlaylistTrack from './PlaylistTrack';
import { nonNullable, uniqueByProperty, zip } from 'util/Utils';
import { useNavigate } from 'react-router-dom';
import { ArrowTopRightIcon, HazardIcon, ReplyIcon, TrashIcon } from 'component/Icons';
import { selectedTrackAtom } from 'state/Atoms';

const useKeepMountedRangeExtractor = () => {
    const renderedRef = useRef(new Set<number>());

    const rangeExtractor = useCallback((range: Range) => {
        renderedRef.current = new Set([
            ...renderedRef.current,
            ...defaultRangeExtractor(range)
        ]);
        return Array.from(renderedRef.current);
    }, []);

    return rangeExtractor;
};

export const GroupedTrackTable = ({ results, rootReview }: { rootReview: string, results: [UseQueryResult<GetPlaylistQuery, unknown>, ReviewOverview][] }) => {
    const parentRef = useRef<HTMLDivElement>(null)

    const validGroups = results
        .map(group => ({ tracks: group[0].data!.getPlaylist!.tracks, overview: group[1] }))
        .filter(group => nonNullable(group.tracks))

    // True is track. False is Group header.
    const rows: boolean[] = validGroups.reduce((acc, k) => [...acc, false, ...k.tracks!.map(_t => true)], new Array<boolean>())

    const tracks = validGroups.flatMap(g => g.tracks).map(t => t?.track).filter(nonNullable)

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

    const keepMounted = useKeepMountedRangeExtractor()
    const rowVirtualizer = useVirtualizer({
        overscan: 20,
        count: rows.length,
        estimateSize: (index) => rows[index] ? 60 : 40,
        getScrollElement: () => parentRef.current,
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

    const loadingNoData = results.map(r => r[0]).some(r => r.isLoading) && results.every(r => r[0].data === undefined)

    // Need to consider same song in different contexts.
    const selectedTrack = useAtomValue(selectedTrackAtom)
    useEffect(() => {
        if (selectedTrack !== undefined && !loadingNoData && tracks.length > 0) {
            var maybeTrack = undefined
            indexToTrack.forEach((track, index) => {
                const trackId = track.track.id
                if (trackId === selectedTrack.trackId && trackIdToReviewId.get(trackId) === selectedTrack.reviewId) {
                    maybeTrack = index
                }
            })
            if (maybeTrack !== undefined) {
                // TODO: need to expand section containing track.
                rowVirtualizer.scrollToIndex(maybeTrack, { align: 'center', smoothScroll: true })
            }
        }
    }, [selectedTrack])

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
        loadingNoData || rows.length === 0 ?
            <div className="w-full grid place-items-center">
                <div className="border-t-transparent border-solid animate-spin  rounded-full border-primary border-8 h-56 w-56"></div>
            </div> :
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
                            const maybeTrack = indexToTrack.get(virtualRow.index)
                            const maybeId = trackIdToEntityOverview.get(maybeTrack?.track?.id ?? '')
                            const maybeReviewId = trackIdToReviewId.get(maybeTrack?.track?.id ?? '')
                            return (
                                <div
                                    key={virtualRow.index}
                                    style={indexToStyle(virtualRow) as CSSProperties}>
                                    {
                                        rows[virtualRow.index] ?
                                            <MemoizedTrack playlistId={maybeId!} playlistTrack={maybeTrack!} reviewId={maybeReviewId!} atom={tracksAtom} /> :
                                            <GroupHeaderMemo
                                                reviewId={indexToHeader.get(virtualRow.index)!.reviewId}
                                                parentReviewId={rootReview}
                                                name={indexToHeader.get(virtualRow.index)!.reviewName}
                                                entityType={EntityType.Playlist} onClick={() => { }} />
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
        <div className="bg-blue">
            <div className={`card py-0 w-full bg-secondary shadow-xl ${className}`}
                onClick={onClick}>
                <div className={`grid ${gridStyle} card-body p-1 justify-around w-full items-center`}>
                    <div className={`${nameStyle} m-auto`}>
                        <h2 className={`card-title text-secondary-content w-full`}>{name}</h2>
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

const GroupHeaderMemo = memo(ReviewGroupHeader, (a, b) => a.reviewId === b.reviewId)

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