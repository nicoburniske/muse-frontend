import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { PrivateUser } from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { PlayOptions } from 'spotify-web-api-ts/types/types/SpotifyOptions'
import { useSpotifyClient } from './ClientAtoms'

export type EntityType = 'Album' | 'Artist' | 'Playlist' | 'Track'

export const toUri = (entityType: EntityType, id: string) => {
   return `spotify:${entityType.toLowerCase()}:${id}`
}

export const usePlayMutation = (options?: UseMutationOptions<unknown, unknown, PlayOptions, unknown>) => {
   const client = useSpotifyClient()

   const mutation = useMutation(['Play'], async (input: PlayOptions) => client.player.play(input), options)

   const playTrackOffset = (trackId: string, positionMs?: number) => {
      const trackUri = toUri('Track', trackId)
      const input = { uris: [trackUri], position_ms: positionMs }
      mutation.mutate(input)
   }

   const playlistOffset = (playlistId: string, trackId: string) => {
      const trackUri = toUri('Track', trackId)
      const context_uri = toUri('Playlist', playlistId)
      const input = { context_uri, offset: { uri: trackUri } }
      mutation.mutate(input)
   }

   const albumOffset = (albumId: string, trackId: string) => {
      const trackUri = toUri('Track', trackId)
      const context_uri = toUri('Album', albumId)
      const input = { context_uri, offset: { uri: trackUri } }
      mutation.mutate(input)
   }

   const playTracks = (trackIds: string[]) => {
      const uris = trackIds.map(id => toUri('Track', id))
      mutation.mutate({ uris })
   }

   return {
      ...mutation,
      playTrackOffset,
      playlistOffset,
      albumOffset,
      playTracks,
   }
}

export const useSaveTracksMutation = (options?: UseMutationOptions<unknown, unknown, string[], unknown>) => {
   const client = useSpotifyClient()

   return useMutation(['SaveTracks'], (trackIds: [string]) => client.library.saveTracks(trackIds), options)
}

export const useRemoveSavedTracksMutation = (options?: UseMutationOptions<unknown, unknown, string[], unknown>) => {
   const client = useSpotifyClient()

   return useMutation(['UnsaveTracks'], (trackIds: [string]) => client.library.removeSavedTracks(trackIds), options)
}

type AddToPlaylistParams = { playlistId: string; trackIds: string[]; position?: number }

export const useAddTracksToPlaylistMutation = (
   options?: UseMutationOptions<unknown, unknown, AddToPlaylistParams, unknown>
) => {
   const client = useSpotifyClient()

   return useMutation(
      ['AddTracksToPlaylist'],
      ({ playlistId, trackIds, position }: AddToPlaylistParams) =>
         client.playlists.addItemsToPlaylist(
            playlistId,
            trackIds.map(t => toUri('Track', t)),
            { position }
         ),
      options
   )
}

type ReorderParams = { playlistId: string; rangeStart: number; insertBefore: number; rangeLength?: number }
export const useReorderPlaylistTracksMutation = (
   options?: UseMutationOptions<unknown, unknown, ReorderParams, unknown>
) => {
   const client = useSpotifyClient()

   return useMutation(
      ['MovePlaylistTracks'],
      ({ playlistId, rangeStart, insertBefore, rangeLength }: ReorderParams) =>
         client.playlists.reorderPlaylistItems(playlistId, rangeStart, insertBefore, { range_length: rangeLength }),
      options
   )
}

export const useTracksLikeQuery = (
   trackIds: string[],
   options?: UseQueryOptions<boolean[], unknown, boolean[], (string | string[])[]>
) => {
   const client = useSpotifyClient()
   return useQuery(['AreTracksSaved', trackIds], () => client.library.areTracksSaved(trackIds), options)
}

const useTrackLikeQueryKey = (trackId: string) => ['AreTracksSaved', trackId]
export const useTrackLikeQuery = (trackId: string, options?: UseQueryOptions<boolean, unknown, boolean, string[]>) => {
   const client = useSpotifyClient()
   return useQuery(useTrackLikeQueryKey(trackId), () => client.library.isTrackSaved(trackId), options)
}
useTrackLikeQuery.getKey = useTrackLikeQueryKey

export const useCurrentUser = <T,>(options?: UseQueryOptions<PrivateUser, unknown, T, string[]>) => {
   const client = useSpotifyClient()
   return useQuery(['CurrentUser'], () => client.users.getMe(), options)
}

export const useRemoveTracksFromPlaylistMutation = (
   options?: UseMutationOptions<unknown, unknown, { playlistId: string; trackIds: string[] }, unknown>
) => {
   const client = useSpotifyClient()

   return useMutation(
      ['RemoveTracksFromPlaylist'],
      ({ playlistId, trackIds }: { playlistId: string; trackIds: string[] }) =>
         client.playlists.removePlaylistItems(
            playlistId,
            trackIds.map(t => toUri('Track', t))
         ),
      options
   )
}

export const useAddTrackToQueue = (options?: UseMutationOptions<unknown, unknown, string, unknown>) => {
   const client = useSpotifyClient()

   return useMutation(
      ['AddTracksToQueue'],
      (trackId: string) => client.player.addToQueue(toUri('Track', trackId)),
      options
   )
}
