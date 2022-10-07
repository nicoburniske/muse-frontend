import { Alert, Box, Divider, LinearProgress, Typography } from "@mui/material"
import { useDetailedReviewCommentsQuery, useDetailedReviewQuery, useNowPlayingOffsetSubscription, useNowPlayingSubscription } from "graphql/generated/schema"
import DetailedPlaylist from "component/detailedReview/DetailedPlaylist"
export interface DetailedReviewProps {
  reviewId: string
}

export function DetailedReview({ reviewId }: DetailedReviewProps) {
  const { data: nowPlaying, error: subErrors } = useNowPlayingSubscription({ variables: { input: 15 } })
  const { data: nowPlayingTime, error: subErrorsTime } = useNowPlayingOffsetSubscription({ variables: { input: 2 } })
  if (subErrors || subErrorsTime) {
    console.error("Play errors", subErrors, subErrorsTime)
  }

  const { data, loading, error, refetch } = useDetailedReviewQuery({
    variables: { reviewId },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first"
  })
  // TODO: consider some streaming here? 
  const { data: dataComments, loading: loadingComments, error: errorComments, refetch: refetchComments } = useDetailedReviewCommentsQuery({
    variables: { reviewId },
    fetchPolicy: "no-cache",
    nextFetchPolicy: "no-cache",
    pollInterval: 60 * 1000
  })

  const updateComments = async () => {
    await refetchComments()
    console.log("Refreshed Comments")
  }

  const getReviewContent = () => {
    const review = data?.review
    const entity = data?.review?.entity
    const usersShared = data?.review?.collaborators?.map(u => u.user.id)
    const comments = dataComments?.review?.comments ?? []

    switch (entity?.__typename) {
      // case "Album":
      // case "Artist":
      // case "Track":
      case "Playlist":
        return <DetailedPlaylist
          reviewId={review.id}
          playlist={entity}
          comments={comments}
          updateComments={updateComments}
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