import { useTrackLikeQuery } from 'component/sdk/ClientHooks'
import { useLatestPlaybackState, useSyncPlaybackState } from 'component/sdk/PlaybackSDK'
import { useSetAtom } from 'jotai'
import { Suspense, useEffect } from 'react'
import { nowPlayingTrackAtom } from 'state/Atoms'
import { nonNullable } from 'util/Utils'
import { SpotifyPlayerFallback } from './SpotifyPlayer'
import { useTransferPlaybackOnMount } from './TransferPlayback'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, AlertSeverity } from 'platform/component/Alert'

export const SpotifyPlayerWrapper = () => {
    return (
        <ErrorBoundary fallback={
            <div className='w-full h-full bg-neutral'>
                <Alert severity={AlertSeverity.Error} className='w-52 m-auto'>
                    <span> Error Starting Playback </span>
                </Alert >
            </div>
        }>
            <Suspense fallback={
                <div className="w-full h-full bg-neutral">
                    <progress className="progress progress-primary bg-neutral" />
                </div>
            }>
                <SpotifyPlayerSync />
            </Suspense>
        </ErrorBoundary>
    )
}

const SpotifyPlayerSync = () => {
    useSyncPlaybackState()
    useSyncNowPlayingLiked()
    useTransferPlaybackOnMount()

    return (
        <SpotifyPlayerFallback />
    )
}

const useSyncNowPlayingLiked = () => {
    const playbackState = useLatestPlaybackState()
    const nowPlaying = playbackState?.track_window?.current_track?.id
    const setNowPlaying = useSetAtom(nowPlayingTrackAtom)

    const { data } = useTrackLikeQuery(
        nowPlaying!,
        {
            enabled: nonNullable(nowPlaying),
            staleTime: 10 * 1000
        },
    )
    const isLiked = data ?? undefined
    useEffect(() => {
        if (nonNullable(nowPlaying) && nonNullable(isLiked)) {
            setNowPlaying({ trackId: nowPlaying, isLiked })
        } else {
            setNowPlaying(undefined)
        }
    }, [nowPlaying, isLiked])

    return isLiked
}
