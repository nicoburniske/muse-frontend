import { useDeviceId, usePlaybackState, useSetupPlaybackStateAutoRefresh } from 'component/playbackSDK/PlaybackSDK'
import { useTrackLikeQuery, useTransferPlaybackMutation } from 'graphql/generated/schema'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { allReviewTracks, nowPlayingTrackAtom } from 'state/Atoms'
import { nonNullable } from 'util/Utils'
import { PlaybackTime } from './PlaybackTime'

export const PlaybackTimeSdkWrapper = ({ reviewId }: { reviewId: string }) => {
    const deviceId = useDeviceId()
    const playbackState = usePlaybackState()
    useSetupPlaybackStateAutoRefresh({ refreshInterval: 1000 })
    const allTracks = useAtomValue(allReviewTracks)


    const nowPlaying = playbackState?.track_window?.current_track?.id
    const isLiked = useNowPlayingLiked(nowPlaying)

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
        const isPlaying = !playbackState.paused
        const isShuffled = playbackState.shuffle
        // get largest image.
        const nowPlayingImage = currentAlbum.images.slice().reverse()[0].url
        const nowPlayingArtist = currentTrack.artists.map(a => a.name).join(', ')
        const nowPlayingTrackName = currentTrack.name

        const nowPlaying = currentTrack.id ?? ''
        const disabled = !allTracks.has(nowPlaying ?? '')

        return (
            <PlaybackTime
                isPlaying={isPlaying}
                isLiked={isLiked ?? false}
                isShuffled={isShuffled}
                progressMs={playbackState.position}
                durationMs={totalDuration}
                trackId={nowPlaying}
                reviewId={reviewId}
                disabled={disabled}
                trackImage={nowPlayingImage}
                trackName={nowPlayingTrackName}
                trackArtist={nowPlayingArtist}
            />
        )
    }
}


const useNowPlayingLiked = (nowPlaying: string | null | undefined) => {
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
            setNowPlaying(t => {
                if (t?.isLiked !== isLiked || t?.trackId !== nowPlaying) {
                    return { trackId: nowPlaying, isLiked: isLiked }
                }
            })
        } else {
            setNowPlaying(undefined)
        }
    }, [nowPlaying, isLiked])

    return isLiked
}