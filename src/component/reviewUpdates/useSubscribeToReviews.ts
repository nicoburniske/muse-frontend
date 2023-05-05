import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

import {
   DetailedReviewCommentsQuery,
   ReviewUpdatesSubscription,
   useDetailedReviewCommentsQuery,
} from '@/graphql/generated/schema'
import { useReviewUpdatesSubscription } from '@/graphql/generated/urqlSchema'
import { useCurrentUserId } from '@/state/CurrentUser'

import { newCommentToast } from './NewCommentToast'

export const useSubscribeToReviews = (reviewIds: string[]) => {
   const queryClient = useQueryClient()
   const currentUserId = useCurrentUserId()

   const handleReviewUpdate = useCallback(
      (_previous: ReviewUpdatesSubscription | undefined, newEvent: ReviewUpdatesSubscription) => {
         const event = newEvent?.reviewUpdates

         if (event?.__typename) {
            switch (event.__typename) {
               case 'CreatedComment': {
                  const commenterId = event.comment.commenter.id
                  if (commenterId !== currentUserId) {
                     newCommentToast(event.comment)
                  }
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
               }
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

   const [{ error }] = useReviewUpdatesSubscription(
      {
         variables: { reviewIds },
      },
      handleReviewUpdate
   )
   useEffect(() => {
      if (error) {
         toast.error('Error subscribing to review updates', { duration: 2000, id: 'review-updates-error' })
      }
   }, [error])
}
