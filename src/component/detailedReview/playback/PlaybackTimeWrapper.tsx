import { useNowPlayingOffsetSubscription } from 'graphql/generated/urqlSchema'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { allReviewTracks, nowPlayingTrackAtom } from 'state/Atoms'
import { nonNullable } from 'util/Utils'
import { PlaybackTime } from './PlaybackTime'

export const PlaybackTimeWrapper = ({ reviewId }: { reviewId: string }) => {
    const [latest] = useNowPlayingOffsetSubscription({ variables: { input: 1 } })
    const nowPlayingTime = latest.data?.nowPlaying
    const progressMs = nowPlayingTime?.progressMs ?? 0
    const totalDuration = nowPlayingTime?.item?.durationMs ?? Number.MAX_SAFE_INTEGER
    const isLiked = nowPlayingTime?.item?.isLiked ?? false
    const isPlaying = nowPlayingTime?.isPlaying ?? false
    const isShuffled = nowPlayingTime?.shuffleState ?? false
    const nowPlayingImage = nowPlayingTime?.item?.album?.images?.at(1) ?? ''
    const nowPlayingArtist = nowPlayingTime?.item?.artists?.map(a => a.name).join(', ') ?? ''
    const nowPlayingAlbum = nowPlayingTime?.item?.album?.name
    const nowPlayingTrackName = nowPlayingTime?.item?.name ?? ''

    const setNowPlaying = useSetAtom(nowPlayingTrackAtom)
    const nowPlaying = nowPlayingTime?.item?.id
    useEffect(() => {
        if (nonNullable(nowPlaying)) {
            setNowPlaying({ trackId: nowPlaying, isLiked: isLiked })
        }
    }, [nowPlayingTime, isLiked])

    const allTracks = useAtomValue(allReviewTracks)
    const disabled = !allTracks.has(nowPlaying ?? '')

    return (
        <PlaybackTime
            isPlaying={isPlaying}
            isLiked={isLiked}
            isShuffled={isShuffled}
            progressMs={progressMs}
            durationMs={totalDuration}
            trackId={nowPlaying ?? ''}
            reviewId={reviewId}
            disabled={disabled}
            trackImage={nowPlayingImage}
            trackName={nowPlayingTrackName}
            trackArtist={nowPlayingArtist}
        />
    )
}