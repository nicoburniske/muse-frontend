import { useParams } from "react-router-dom"
import { Alert } from "@mui/material"
import { DetailedReview } from 'component/detailedReview/DetailedReview'
// import { FixedSizeList as List, ListChildComponentProps } from 'react-window'



export default function DetailedReviewPage() {
  const { reviewId } = useParams()

  if (reviewId) {
    return (
      <div className="bg-base-300">
        <DetailedReview reviewId={reviewId} />
      </div>)
  } else {
    return (
      <Alert severity="error"> Missing Review ID </Alert >
    )
  }
}

