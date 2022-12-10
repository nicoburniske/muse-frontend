import { useLatestPlaybackState, useSyncPlaybackState, useSyncPlaybackStateInterval } from 'component/playbackSDK/PlaybackSDK'
import { useTrackLikeQuery } from 'graphql/generated/schema'
import { useSetAtom } from 'jotai'
import { Suspense, useEffect } from 'react'
import { nowPlayingTrackAtom } from 'state/Atoms'
import { nonNullable } from 'util/Utils'
import { SpotifyPlayerFallback } from './SpotifyPlayer'
import { useTransferPlaybackOnMount } from './TransferPlayback'

export const SpotifyPlayerWrapper = ({ reviewId }: { reviewId: string }) => {
    useSyncPlaybackState()
    useSyncPlaybackStateInterval({ refreshInterval: 1000 })
    useSetupNowPlayingLiked()
    useTransferPlaybackOnMount()

    return (
        <Suspense fallback={
            <progress className="progress w-full progress-primary" />
        }>
            <SpotifyPlayerFallback reviewId={reviewId} />
        </Suspense>
    )
}

const useSetupNowPlayingLiked = () => {
    const playbackState = useLatestPlaybackState()
    const nowPlaying = playbackState?.track_window?.current_track?.id
    const setNowPlaying = useSetAtom(nowPlayingTrackAtom)

    const { data } = useTrackLikeQuery(
        { id: nowPlaying! },
        {
            enabled: nonNullable(nowPlaying),
            staleTime: 5 * 1000
        },
    )
    const isLiked = data?.getTrack?.isLiked ?? undefined
    useEffect(() => {
        if (nonNullable(nowPlaying) && nonNullable(isLiked)) {
            setNowPlaying({ trackId: nowPlaying, isLiked })
        } else {
            setNowPlaying(undefined)
        }
    }, [nowPlaying, isLiked])

    return isLiked
}
