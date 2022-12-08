import { useDeviceId, usePlaybackStateSync, useSetupPlaybackState, useSetupPlaybackStateAutoRefresh } from 'component/playbackSDK/PlaybackSDK'
import { useTrackLikeQuery, useTransferPlaybackMutation } from 'graphql/generated/schema'
import { useSetAtom } from 'jotai'
import { Suspense, useEffect } from 'react'
import { nowPlayingTrackAtom } from 'state/Atoms'
import { nonNullable } from 'util/Utils'
import { PlaybackTime } from './PlaybackTime'

export const PlaybackTimeSdkWrapper = ({ reviewId }: { reviewId: string }) => {
    useSetupPlaybackState()
    useSetupPlaybackStateAutoRefresh({ refreshInterval: 1000 })
    useSetupNowPlayingLiked()
    useTransferPlayback()

    return (
        <Suspense fallback={<progress className="progress w-full progress-primary" />}>
            <PlaybackTime reviewId={reviewId} />
        </Suspense>
    )
}

const useSetupNowPlayingLiked = () => {
    const playbackState = usePlaybackStateSync()
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

const useTransferPlayback = () => {
    const playbackState = usePlaybackStateSync()
    const deviceId = useDeviceId()
    // Transfer playback to browser on mount.
    const needToConnect = deviceId && playbackState === null
    const { mutate, isLoading } = useTransferPlaybackMutation()
    useEffect(() => {
        if (needToConnect && !isLoading) {
            mutate({ input: { deviceId } })
        }
    }, [needToConnect])
}