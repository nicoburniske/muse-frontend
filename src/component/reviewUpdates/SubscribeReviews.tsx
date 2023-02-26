import { useCurrentUserId } from 'state/CurrentUser'
import { useSubscribeToReviews } from './useSubscribeToRevies'
import { ProfileAndReviewsQuery, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { useDeepCompareMemoize } from 'platform/hook/useDeepCompareMemoize'

export const SubscribeReviews = () => {
   const currentUserId = useCurrentUserId()
   const reviewIds =
      useProfileAndReviewsQuery({ userId: currentUserId }, { staleTime: Infinity, select: selectReviewIds }).data ?? []
   const reviewIdsMemo = useDeepCompareMemoize(reviewIds)

   useSubscribeToReviews(reviewIdsMemo)
   return null
}

const selectReviewIds = (data: ProfileAndReviewsQuery) => data.user.reviews?.map(r => r.id) ?? []
