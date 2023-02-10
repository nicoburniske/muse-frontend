import {
   DetailedCommentFragment,
   DetailedReviewCommentsQuery,
   ReviewUpdatesSubscription,
   useDetailedReviewCommentsQuery,
} from 'graphql/generated/schema'
import { useCallback, useMemo, useRef } from 'react'
import { groupBy, nonNullable } from 'util/Utils'
import DetailedComment from './comment/DetailedComment'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { ReviewOverview } from './table/Helpers'
import { useReviewUpdatesSubscription } from 'graphql/generated/urqlSchema'
import { DeleteCommentConfirmation } from './comment/DeleteCommentConfirmation'
import { useDndScrolling } from 'react-dnd-scrolling'

const selectComments = (data: DetailedReviewCommentsQuery) => data.review?.comments ?? []

export default function ReviewCommentSection({ reviews }: { reviews: ReviewOverview[] }) {
   const reviewIds = reviews.map(r => r.reviewId)
   subscribeToReviews(reviewIds)

   const results = useQueries({
      queries: reviewIds.map(reviewId => ({
         queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }),
         queryFn: useDetailedReviewCommentsQuery.fetcher({ reviewId }),
         select: selectComments,
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
         <div className='flex flex-1 flex-col space-y-1 overflow-y-auto' ref={ref}>
            {rootComments.map((c: DetailedCommentFragment) => (
               <DetailedComment key={c.id} review={reviewOverviews.get(c.reviewId)?.at(0)!} comment={c} />
            ))}
         </div>
         <DeleteCommentConfirmation />
      </>
   )
}

const subscribeToReviews = (reviewIds: string[]) => {
   const queryClient = useQueryClient()

   const handleReviewUpdate = useCallback(
      (_previous: ReviewUpdatesSubscription | undefined, newEvent: ReviewUpdatesSubscription) => {
         const event = newEvent?.reviewUpdates

         if (event?.__typename) {
            switch (event.__typename) {
               case 'CreatedComment':
                  queryClient.setQueryData<DetailedReviewCommentsQuery>(
                     useDetailedReviewCommentsQuery.getKey({ reviewId: event.comment.reviewId }),
                     data => {
                        if (data === undefined) {
                           return undefined
                        }
                        const comments = data?.review?.comments ?? []
                        const updatedCommentId = event.comment.id
                        const newComments = comments.filter(comment => comment.id !== updatedCommentId)
                        newComments.push(event.comment)
                        return {
                           review: {
                              ...data?.review,
                              comments: newComments,
                           },
                        }
                     }
                  )
                  break
               case 'UpdatedComment':
                  queryClient.setQueryData<DetailedReviewCommentsQuery>(
                     useDetailedReviewCommentsQuery.getKey({ reviewId: event.comment.reviewId }),
                     data => {
                        if (data === undefined) {
                           return undefined
                        }
                        const comments = data?.review?.comments ?? []
                        const updatedCommentId = event.comment.id
                        const filtered = comments.filter(comment => comment.id !== updatedCommentId)
                        filtered.push(event.comment)
                        return {
                           review: {
                              ...data?.review,
                              comments: filtered,
                           },
                        }
                     }
                  )
                  break
               case 'DeletedComment': {
                  const cacheKey = useDetailedReviewCommentsQuery.getKey({ reviewId: event.reviewId })
                  queryClient.setQueryData<DetailedReviewCommentsQuery>(cacheKey, data => {
                     const comments = data?.review?.comments ?? []
                     const deletedCommentId = event.commentId
                     const removeDeleted = comments.filter(comment => comment.id !== deletedCommentId)
                     return {
                        review: {
                           ...data?.review,
                           comments: removeDeleted,
                        },
                     }
                  })
                  break
               }
               default:
                  console.error('Unhandled review update event', event)
            }
         }
         return newEvent
      },
      [queryClient]
   )

   useReviewUpdatesSubscription(
      {
         variables: { reviewIds },
      },
      handleReviewUpdate
   )
}
