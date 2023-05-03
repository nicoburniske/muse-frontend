import { DetailedPlaylistTrackFragment, DetailedTrackFragment } from 'graphql/generated/schema'
import AlbumTrack from '../track/AlbumTrack'
import PlaylistTrack from '../track/PlaylistTrack'

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
