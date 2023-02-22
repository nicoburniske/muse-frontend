import { UseQueryOptions, UseQueryResult, useQueryClient } from '@tanstack/react-query'
import {
   DetailedReviewQuery,
   ProfileAndReviewsQuery,
   useDetailedReviewQuery,
   useProfileAndReviewsQuery,
} from 'graphql/generated/schema'
import { useCallback } from 'react'
import { userDisplayNameOrId } from 'util/Utils'

// We need to seperate select so that can update cache after a response comes through.
export const useDetailedReviewCacheQuery = <T>(
   reviewId: string,
   select: (data: DetailedReviewQuery) => T,
   options?: Omit<UseQueryOptions<DetailedReviewQuery, unknown, DetailedReviewQuery>, 'select'>,
   userId?: string
): UseQueryResult<T, unknown> => {
   const queryClient = useQueryClient()
   const result = useDetailedReviewQuery(
      { reviewId },
      {
         // For user owned reviews, we can use the data from the profile query.
         initialData: () => {
            const data = queryClient
               .getQueryData<ProfileAndReviewsQuery>(useProfileAndReviewsQuery.getKey({ userId }))
               ?.user?.reviews?.find(r => r.id === reviewId)
            return data ? ({ review: data } as DetailedReviewQuery) : undefined
         },
         initialDataUpdatedAt: () => queryClient.getQueryState(useProfileAndReviewsQuery.getKey({}))?.dataUpdatedAt,
         // When we get an update for this review, also update profile query.
         onSuccess: (data: DetailedReviewQuery) => {
            if (data) {
               const newReview = data.review
               queryClient.setQueryData<ProfileAndReviewsQuery>(useProfileAndReviewsQuery.getKey({}), oldData => {
                  if (oldData) {
                     const reviews = oldData.user?.reviews?.map(r => (r.id === newReview?.id ? newReview : r))
                     return { ...oldData, user: { ...oldData.user, reviews } }
                  }
               })
            }
         },
         ...options,
      }
   )
   const tranformedData = result.data ? select(result.data) : undefined
   return { ...result, data: tranformedData } as UseQueryResult<T, unknown>
}

export const useCollaboratorsQuery = (
   reviewId: string,
   options?: UseQueryOptions<DetailedReviewQuery, unknown, DetailedReviewQuery>
) => useDetailedReviewCacheQuery(reviewId, selectCollaborators, options)

const selectCollaborators = (data: DetailedReviewQuery) =>
   [...(data?.review?.collaborators ?? [])].sort((a, b) =>
      userDisplayNameOrId(a.user).localeCompare(userDisplayNameOrId(b.user))
   )

// TODO: Should collaborators be able to edit?
export const useIsReviewEditableQuery = (reviewId: string, userId: string) =>
   useDetailedReviewCacheQuery(
      reviewId,
      useCallback(
         data => data?.review?.creator?.id === userId,
         // ||
         //    data?.review?.collaborators
         //       ?.filter(c => c.accessLevel === 'Collaborator')
         //       .some(c => c.user.id === userId)
         [userId]
      ),
      {
         staleTime: Infinity,
      }
   )

export const useInvalidateDetailedReviewCache = (reviewId: string) => {
   const queryClient = useQueryClient()
   return useCallback(() => queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId })), [reviewId])
}
