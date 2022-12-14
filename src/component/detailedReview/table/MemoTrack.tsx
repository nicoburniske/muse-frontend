import { DetailedPlaylistTrackFragment, DetailedTrackFragment } from 'graphql/generated/schema'
import { atom, PrimitiveAtom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { memo, useMemo } from 'react'
import AlbumTrack from '../track/AlbumTrack'
import PlaylistTrack from '../track/PlaylistTrack'
import { getTrackId } from './Helpers'

export interface MemoTrackProps {
    track: DetailedPlaylistTrackFragment | DetailedTrackFragment
    reviewId: string
    overviewId: string
    tracksAtom: PrimitiveAtom<DetailedTrackFragment[]>
}


export const MemoTrack = memo(({ overviewId, reviewId, track, tracksAtom }: MemoTrackProps) => {
    const isLikedAtom = useTrackLikeAtom(tracksAtom, getTrackId(track))
    if ('track' in track) {
        return (
            <div className="py-0.5 m-0">
                <PlaylistTrack
                    playlistId={overviewId}
                    reviewId={reviewId}
                    playlistTrack={track}
                    isLikedAtom={isLikedAtom}
                />
            </div>
        )
    } else {
        return (
            <AlbumTrack
                track={track}
                reviewId={reviewId}
                albumId={overviewId}
                isLikedAtom={isLikedAtom}
            />
        )
    }
}, (a, b) =>
    a.overviewId === b.overviewId &&
    a.reviewId === b.reviewId &&
    getTrackId(a.track) === getTrackId(b.track))

function useTrackLikeAtom(tracksAtom: PrimitiveAtom<DetailedTrackFragment[]>, trackId: string): PrimitiveAtom<boolean> {
    return useMemo(() => {
        const focused = focusAtom(tracksAtom, (optic) =>
            optic
                .find(t => t.id === trackId)
                .prop('isLiked')
                .valueOr(false))
        return atom((get) => get(focused) ?? false, (_get, set, value) => set(focused, value))
    }, [trackId])
}
