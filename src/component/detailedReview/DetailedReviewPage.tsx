import { useParams } from 'react-router-dom'
import { DetailedReview } from 'component/detailedReview/DetailedReview'
import { Alert, AlertSeverity } from 'component/alert/Alert'
import useWindowSize from 'hook/useWindowSize'
import { Suspense } from 'react'
import { HeroLoading } from 'component/HeroLoading'
import { ErrorBoundary } from 'react-error-boundary'
import Hero from 'component/Hero'


export default function DetailedReviewPage() {
    const { reviewId } = useParams()
    const { isSm } = useWindowSize()

    if (reviewId) {
        return (
            // This happens more than it should because backend can't parse non-uuid.
            <ErrorBoundary fallback={
                <Hero>
                    <div className='w-full h-10'>
                        <Alert severity={AlertSeverity.Error} >
                            <span> Error Loading Review </span>
                        </Alert >
                    </div>
                </Hero>
            }>
                <div className="bg-base-100 w-full h-full">
                    <Suspense fallback={<HeroLoading />}>
                        <DetailedReview reviewId={reviewId} isSm={isSm} />
                    </Suspense>
                </div>
            </ErrorBoundary>
        )
    } else {
        return (
            <Alert severity={AlertSeverity.Error}> <span> Missing Review ID </span></Alert >
        )
    }
}

