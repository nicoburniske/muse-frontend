import {
   DetailedCommentFragment,
   DetailedReviewCommentsQuery,
   ReviewUpdatesSubscription,
   useDetailedReviewCommentsQuery,
} from 'graphql/generated/schema'
import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'
import { groupBy, nonNullable } from 'util/Utils'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { useReviewUpdatesSubscription } from 'graphql/generated/urqlSchema'
import { useDndScrolling } from 'react-dnd-scrolling'
import toast, { Toast } from 'react-hot-toast'
import { useCurrentUserId } from 'state/CurrentUser'
import { Transition } from '@headlessui/react'
import { useThemeValue } from 'state/UserPreferences'
import { ReviewOverview } from '../table/Helpers'
import DetailedComment from './DetailedComment'
import { DeleteCommentConfirmation } from './DeleteCommentConfirmation'
import { useOpenNewComment } from '../commentForm/useOpenNewComment'

const selectComments = (data: DetailedReviewCommentsQuery) => data.review?.comments ?? []

export default function ReviewCommentSection({ reviews }: { reviews: ReviewOverview[] }) {
   const reviewIds = reviews.map(r => r.reviewId)
   useSubscribeToReviews(reviewIds)

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

const useSubscribeToReviews = (reviewIds: string[]) => {
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
         toast.error('Error subscribing to review updates', { duration: 2000 })
      }
   }, [error])
}

const newCommentToast = (c: DetailedCommentFragment) =>
   toast.custom((t: Toast) => <NewCommentToast comment={c} t={t} />, { duration: 5000 })

const NewCommentToast = ({ comment, t }: { comment: DetailedCommentFragment; t: Toast }) => {
   const displayName = comment.commenter?.spotifyProfile?.displayName ?? comment.commenter?.id
   const theme = useThemeValue()
   const images = comment.commenter.spotifyProfile?.images
   const image = images?.at(1) ?? images?.at(0)

   const replyComment = useOpenNewComment({
      reviewId: comment.reviewId,
      trackId: comment.entities?.at(0)?.id!,
      parentCommentId: comment.id,
      title: 'Reply',
   })

   return (
      <div className='flex w-full flex-col items-center space-y-4 sm:items-end'>
         <Transition
            appear={true}
            show={t.visible}
            as={Fragment}
            data-theme={theme}
            enter='transform ease-out duration-300 transition'
            enterFrom='translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2'
            enterTo='translate-y-0 opacity-100 sm:translate-x-0'
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
         >
            <div className='pointer-events-auto flex w-full max-w-md rounded-lg bg-base-300 shadow-lg ring-1 ring-primary ring-opacity-5'>
               <div className='w-0 flex-1 p-4'>
                  <div className='flex items-start'>
                     <div className='flex-shrink-0 pt-0.5'>
                        <img className='h-10 w-10 rounded-full' src={image} alt='Commenter Profile Picture' />
                     </div>
                     <div className='ml-3 w-0 flex-1'>
                        <p className='text-sm font-medium text-base-content'>{displayName}</p>
                        <p className='mt-1 text-sm text-base-content/50'>{comment.comment}</p>
                     </div>
                  </div>
               </div>
               <div className='flex border-l border-base-content/50'>
                  <div className='mr-2 flex flex-col divide-y divide-base-content/50 px-1'>
                     <div className='flex h-0 flex-1'>
                        <button
                           type='button'
                           className='w-full text-base-content/50 hover:text-base-content'
                           onClick={() => {
                              toast.dismiss(t.id)
                              replyComment()
                           }}
                        >
                           <span className='text-sm font-medium'>Reply</span>
                        </button>
                     </div>
                     <div className='flex h-0 flex-1'>
                        <button
                           type='button'
                           className='w-full text-base-content/50 hover:text-base-content'
                           onClick={() => {
                              toast.dismiss(t.id)
                           }}
                        >
                           <span className='text-sm font-medium'>Dismiss</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </Transition>
      </div>
   )
}
