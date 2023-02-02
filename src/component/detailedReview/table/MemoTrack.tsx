import { DetailedPlaylistTrackFragment, DetailedTrackFragment } from 'graphql/generated/schema'
import { PrimitiveAtom } from 'jotai'
import { memo } from 'react'
import AlbumTrack from '../track/AlbumTrack'
import PlaylistTrack from '../track/PlaylistTrack'
import { getTrackId } from './Helpers'

export interface MemoTrackProps {
    index: number
    track: DetailedPlaylistTrackFragment | DetailedTrackFragment
    reviewId: string
    isLikedAtom: PrimitiveAtom<boolean | undefined>
}
/**
 * TODO: Incorporate Podcast episode. 
 */

export const MemoTrack = memo(({ reviewId, track, isLikedAtom, index}: MemoTrackProps) => {
    if ('track' in track) {
        return (
            <PlaylistTrack
                index={index}
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
