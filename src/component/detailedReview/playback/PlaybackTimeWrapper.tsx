import { useNowPlayingOffsetSubscription } from 'graphql/generated/urqlSchema'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { currentlyPlayingTrackAtom } from 'state/Atoms'
import { PlaybackTime } from './PlaybackTime'

export const PlaybackTimeWrapper = ({ reviewId, disabled }: { reviewId: string, disabled: boolean }) => {
    const [ latest ]= useNowPlayingOffsetSubscription({ variables: { input: 1 } })
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

    const setNowPlaying = useSetAtom(currentlyPlayingTrackAtom)
    const nowPlaying = nowPlayingTime?.item?.id
    useEffect(() => {
        setNowPlaying(nowPlaying)
    }, [nowPlayingTime])

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
            trackArtist={nowPlayingArtist} />
    )
}