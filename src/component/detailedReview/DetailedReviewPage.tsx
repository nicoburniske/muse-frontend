import { useDetailedReviewQuery } from 'graphql/generated/schema'
import { useParams, useLocation } from "react-router-dom"
import { Alert } from "@mui/material"
import { useEffect } from 'react'

interface DetailedReviewProps {
  reviewId: string
}

export default function DetailedReviewPage() {
  const params = useParams()
  useEffect(() => {
    console.log(params)
  }, [params])

  if (params.reviewId) {

  } else {
    return (
      <Alert severity="error"> Missing Review ID </Alert >
    )
  }
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
