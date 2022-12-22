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
    tracksAtom: PrimitiveAtom<DetailedTrackFragment[]>
}
/**
 * TODO: Incorporate Podcast episode. 
 */

export const MemoTrack = memo(({ reviewId, track, tracksAtom }: MemoTrackProps) => {
    const isLikedAtom = useTrackLikeAtom(tracksAtom, getTrackId(track))
    if ('track' in track) {
        return (
            <PlaylistTrack
                reviewId={reviewId}
                playlistTrack={track}
                isLikedAtom={isLikedAtom}
            />
        )
    } else {
        return (
            <AlbumTrack
                track={track}
                reviewId={reviewId}
                isLikedAtom={isLikedAtom}
            />
        )
    }
}, (a, b) =>
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
