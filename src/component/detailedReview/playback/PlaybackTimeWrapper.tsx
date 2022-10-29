import { useNowPlayingOffsetSubscription } from "graphql/generated/schema"
import { useSetAtom } from "jotai"
import { useEffect } from "react"
import { currentlyPlayingTrackAtom } from "state/Atoms"
import { PlaybackTime } from "./PlaybackTime"

export const PlaybackTimeWrapper = ({ reviewId, disabled }: { reviewId: string, disabled: boolean }) => {
    const { data: nowPlayingTime } = useNowPlayingOffsetSubscription({ variables: { input: 1 } })
    const progressMs = nowPlayingTime?.nowPlaying?.progressMs ?? 0
    const totalDuration = nowPlayingTime?.nowPlaying?.item?.durationMs ?? Number.MAX_SAFE_INTEGER
    const isLiked = nowPlayingTime?.nowPlaying?.item?.isLiked ?? false
    const isPlaying = nowPlayingTime?.nowPlaying?.isPlaying ?? false
    const isShuffled = nowPlayingTime?.nowPlaying?.shuffleState ?? false
    const nowPlayingImage = nowPlayingTime?.nowPlaying?.item?.album?.images?.at(1) ?? ""
    const nowPlayingArtist = nowPlayingTime?.nowPlaying?.item?.artists?.map(a => a.name).join(", ") ?? ""
    const nowPlayingAlbum = nowPlayingTime?.nowPlaying?.item?.album?.name
    const nowPlayingTrackName = nowPlayingTime?.nowPlaying?.item?.name ?? ""

    const setNowPlaying = useSetAtom(currentlyPlayingTrackAtom)
    const nowPlaying = nowPlayingTime?.nowPlaying?.item?.id
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
            trackId={nowPlaying ?? ""}
            reviewId={reviewId}
            disabled={disabled}
            trackImage={nowPlayingImage}
            trackName={nowPlayingTrackName}
            trackArtist={nowPlayingArtist} />
    )
}