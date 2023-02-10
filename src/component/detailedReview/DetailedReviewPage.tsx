import { useParams } from 'react-router-dom'
import { DetailedReview } from 'component/detailedReview/DetailedReview'
import { Alert, AlertSeverity } from 'platform/component/Alert'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Hero from 'platform/component/Hero'
import { HeroLoading } from 'platform/component/HeroLoading'

export default function DetailedReviewPage() {
   const { reviewId } = useParams()

   if (reviewId) {
      return (
         // This happens more than it should because backend can't parse non-uuid.
         <ErrorBoundary
            fallback={
               <Hero>
                  <div className='h-10 w-full'>
                     <Alert severity={AlertSeverity.Error}>
                        <span> Error Loading Review </span>
                     </Alert>
                  </div>
               </Hero>
            }
         >
            <div className='flex grow bg-base-100'>
               <Suspense fallback={<HeroLoading />}>
                  <DetailedReview reviewId={reviewId} />
               </Suspense>
            </div>
         </ErrorBoundary>
      )
   } else {
      return (
         <Alert severity={AlertSeverity.Error}>
            {' '}
            <span> Missing Review ID </span>
         </Alert>
      )
   }
}
