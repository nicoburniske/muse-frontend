import * as React from 'react'
import { useVirtualizer, defaultRangeExtractor, Range, VirtualItem } from '@tanstack/react-virtual'
import { ReviewOverview } from './DetailedReview';
import { UseQueryResult, useQueryClient } from '@tanstack/react-query'
import { DetailedPlaylistTrackFragment, DetailedTrackFragment, EntityType, GetPlaylistQuery, useDeleteReviewLinkMutation, useDetailedReviewQuery } from 'graphql/generated/schema';
import _ from 'lodash';
import toast from 'react-hot-toast'
import { atom, PrimitiveAtom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import PlaylistTrack from './PlaylistTrack';
import { nonNullable, uniqueByProperty } from 'util/Utils';
import { useNavigate } from 'react-router-dom';
import { ArrowTopRightIcon, HazardIcon, ReplyIcon, TrashIcon } from 'component/Icons';
import { HeroLoading } from 'component/HeroLoading';

const useKeepMountedRangeExtractor = () => {
    const renderedRef = React.useRef(new Set<number>());

    const rangeExtractor = React.useCallback((range: Range) => {
        renderedRef.current = new Set([
            ...renderedRef.current,
            ...defaultRangeExtractor(range)
        ]);
        return Array.from(renderedRef.current);
    }, []);

    return rangeExtractor;
};

function zip<A, B>(i: A[], j: B[]): [A, B][] {
    return i.map((a, index) => [a, j[index]])
}

export const VirtualTest = ({ results, rootReview }: { rootReview: string, results: [UseQueryResult<GetPlaylistQuery, unknown>, ReviewOverview][] }) => {
    const parentRef = React.useRef<HTMLDivElement>(null)

    const validGroups = results
        .map(group => ({ tracks: group[0].data!.getPlaylist!.tracks, overview: group[1] }))
        .filter(group => nonNullable(group.tracks))

    // True is track. False is Group header.
    const rows: boolean[] = validGroups.reduce((acc, k) => [...acc, false, ...k.tracks!.map(_t => true)], new Array<boolean>())

    const tracks = validGroups.flatMap(g => g.tracks).map(t => t?.track).filter(nonNullable)
    const indexToTrack = new Map(zip(rows.map((isTrack, i) => isTrack ? i : -1).filter(i => i !== -1), validGroups.flatMap(g => g.tracks!)))
    const indexToHeader = new Map(zip(rows.map((isTrack, i) => !isTrack ? i : -1).filter(i => i !== -1), validGroups.map(g => g.overview)))

    const tracksAtom = atom(uniqueByProperty(tracks, t => t.id))
    const headerIndices = React.useMemo(() => rows.map((r, i) => r ? -1 : i).filter(i => i !== -1), [rows])

    const activeStickyIndexRef = React.useRef(0)
    const isSticky = (index: number) => headerIndices.includes(index)
    const isActiveSticky = (index: number) => activeStickyIndexRef.current === index

    const keepMounted = useKeepMountedRangeExtractor()
    const rowVirtualizer = useVirtualizer({
        overscan: 20,
        count: rows.length,
        estimateSize: () => 60,
        getScrollElement: () => parentRef.current,
        rangeExtractor: React.useCallback((range: Range) => {
            activeStickyIndexRef.current = [...headerIndices]
                .reverse()
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
                    loadingNoData || rows.length === 0 ?
                        <div className="grid place-items-center"> <HeroLoading />   </div> :
                        rowVirtualizer.getVirtualItems().map((virtualRow) => (
                            <div
                                key={virtualRow.index}
                                style={indexToStyle(virtualRow) as React.CSSProperties}>
                                {
                                    rows[virtualRow.index] ?
                                        <MemoizedTrack playlistId="" playlistTrack={indexToTrack.get(virtualRow.index)!} reviewId="" atom={tracksAtom} />
                                        :
                                        <ReviewGroupHeader
                                            reviewId={indexToHeader.get(virtualRow.index)!.reviewId}
                                            parentReviewId={''}
                                            name={indexToHeader.get(virtualRow.index)!.reviewName}
                                            entityType={EntityType.Playlist} onClick={() => { }} />
                                }
                            </div>
                        ))}
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
    const [isDeleting, setIsDeletingRaw] = React.useState(false)
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

    const gridStyle = isChild ? 'grid-cols-4' : 'grid-cols-2'

    return (
        <div className="bg-blue">
            <div className={`card py-0 w-full bg-secondary shadow-xl ${className}`}
                onClick={onClick}>
                <div className={`grid ${gridStyle} card-body p-1 justify-around w-full items-center`}>
                    <h2 className="card-title text-secondary-content w-full">{name}</h2>
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
    return React.useMemo(() => {
        return focusAtom(tracksAtom, (optic) => optic.find(t => t.id === trackId))
    }, [tracksAtom, trackId])
}

const MemoizedTrack = React.memo(({ playlistId, reviewId, playlistTrack, atom }: MemoPlaylistTrackProps) => {
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