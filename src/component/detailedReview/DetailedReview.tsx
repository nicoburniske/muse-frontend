import { Alert, Box, Divider, LinearProgress, Typography } from "@mui/material"
import { DetailedCommentFragment, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useNowPlayingOffsetSubscription, useNowPlayingSubscription, useReviewUpdatesSubscription } from "graphql/generated/schema"
import DetailedPlaylist from "component/detailedReview/DetailedPlaylist"
import { isConstValueNode } from "graphql"
import { useEffect, useState } from "react"
export interface DetailedReviewProps {
  reviewId: string
}

export function DetailedReview({ reviewId }: DetailedReviewProps) {
  // State.
  const [comments, setComments] = useState<DetailedCommentFragment[]>([])
  // Subscriptions.
  const { data: nowPlaying, error: subErrors } = useNowPlayingSubscription({ variables: { input: 15 } })
  const { data: nowPlayingTime, error: subErrorsTime } = useNowPlayingOffsetSubscription({ variables: { input: 2 } })
  const { error: commentErrors } = useReviewUpdatesSubscription({ variables: { reviewId }, onSubscriptionData: (data) => {
    const commentEvent = data.subscriptionData.data?.reviewUpdates
    if (commentEvent?.__typename) {
      console.log(commentEvent)
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
  }})

  // Queries.
  const { data: dataComments, loading: loadingComments, error: errorComments } = useDetailedReviewCommentsQuery({
    variables: { reviewId },
    fetchPolicy: "no-cache",
    nextFetchPolicy: "no-cache",
    pollInterval: 5 * 1000
  })
  const { data, loading, error, refetch } = useDetailedReviewQuery({
    variables: { reviewId },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    pollInterval: 5 * 1000
  })


  if (commentErrors) {
    console.log("Errors in comment event", commentErrors)
  }
  if (subErrors || subErrorsTime) {
    console.error("Play errors", subErrors, subErrorsTime)
  }

  useEffect(() => {
    console.log("IN HERE 1")
    if (dataComments?.review?.comments) {
      setComments(dataComments?.review?.comments)
    }
  }, [dataComments])

  const getReviewContent = () => {
    const review = data?.review
    const entity = data?.review?.entity
    const usersShared = data?.review?.collaborators?.map(u => u.user.id)

    switch (entity?.__typename) {
      // case "Album":
      // case "Artist":
      // case "Track":
      case "Playlist":
        return <DetailedPlaylist
          reviewId={review.id}
          playlist={entity}
          comments={comments}
        />
      default:
        return <Alert severity="warning"> Not implemented yet </Alert >
    }
  }

  const title = data?.review?.reviewName
  const entity = data?.review?.entity?.name
  const eType = data?.review?.entity?.__typename

  const currentPosition = nowPlayingTime?.nowPlaying?.progressMs
  const totalDuration = nowPlayingTime?.nowPlaying?.item?.durationMs
  const progress = currentPosition && totalDuration ? (currentPosition / totalDuration) * 100 : 0

  if (loading) {
    return <h1>Loading...</h1>
  } else if (data) {
    return (
      < div className="w-full p-1">
        <LinearProgress variant="determinate" value={progress} />
        <h1 className="prose text-5xl underline">{title}</h1>
        <h2 className="prose text-3xl">
          {`${eType} review: ${entity}`}
        </h2>
        {getReviewContent()}
      </div>
    )
  }
  if (error) {
    return <Alert severity="error"> Review Doesn't Exist </Alert >
  }
}