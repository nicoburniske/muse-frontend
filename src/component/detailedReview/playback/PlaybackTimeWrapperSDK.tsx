import { useDeviceId, usePlaybackState, useSetupPlaybackState, useSetupPlaybackStateAutoRefresh, useSpotifyPlayer } from 'component/playbackSDK/PlaybackSDK'
import { useTrackLikeQuery, useTransferPlaybackMutation } from 'graphql/generated/schema'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { nowPlayingTrackAtom } from 'state/Atoms'
import { nonNullable } from 'util/Utils'
import { PlaybackTime } from './PlaybackTime'

export const PlaybackTimeSdkWrapper = ({ reviewId }: { reviewId: string }) => {
    const deviceId = useDeviceId()
    const playbackState = usePlaybackState()
    useSetupPlaybackStateAutoRefresh({ refreshInterval: 1000 })
    useSetupNowPlayingLiked()

    // Transfer playback to browser on mount.
    const needToConnect = nonNullable(deviceId) && playbackState === null
    const { mutate, isLoading } = useTransferPlaybackMutation()
    useEffect(() => {
        if (needToConnect && !isLoading) {
            mutate({ input: { deviceId } })
        }
    }, [needToConnect])

    if (playbackState === null) {
        return <progress className="progress w-full progress-primary" />
    } else {
        const currentTrack = playbackState.track_window.current_track
        const currentAlbum = currentTrack.album

        const totalDuration = currentTrack.duration_ms
        // get largest image.
        const nowPlayingImage = currentAlbum.images.slice().reverse()[0].url
        const nowPlayingArtist = currentTrack.artists.map(a => a.name).join(', ')
        const nowPlayingTrackName = currentTrack.name

        const nowPlaying = currentTrack.id!

        return (
            <PlaybackTime
                progressMs={playbackState.position}
                durationMs={totalDuration}
                trackId={nowPlaying}
                reviewId={reviewId}
                trackImage={nowPlayingImage}
                trackName={nowPlayingTrackName}
                trackArtist={nowPlayingArtist}
            />
        )
    }
}


const useSetupNowPlayingLiked = () => {
    const playbackState = usePlaybackState()
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