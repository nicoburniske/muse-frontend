import { useParams } from "react-router-dom"
import { DetailedReview } from 'component/detailedReview/DetailedReview'
import { Alert, AlertSeverity } from "component/Alert"


export default function DetailedReviewPage() {
  const { reviewId } = useParams()

  if (reviewId) {
    return (
      <div className="bg-base-300 w-full h-full">
        <DetailedReview reviewId={reviewId} />
      </div>)
  } else {
    return (
      <Alert severity={AlertSeverity.Error}> <span>Missing Review ID </span></Alert >
    )
  }
}

