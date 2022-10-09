import { DetailedCommentFragment, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useNowPlayingOffsetSubscription, useNowPlayingSubscription, useReviewUpdatesSubscription } from "graphql/generated/schema"
import DetailedPlaylist from "component/detailedReview/DetailedPlaylist"
import { useState } from "react"
export interface DetailedReviewProps {
  reviewId: string
}

export function DetailedReview({ reviewId }: DetailedReviewProps) {
  // State.
  const [comments, setComments] = useState<DetailedCommentFragment[]>([])
  // Subscriptions.
  const { data: nowPlaying, error: subErrors } = useNowPlayingSubscription({ variables: { input: 15 } })
  const { data: nowPlayingTime, error: subErrorsTime } = useNowPlayingOffsetSubscription({ variables: { input: 2 } })
  const { error: commentErrors } = useReviewUpdatesSubscription({
    variables: { reviewId }, onSubscriptionData: (data) => {
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
    }
  })

  // Queries.
  const { data: dataComments, loading: loadingComments, error: errorComments } = useDetailedReviewCommentsQuery({
    variables: { reviewId },
    fetchPolicy: "no-cache",
    nextFetchPolicy: "no-cache",
    pollInterval: 5 * 1000,
    onCompleted: (data) => data.review?.comments && setComments(data.review.comments)
  })
  // This only needs to happen so that playlist tracks are refreshed.
  const { data, loading, error } = useDetailedReviewQuery({
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
        return (
          <Alert severity={AlertSeverity.Warning}>
            <span> Not Implemented Yet. </span>
          </Alert >)
    }
  }

  const title = data?.review?.reviewName
  const entity = data?.review?.entity?.name
  const eType = data?.review?.entity?.__typename

  const currentPosition = nowPlayingTime?.nowPlaying?.progressMs
  const totalDuration = nowPlayingTime?.nowPlaying?.item?.durationMs
  const progress = currentPosition && totalDuration ? (currentPosition / totalDuration) * 100 : 0
  console.log("Progress", progress, currentPosition, totalDuration)

  if (loading) {
    return <h1>Loading...</h1>
  } else if (data) {
    return (
      < div className="w-full p-1">
        <h1 className="prose text-5xl underline">{title}</h1>
        <h2 className="prose text-3xl">
          {`${eType} review: ${entity}`}
        </h2>
        <progress className="progress progress-info w-56" value={progress} max="100"></progress>
        {getReviewContent()}
      </div>
    )
  }
  if (error) {
    return (
    <Alert severity={AlertSeverity.Error}>
      <span> Review Doesn't Exist </span>
    </Alert >)
  }
}

enum AlertSeverity {
  Error,
  Warning
}

const Alert = ({ severity, children }: { severity: AlertSeverity, children: JSX.Element }) => {
  const className = severity === AlertSeverity.Error ? "alert alert-error" : "alert alert-warning"
  return (
    <div className={`alert ${className} shadow-lg`}>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        {children}
      </div>
    </div>)
}