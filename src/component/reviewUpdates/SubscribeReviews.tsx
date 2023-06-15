import { ProfileAndReviewsQuery, useProfileAndReviewsQuery } from '@/graphql/generated/schema'
import { useDeepCompareMemoize } from '@/lib/hook/useDeepCompareMemoize'
import { useCurrentUserId } from '@/state/CurrentUser'

import { useSubscribeToReviews } from './useSubscribeToReviews'

export const SubscribeReviews = () => {
   const currentUserId = useCurrentUserId()
   const reviewIds = useProfileAndReviewsQuery(
      { userId: currentUserId },
      {
         staleTime: Infinity,
         select: selectReviewIds,
      }
   )
   const reviewIdsMemo = useDeepCompareMemoize(reviewIds.data ?? [])

   useSubscribeToReviews(reviewIdsMemo)

   return null
}

const selectReviewIds = (data: ProfileAndReviewsQuery) => data.user.reviews?.map(r => r.id) ?? []
