import { useQueries } from '@tanstack/react-query'
import { useMemo, useRef } from 'react'
import { useDndScrolling } from 'react-dnd-scrolling'

import { ReviewOverview } from '@/component/trackTable/Helpers'
import {
   DetailedCommentFragment,
   DetailedReviewCommentsQuery,
   useDetailedReviewCommentsQuery,
} from '@/graphql/generated/schema'
import { groupBy, nonNullable } from '@/util/Utils'

import { DeleteCommentConfirmation } from './DeleteCommentConfirmation'
import DetailedComment from './DetailedComment'

const selectComments = (data: DetailedReviewCommentsQuery) => data.review?.comments ?? []

export default function ReviewCommentSection({ reviews }: { reviews: ReviewOverview[] }) {
   const reviewIds = reviews.map(r => r.reviewId)

   const results = useQueries({
      queries: reviewIds.map(reviewId => ({
         queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }),
         queryFn: useDetailedReviewCommentsQuery.fetcher({ reviewId }),
         select: selectComments,
         staleTime: 60 * 1000,
      })),
   })

   const reviewOverviews = groupBy(
      reviews,
      r => r.reviewId,
      r => r
   )

   // Sort comments by review position and then by comment index.
   const comments = useMemo(() => {
      const reviewsIndexed = new Map(reviews.map((r, index) => [r.reviewId, index]))
      const flatComments = results.flatMap(c => c.data?.filter(nonNullable) ?? [])

      return flatComments.sort(
         (a, b) => reviewsIndexed.get(a.reviewId)! - reviewsIndexed.get(b.reviewId)! || a.commentIndex - b.commentIndex
      )
   }, [reviews, results])

   const rootComments = useMemo(() => comments.filter(comment => comment.parentCommentId === null), [comments])
   const ref = useRef<HTMLDivElement>(null)
   useDndScrolling(ref, {})

   return (
      <>
         <div
            className='muse-comments muse-scrollbar flex flex-1 flex-col space-y-1 overflow-y-auto overflow-x-hidden'
            ref={ref}
         >
            {rootComments.map((c: DetailedCommentFragment) => (
               <DetailedComment key={c.id} review={reviewOverviews.get(c.reviewId)?.at(0)!} comment={c} />
            ))}
         </div>
         <DeleteCommentConfirmation />
      </>
   )
}
