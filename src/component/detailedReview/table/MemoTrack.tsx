import { DetailedPlaylistTrackFragment, DetailedTrackFragment } from 'graphql/generated/schema'
import { PrimitiveAtom } from 'jotai'
import { memo } from 'react'
import AlbumTrack from '../track/AlbumTrack'
import PlaylistTrack from '../track/PlaylistTrack'
import { getTrackId } from './Helpers'

export interface MemoTrackProps {
    track: DetailedPlaylistTrackFragment | DetailedTrackFragment
    reviewId: string
    isLikedAtom: PrimitiveAtom<boolean>
}
/**
 * TODO: Incorporate Podcast episode. 
 */

export const MemoTrack = memo(({ reviewId, track, isLikedAtom }: MemoTrackProps) => {
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
