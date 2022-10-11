import React, { useEffect } from "react";
import { useVirtualizer } from '@tanstack/react-virtual'
import { DetailedPlaylistTrackFragment } from "graphql/generated/schema";
import PlaylistTrack from "./PlaylistTrack";
import { useAtomValue } from "jotai";
import { selectedTrack } from "state/Atoms";

export interface PlaylistTrackTableProps {
    playlistId: string,
    reviewId: string,
    playlistTracks: DetailedPlaylistTrackFragment[],
}

export default function PlaylistTrackTable({ playlistId, reviewId, playlistTracks }: PlaylistTrackTableProps) {
    const parentRef = React.useRef<null | HTMLDivElement>()

    const idToIndex = React.useMemo(() =>
        playlistTracks
            .map((t, i) => [t.track.id, i] as [string, number])
            .reduce((acc, [id, index]) => { acc.set(id, index); return acc }, new Map<string, number>())
        , [playlistTracks])

    const selectedTrackId = useAtomValue(selectedTrack)

    useEffect(() => {
        if (selectedTrackId) {
            const index = idToIndex.get(selectedTrackId)
            if (index !== undefined) {
                virtualizer.scrollToIndex(index)
            }
        }
    }, [selectedTrackId])


    const virtualizer = useVirtualizer({
        count: playlistTracks.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100,
        overscan: 40
    })

    const MemoizedTrack = React.memo(({ index }: { index: number }) =>
        <div className="py-2">
            <PlaylistTrack
                playlistId={playlistId}
                reviewId={reviewId}
                playlistTrack={playlistTracks[index]} />
        </div>
    )

    // const trackContent = (index: number) => <MemoizedTrack index={index} />

    return (
        <div id="yeet" ref={parentRef} className="w-2/5 overflow-auto " >
            <div
                className="relative w-full"
                style={{
                    height: `${virtualizer.getTotalSize()}px`
                }}>
                {
                    virtualizer.getVirtualItems().map((virtualRow) => (
                        <div
                            key={virtualRow.key}
                            ref={virtualRow.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                // height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <MemoizedTrack index={virtualRow.index} />
                        </div>

                    ))
                }
            </div>
        </div >
    )
}