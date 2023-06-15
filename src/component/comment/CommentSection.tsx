import { useMemo, useRef } from 'react'
import { useDndScrolling } from 'react-dnd-scrolling'

import {
   DetailedCommentFragment,
   DetailedReviewCommentsQuery,
   useDetailedReviewCommentsQuery,
} from '@/graphql/generated/schema'

import { DeleteCommentModal } from './DeleteCommentConfirmation'
import DetailedComment from './DetailedComment'

const selectComments = (data: DetailedReviewCommentsQuery) => data.review?.comments ?? []

export default function ReviewCommentSection({ reviewId }: { reviewId: string }) {
   const { data } = useDetailedReviewCommentsQuery({ reviewId }, { select: selectComments, staleTime: 60 * 1000 })

   const comments = data ?? []
   const rootComments = useMemo(
      () =>
         comments.filter(comment => comment.parentCommentId === null).sort((a, b) => a.commentIndex - b.commentIndex),
      [comments]
   )
   const ref = useRef<HTMLDivElement>(null)
   useDndScrolling(ref, {})

   return (
      <>
         <div
            className='muse-scrollbar muse-comments overflow-y-auto, my-1 mr-2 flex h-full flex-1 flex-col space-y-1 animate-in fade-in duration-300'
            // to stop drag from dragging two elements.
            // https://github.com/react-dnd/react-dnd/issues/832
            style={{
               transform: `translate3d(0, 0, 0)`,
            }}
            ref={ref}
         >
            {rootComments.map((c: DetailedCommentFragment) => (
               <DetailedComment key={c.id} reviewId={reviewId} comment={c} />
            ))}
         </div>
         <DeleteCommentModal />
      </>
   )
}
