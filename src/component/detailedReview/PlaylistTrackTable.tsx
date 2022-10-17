import React, { useEffect, useMemo, useRef } from "react";
import { DetailedPlaylistTrackFragment } from "graphql/generated/schema";
import PlaylistTrack from "./PlaylistTrack";
import { useAtomValue } from "jotai";
import { openCommentModalAtom, selectedTrackAtom } from "state/Atoms";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { CommentFormModal } from "./CommentForm";


export interface PlaylistTrackTableProps {
    playlistId: string,
    reviewId: string,
    playlistTracks: DetailedPlaylistTrackFragment[],
}

export default function PlaylistTrackTable({ playlistId, reviewId, playlistTracks }: PlaylistTrackTableProps) {
    const virtuoso = useRef<VirtuosoHandle>(null);
    const modalData = useAtomValue(openCommentModalAtom)

    const idToIndex = React.useMemo(() =>
        playlistTracks
            .map((t, i) => [t.track.id, i] as [string, number])
            .reduce((acc, [id, index]) => { acc.set(id, index); return acc }, new Map<string, number>())
        , [playlistTracks])

    const selectedTrackId = useAtomValue(selectedTrackAtom)

    useEffect(() => {
        if (selectedTrackId) {
            const index = idToIndex.get(selectedTrackId)
            if (index !== undefined) {
                virtuoso.current?.scrollToIndex({ index, behavior: 'smooth', align: 'center' })
            }
        }
    }, [selectedTrackId])

    const MemoizedTrack = React.memo(({ index }: { index: number }) =>
        <div className="py-0.5">
            <PlaylistTrack
                playlistId={playlistId}
                reviewId={reviewId}
                playlistTrack={playlistTracks[index]} />
        </div>
        , (prev, next) => prev.index === next.index)

    const trackContent = (index: number) => <MemoizedTrack index={index} />

    const open = useMemo(() => modalData !== undefined, [modalData])

    return (
        <>
            <Virtuoso
                className="w-full h-full overflow-y-auto"
                ref={virtuoso}
                style={{ height: "100%" }}
                totalCount={playlistTracks.length}
                itemContent={(index) => trackContent(index)}
                overscan={200}
            />
            <CommentFormModal
                open={open}
                title={modalData?.title ?? ""}
                onCancel={modalData?.onCancel ?? (() => { })}
                onSubmit={modalData?.onSubmit ?? (() => Promise.resolve())}
                initialValue={modalData?.initialValue}
            />
        </>
    )
}