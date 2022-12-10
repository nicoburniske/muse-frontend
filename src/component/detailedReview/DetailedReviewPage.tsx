import { useParams } from 'react-router-dom'
import { DetailedReview } from 'component/detailedReview/DetailedReview'
import { Alert, AlertSeverity } from 'component/Alert'
import useWindowSize from 'hook/useWindowSize'
import { Suspense } from 'react'
import { HeroLoading } from 'component/HeroLoading'
import { ErrorBoundary } from 'react-error-boundary'


export default function DetailedReviewPage() {
    const { reviewId } = useParams()
    const { isSm } = useWindowSize()

    if (reviewId) {
        return (
            <ErrorBoundary fallback={
                <Alert severity={AlertSeverity.Error}>
                    <span> Error Loading Review </span>
                </Alert >
            }>
                <div className="bg-base-300 w-full h-full">
                    <Suspense fallback={<HeroLoading />}>
                        <DetailedReview reviewId={reviewId} isSm={isSm} />
                    </Suspense>
                </div>
            </ErrorBoundary>
        )
    } else {
        return (
            <Alert severity={AlertSeverity.Error}> <span>Missing Review ID </span></Alert >
        )
    }
}

