import { DetailedAlbumFragment, DetailedPlaylistFragment, DetailedPlaylistTrackFragment, DetailedTrackFragment } from 'graphql/generated/schema'
import { nonNullable } from 'util/Utils'


export type TrackRow = DetailedPlaylistTrackFragment | DetailedTrackFragment
export type GroupData = DetailedAlbumFragment | DetailedPlaylistFragment

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
