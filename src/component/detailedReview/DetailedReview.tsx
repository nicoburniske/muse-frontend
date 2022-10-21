import { DetailedCommentFragment, useAvailableDevicesSubscription, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useNowPlayingOffsetSubscription, useReviewUpdatesSubscription, useSeekPlaybackMutation } from "graphql/generated/schema"
import DetailedPlaylist from "component/detailedReview/DetailedPlaylist"
import { useEffect, useMemo, useState } from "react"
import { useSetAtom } from "jotai"
import { playbackDevicesAtom, currentlyPlayingTrackAtom, searchAtom } from "state/Atoms"
import { ShareReview } from "./ShareReview"
import { Alert, AlertSeverity } from "component/Alert"
import { HeroLoading } from "component/HeroLoading"
import { CommentFormModalWrapper } from "./commentForm/CommentFormModalWrapper"
import { PlaybackTime } from "./PlaybackTime"
export interface DetailedReviewProps {
  reviewId: string
}

export function DetailedReview({ reviewId }: DetailedReviewProps) {
  // State.
  const [comments, setComments] = useState<DetailedCommentFragment[]>([])

  // Subscriptions.
  // Update jotai atom with playback devices.
  const setDevices = useSetAtom(playbackDevicesAtom)
  useAvailableDevicesSubscription({
    onSubscriptionData: (data) => {
      if (data.subscriptionData.data?.availableDevices) {
        setDevices(data.subscriptionData.data.availableDevices)
      } else {
        setDevices([])
      }
    }
  })

  const { data: nowPlayingTime, error: subErrorsTime } = useNowPlayingOffsetSubscription({ variables: { input: 1 } })
  const { error: commentErrors } = useReviewUpdatesSubscription({
    variables: { reviewId }, onSubscriptionData: (data) => {
      const commentEvent = data.subscriptionData.data?.reviewUpdates
      if (commentEvent?.__typename) {
        switch (commentEvent.__typename) {
          case "CreatedComment":
            setComments([...comments, commentEvent.comment])
            break;
          case "UpdatedComment":
            const updatedCommentId = commentEvent.comment.id
            const filtered = comments.filter(comment => comment.id !== updatedCommentId)
            filtered.push(commentEvent.comment)
            setComments(filtered)
            break;
          case "DeletedComment":
            const deletedCommentId = commentEvent.commentId
            const removeDeleted = comments.filter(comment => comment.id !== deletedCommentId)
            setComments(removeDeleted)
            break;
          default:
            console.error("Unhandled review update event", commentEvent)
        }
      }
    }
  })

  // Queries.
  useDetailedReviewCommentsQuery({
    variables: { reviewId },
    fetchPolicy: "cache-first",
    pollInterval: 5 * 60 * 1000,
    onCompleted: (data) => data.review?.comments && setComments(data.review.comments)
  })
  // This only needs to happen so that playlist tracks are refreshed.
  const { data, loading, error } = useDetailedReviewQuery({
    variables: { reviewId },
    pollInterval: 5 * 60 * 1000
  })

  if (commentErrors) {
    console.error("Errors in comment event", commentErrors)
  }
  if (subErrorsTime) {
    console.error("Play errors", subErrorsTime)
  }

  const getReviewContent = useMemo(() => {
    const review = data?.review
    const entity = data?.review?.entity
    switch (entity?.__typename) {
      // case "Album":
      // case "Artist":
      // case "Track":
      case "Playlist":
        return <DetailedPlaylist
          reviewId={review?.id as string}
          playlist={entity}
          comments={comments}
        />
      default:
        return (
          <Alert severity={AlertSeverity.Warning}>
            <span> Not Implemented Yet. </span>
          </Alert >)
    }
  }, [data, comments])

  const title = data?.review?.reviewName
  const entityName = data?.review?.entity?.name
  const eType = data?.review?.entity?.__typename
  const collaborators = data?.review?.collaborators?.map(u => u.user.id).join(", ")
  const creator = data?.review?.creator.spotifyProfile?.displayName ?? data?.review?.creator.id
  const reviewEntityImage = (() => {
    const entity = data?.review?.entity
    switch (entity?.__typename) {
      case "Artist":
        return entity?.artistImages?.at(0)
      case "Playlist":
      case "Album":
        return entity?.images.at(0)
      case "Track":
        return entity?.album?.images.at(0)
    }
  })()

  const entityCreator = (() => {
    const entity = data?.review?.entity
    switch (entity?.__typename) {
      case "Artist":
        return null
      case "Playlist":
        return entity?.owner?.spotifyProfile?.displayName ?? null
      case "Album":
        return null
      case "Track":
        return entity?.artists?.at(0)?.name
    }
  })()

  const progressMs = nowPlayingTime?.nowPlaying?.progressMs ?? 0
  const totalDuration = nowPlayingTime?.nowPlaying?.item?.durationMs ?? Number.MAX_SAFE_INTEGER
  const isPlaying = nowPlayingTime?.nowPlaying?.isPlaying ?? false
  const nowPlayingImage = nowPlayingTime?.nowPlaying?.item?.album?.images?.at(1) ?? ""
  const nowPlayingArtist = nowPlayingTime?.nowPlaying?.item?.artists?.map(a => a.name).join(", ") ?? ""
  const nowPlayingAlbum = nowPlayingTime?.nowPlaying?.item?.album?.name
  const nowPlayingTrackName = nowPlayingTime?.nowPlaying?.item?.name ?? ""

  const setNowPlaying = useSetAtom(currentlyPlayingTrackAtom)
  const nowPlaying = nowPlayingTime?.nowPlaying?.item?.id
  useEffect(() => {
    setNowPlaying(nowPlaying)
  }, [nowPlayingTime])

  const isPlayingPartOfEntity: boolean = useMemo(() => {
    const entity = data?.review?.entity
    switch (entity?.__typename) {
      case "Artist":
        return false
      case "Playlist":
        const isPlaying = entity?.tracks?.some(t => t.track.id === nowPlaying)
        return isPlaying === undefined ? false : isPlaying
      case "Album":
        return false
      case "Track":
        return entity?.id === nowPlaying
      default:
        return false
    }
  }, [data, nowPlaying])

  const collaboratorImages = useMemo(() => {
    return (
      <div className="avatar-group -space-x-6">
        {data?.review?.collaborators
          ?.map(u => u?.user?.spotifyProfile?.images?.at(-2))
          .filter(i => i).map(imageSource =>
            <div className="w-12" key={imageSource}>
              <img src={imageSource} />
            </div>
          )
        }
      </div>)
  }, [data])

  if (loading) {
    return <HeroLoading />
  } else if (data) {
    return (
      < div className="w-full h-full p-1">
        <div className="mt-0 flex flex-row justify-around items-center w-full h-[10%]">
          <div className="flex flex-row items-center justify-start space-x-1 w-1/2 h-full">
            <div className="w-16 md:w-24 lg:w-32 avatar">
              <div className=" rounded">
                <img className="scale-100" src={reviewEntityImage} />
              </div>
            </div>
            <div className="stats shadow w-max h-full">
              <div className="stat">
                <div className="stat-title truncate ">{`${eType} Review`}</div>
                <div className="stat-value ">{title}</div>
                <div className="stat-desc"> by {creator}</div>
              </div>
            </div>
            <div className="stats shadow ">
              <div className="stat h-full w-max">
                <div className="stat-title">{"Playlist"}</div>
                <div className="stat-value text-xl text-clip overflow-hidden">{entityName}</div>
                <div className="stat-desc"> by {entityCreator}</div>
              </div>
            </div>
            {collaboratorImages}
            <ShareReview reviewId={reviewId} />
          </div>
          <div className='w-1/2 flex flex-row justify-center'>
            <PlaybackTime
              isPlaying={isPlaying}
              progressMs={progressMs}
              durationMs={totalDuration}
              trackId={nowPlaying ?? ""}
              reviewId={reviewId}
              disabled={!isPlayingPartOfEntity}
              trackImage={nowPlayingImage}
              trackName={nowPlayingTrackName}
              trackArtist={nowPlayingArtist} />
          </div>
          <CommentFormModalWrapper />
        </div>
        <div className="divider m-0 p-0 h-3" />
        {getReviewContent}
      </div>
    )
  }
  if (error) {
    return (
      <Alert severity={AlertSeverity.Error}>
        <span> Error Loading Review </span>
      </Alert >)
  }
}
