import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { PrivateUser } from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { PlayOptions } from 'spotify-web-api-ts/types/types/SpotifyOptions'
import { useSpotifyClient } from './PlaybackSDK'
import { toUri } from './SpotifyClient'

export const usePlay = (options?: UseMutationOptions<unknown, unknown, PlayOptions, unknown>) => {
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

    const playTracks = (trackIds: string[]) => {
        const uris = trackIds.map(id => toUri('Track', id))
        mutation.mutate({ uris })
    }

    return {
        ...mutation,
        playTrackOffset,
        playlistOffset,
        playTracks
    }
}

export const useSaveTracksMutation = (options?: UseMutationOptions<unknown, unknown, string[], unknown>) => {
    const client = useSpotifyClient()

    return useMutation(['SaveTracks'],
        (trackIds: [string]) => client.library.saveTracks(trackIds),
        options)
}

export const useRemoveSavedTracksMutation = (options?: UseMutationOptions<unknown, unknown, string[], unknown>) => {
    const client = useSpotifyClient()

    return useMutation(['UnsaveTracks'],
        (trackIds: [string]) => client.library.removeSavedTracks(trackIds),
        options)
}

export const useTracksLikeQuery = (trackIds: string[], options?: UseQueryOptions<boolean[], unknown, boolean[], (string | string[])[]>) => {
    const client = useSpotifyClient()
    return useQuery(
        ['AreTracksSaved', trackIds],
        () => client.library.areTracksSaved(trackIds),
        options
    )
}

const useTrackLikeQueryKey = (trackId: string) => ['AreTracksSaved', trackId]
export const useTrackLikeQuery = (trackId: string, options?: UseQueryOptions<boolean, unknown, boolean, string[]>) => {
    const client = useSpotifyClient()
    return useQuery(
        useTrackLikeQueryKey(trackId),
        () => client.library.isTrackSaved(trackId),
        options
    )
}
useTrackLikeQuery.getKey = useTrackLikeQueryKey

export const useCurrentUser = (options?: UseQueryOptions<unknown, unknown, PrivateUser, string[]>) => {
    const client = useSpotifyClient()
    return useQuery(
        ['CurrentUser'],
        () => client.users.getMe(),
        options
    )
}