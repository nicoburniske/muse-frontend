import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useParams } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/lib/component/Alert'
import Hero from '@/lib/component/Hero'
import { HeroLoading } from '@/lib/component/HeroLoading'
import { DetailedReview } from '@/pages/detailedReview/DetailedReview'
import { NotFound } from '@/pages/NotFound'

export default function DetailedReviewPage() {
   const { reviewId } = useParams()

   if (reviewId) {
      return (
         // This happens more than it should because backend can't parse non-uuid.
         <ErrorBoundary
            fallback={
               <Hero>
                  <div className='h-10 w-full'>
                     <Alert variant='destructive'>
                        <ExclamationTriangleIcon className='h-4 w-4' />
                        <AlertTitle>Error Loading Review</AlertTitle>
                        <AlertDescription></AlertDescription>
                     </Alert>
                  </div>
               </Hero>
            }
         >
            <div className='flex grow bg-background'>
               <Suspense fallback={<HeroLoading />}>
                  <DetailedReview reviewId={reviewId} />
               </Suspense>
            </div>
         </ErrorBoundary>
      )
   } else {
      return <NotFound label={'Go Back Home'} />
   }
}
