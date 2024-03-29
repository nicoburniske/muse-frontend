import {
   QueryFunction,
   useInfiniteQuery,
   UseInfiniteQueryOptions,
   useMutation,
   UseMutationOptions,
   useQuery,
   UseQueryOptions,
} from '@tanstack/react-query'
import { PrivateUser, SearchType } from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { PlayOptions, SearchOptions } from 'spotify-web-api-ts/types/types/SpotifyOptions'
import { SearchResponse } from 'spotify-web-api-ts/types/types/SpotifyResponses'

import { useSpotifyClient } from './ClientAtoms'

type EntityType = 'Album' | 'Artist' | 'Playlist' | 'Track'

const toUri = (entityType: EntityType, id: string) => {
   return `spotify:${entityType.toLowerCase()}:${id}`
}

export type PlayWithPositon = { position_ms?: number } & PlayOptions

export const usePlayMutation = (options?: UseMutationOptions<unknown, unknown, PlayWithPositon, unknown>) => {
   const client = useSpotifyClient()

   const mutation = useMutation(['Play'], async (input: PlayWithPositon) => client.player.play(input), options)

   const playTrackOffset = (trackId: string, positionMs?: number) => {
      const trackUri = toUri('Track', trackId)
      const input = { uris: [trackUri], position_ms: positionMs }
      mutation.mutate(input)
   }

   const playArtist = (artistId: string, positionMs = 0) => {
      const artistUri = toUri('Artist', artistId)
      mutation.mutate({ context_uri: artistUri, position_ms: positionMs })
   }

   const playPlaylistOffset = (playlistId: string, trackId: string, positionMs = 0) => {
      const trackUri = toUri('Track', trackId)
      const context_uri = toUri('Playlist', playlistId)
      const input = { context_uri, offset: { uri: trackUri }, position_ms: positionMs }
      mutation.mutate(input)
   }

   const playPlaylistIndexOffset = (playlistId: string, position: number, positionMs = 0) => {
      const context_uri = toUri('Playlist', playlistId)
      const input = { context_uri, offset: { position }, position_ms: positionMs }
      mutation.mutate(input)
   }

   const playAlbumOffset = (albumId: string, trackId: string, positionMs = 0) => {
      const trackUri = toUri('Track', trackId)
      const context_uri = toUri('Album', albumId)
      const input = { context_uri, offset: { uri: trackUri }, position_ms: positionMs }
      mutation.mutate(input)
   }

   const playAlbumIndexOffset = (playlistId: string, position: number, positionMs = 0) => {
      const context_uri = toUri('Album', playlistId)
      const input = { context_uri, offset: { position }, position_ms: positionMs }
      mutation.mutate(input)
   }

   const playTracks = (trackIds: string[]) => {
      const uris = trackIds.map(id => toUri('Track', id))
      mutation.mutate({ uris })
   }

   return {
      ...mutation,
      playTrackOffset,
      playArtist,
      playPlaylistOffset,
      playPlaylistIndexOffset,
      playAlbumOffset,
      playAlbumIndexOffset,
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

export type SearchConfig = {
   query: string
   type: SearchType[]
   options?: SearchOptions
}

export const useSearchSpotify = (
   searchConfig: SearchConfig,
   options?: UseQueryOptions<SearchResponse, unknown, SearchResponse, string[]>
) => {
   const query = searchConfig?.query
   const type = searchConfig?.type ?? []
   const searchOptions = searchConfig?.options
   const client = useSpotifyClient()
   return useQuery(['Search', query, ...type], () => client.search.search(query, type, searchOptions), options)
}

export const useInfiniteSearchSpotify = (
   search: Omit<SearchConfig, 'options'>,
   limit: number,
   options: UseInfiniteQueryOptions<SearchResponse, unknown, SearchResponse>
) => {
   const { query, type } = search ?? {}

   const client = useSpotifyClient()

   const pageQuery: QueryFunction<SearchResponse, readonly unknown[]> = ({ pageParam }) => {
      return client.search.search(query, type, { limit, offset: pageParam })
   }

   return useInfiniteQuery<SearchResponse, unknown, SearchResponse>(['SpotifySearch', query, type], pageQuery, {
      getNextPageParam: (lastPage, pages) => {
         if (
            lastPage.albums?.next ||
            lastPage.artists?.next ||
            lastPage.episodes?.next ||
            lastPage.playlists?.next ||
            lastPage.shows?.next ||
            lastPage.tracks?.next
         ) {
            return pages.length * limit
         }
         return false
      },
      ...options,
   })
}

export const useAvailableGenreSeeds = (options?: UseQueryOptions<unknown, unknown, string[], string[]>) => {
   const client = useSpotifyClient()
   return useQuery(['AvailableGenreSeeds'], () => client.browse.getAvailableGenreSeeds(), options)
}
