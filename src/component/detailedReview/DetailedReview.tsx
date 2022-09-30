import { Alert } from "@mui/material"
import { useDetailedReviewCommentsQuery, useDetailedReviewQuery } from "graphql/generated/schema"
import DetailedPlaylist from "component/detailedReview/DetailedPlaylistReview"

export interface DetailedReviewProps {
    reviewId: string
  }

export function DetailedReview({ reviewId }: DetailedReviewProps) {
    const { data, loading, error, refetch } = useDetailedReviewQuery({
      variables: { reviewId },
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first"
    })
    // TODO: consider some streaming here? 
    const { data: dataComments, loading: loadingComments, error: errorComments, refetch: refetchComments } = useDetailedReviewCommentsQuery({
      variables: { reviewId },
      fetchPolicy: "no-cache",
      nextFetchPolicy: "no-cache"
    })
  
    const comments = dataComments?.review?.comments ?? []
  
    const updateComments = async () => {
      await refetchComments()
      console.log("Refreshed Comments")
    }
  
    if (loading) {
      return <h1>Loading...</h1>
    } else if (data) {
      // TODO: include header that's common between Detailed components
      const review = data.review
      const entity = data.review?.entity
      const usersShared = data.review?.collaborators?.map(u => u.user.id)
  
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
    } if (error) {
      return <Alert severity="error"> Review Doesn't Exist </Alert >
    }
  }