import { DetailedCommentFragment, EntityType, useAvailableDevicesSubscription, useCreateCommentMutation, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useNowPlayingOffsetSubscription, useReviewUpdatesSubscription } from "graphql/generated/schema"
import DetailedPlaylist from "component/detailedReview/DetailedPlaylist"
import { useEffect, useMemo, useState } from "react"
import { useSetAtom } from "jotai"
import { playbackDevicesAtom, currentlyPlayingTrackAtom, selectedTrackAtom, openCommentModalAtom } from "state/Atoms"
import { ShareReview } from "./ShareReview"
import { Alert, AlertSeverity } from "component/Alert"
import { HeroLoading } from "component/HeroLoading"
import { toast } from "react-toastify"
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

  const { data: nowPlayingTime, error: subErrorsTime } = useNowPlayingOffsetSubscription({ variables: { input: 2 } })
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
  const progress = useMemo(() => {
    const totalDuration = nowPlayingTime?.nowPlaying?.item?.durationMs
    const progress = progressMs && totalDuration ? (progressMs / totalDuration) * 100 : 0
    return progress
  }, [nowPlayingTime])

  const setNowPlaying = useSetAtom(currentlyPlayingTrackAtom)
  const setSelectedTrack = useSetAtom(selectedTrackAtom)
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
        console.log("HERE", isPlaying)
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
      < div className="w-full p-1">
        <div className="mt-0 flex flex-row justify-start space-x-5 items-center">
          <div className="avatar">
            <div className="w-28 rounded">
              <img src={reviewEntityImage} />
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">{`${eType} Review`}</div>
              <div className="stat-value">{title}</div>
              <div className="stat-desc"> by {creator}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">{"Playlist"}</div>
              <div className="stat-value">{entityName}</div>
              <div className="stat-desc"> by {entityCreator}</div>
            </div>
          </div>
          {collaboratorImages}
          <ShareReview reviewId={reviewId} />
          <PlayingTime time={progressMs} trackId={nowPlaying ?? ""} reviewId={reviewId} disabled={!isPlayingPartOfEntity} />
          {/* <div className="mt-2 flex items-center text-sm text-secondary-content font-light">
              {collaborators} 
            </div> */}
        </div>
        <progress className="progress progress-success w-100 h-2" value={progress} max="100" onClick={() => setSelectedTrack(nowPlaying)}></progress>
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

function PlayingTime({ time, trackId, reviewId, disabled }: { time: number, trackId: string, reviewId: string, disabled: boolean }) {
  const setCommentModal = useSetAtom(openCommentModalAtom)
  const [createComment,] = useCreateCommentMutation({ onCompleted: () => { toast.success("comment created"); setCommentModal(undefined) } })
  const onSubmit = (comment: string) =>
    createComment({ variables: { input: { comment, entityId: trackId, entityType: EntityType.Track, reviewId } } })
      .then(() => { })

  const [h, m, s, ms] = useMemo(() => msToTime(time), [time])

  const showModal = () => {
    const paddedS = s < 10 ? `0${s}` : s
    const initialValue = `<Stamp at="${m}:${paddedS}" />`
    const values = { title: "create comment", onCancel: () => setCommentModal(undefined), onSubmit, initialValue }
    setCommentModal(values)
  }

  const tooltipContent = disabled ? "Not part of this review" : "Comment at timestamp"

  return (
    <div className="tooltip tooltip-right" data-tip={tooltipContent}>
      <button className="hover:bg-neutral hover:text-neutral-content" onClick={showModal} disabled={disabled}>
        <span className="countdown font-mono text-2xl">
          <span style={{ "--value": m }}></span>:
          <span style={{ "--value": s }}></span>
        </span>
      </button>
    </div>
  )
}

function msToTime(duration: number) {
  const
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    seconds = Math.floor((duration / 1000) % 60),
    milliseconds = Math.floor((duration % 1000) / 100)

  return [hours, minutes, seconds, milliseconds]
}
