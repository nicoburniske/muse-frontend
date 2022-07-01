import { useDetailedReviewQuery } from 'graphql/generated/schema';

interface DetailedReviewProps {
  reviewId: string
}
function DetailedReview({ reviewId }: DetailedReviewProps) {
  const { data, loading, error } = useDetailedReviewQuery({
    variables: {
      reviewId
    },
  })
  if (data) {
    const review = data.review
    const entity = data.review?.entity
    switch (entity?.__typename) {
      case "Album":
      case "Artist":
      case "Playlist":
      case "Track":
      default:
        return "Error loading"
    }
  }
}
