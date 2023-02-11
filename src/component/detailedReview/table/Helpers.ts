import {
   AlbumDetailsFragment,
   DetailedAlbumFragment,
   DetailedPlaylistFragment,
   DetailedPlaylistTrackFragment,
   DetailedTrackFragment,
} from 'graphql/generated/schema'
import { PlaylistDetailsFragment } from 'graphql/generated/urqlSchema'
import { nonNullable } from 'util/Utils'

export type Group = {
   data: GroupData
   overview: ReviewOverview
}
export type GroupData = DetailedAlbumFragment | DetailedPlaylistFragment
export type ReviewOverview = {
   reviewName: string
   reviewId: string
}
export type HeaderData = AlbumDetailsFragment | PlaylistDetailsFragment

export type TrackRow = DetailedPlaylistTrackFragment | DetailedTrackFragment

export function getTrackId(track: TrackRow): string {
   if ('track' in track) {
      return track.track.id
   } else {
      return track.id
   }
}

export function getTracks(entity: DetailedPlaylistFragment | DetailedAlbumFragment): TrackRow[] {
   if (entity.__typename === 'Playlist') {
      return entity?.tracks?.filter(nonNullable) ?? []
   } else {
      return (entity as DetailedAlbumFragment)?.tracks?.filter(nonNullable) ?? []
   }
}

export function getTrack(track: TrackRow): DetailedTrackFragment {
   if ('track' in track) {
      return track.track
   } else {
      return track
   }
}

export const searchTrack = (trackRow: TrackRow, search: string): boolean => {
   const track = getTrack(trackRow)
   return (
      track.name.toLowerCase().includes(search) ||
      track.artists?.some(artist => artist?.name?.toLowerCase().includes(search)) ||
      false
   )
}
