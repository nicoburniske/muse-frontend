import { memo } from 'react'

import { getTrackId } from '@/component/trackTable/Helpers'
import { DetailedPlaylistTrackFragment, DetailedTrackFragment } from '@/graphql/generated/schema'

import AlbumTrack from './AlbumTrack'
import PlaylistTrack from './PlaylistTrack'

export interface EitherTrackProps {
   index: number
   track: DetailedPlaylistTrackFragment | DetailedTrackFragment
   reviewId: string
}
/**
 * TODO: Incorporate Podcast episode.
 */

export const EitherTrack = ({ reviewId, track, index }: EitherTrackProps) => {
   if ('track' in track) {
      return <PlaylistTrack index={index} reviewId={reviewId} playlistTrack={track} />
   } else {
      return <AlbumTrack track={track} reviewId={reviewId} />
   }
}

export const EitherTrackMemo = memo(EitherTrack, (prev, next) => {
   return getTrackId(prev.track) === getTrackId(next.track) && prev.index === next.index
})
