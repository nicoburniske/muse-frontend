import { useCurrentUserId } from 'state/CurrentUser'
import { useSubscribeToReviews } from './useSubscribeToReviews'
import { ProfileAndReviewsQuery, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { useDeepCompareMemoize } from 'platform/hook/useDeepCompareMemoize'
import { CommentFormModal } from 'component/detailedReview/commentForm/CommentFormModal'

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

   // We want to enable comment replies globally.
   return <CommentFormModal />
}

const selectReviewIds = (data: ProfileAndReviewsQuery) => data.user.reviews?.map(r => r.id) ?? []
