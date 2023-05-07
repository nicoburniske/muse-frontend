import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useCommentModal } from '@/component/commentForm/CommentFormModal'
import { useCreateCommentMutation, useDetailedReviewCommentsQuery } from '@/graphql/generated/schema'

export const useCommentModalTrack = (reviewId: string, trackId: string, invalidate = false) => {
   // On successful comment creation, clear the comment box
   const { openCommentModal, closeCommentModal } = useCommentModal()
   const { mutateAsync: createComment, isLoading: isLoadingComment } = useCreateCommentMutation({
      onSuccess: () => {
         toast.success('Comment created.', { duration: 2000 })
         closeCommentModal()
      },
      onError: () => toast.error('Failed to create comment.'),
   })
   const queryClient = useQueryClient()
   const onSubmit = async (comment: string) => {
      if (!isLoadingComment) {
         // TODO: insert into cache?
         await createComment({
            input: { comment, entities: [{ entityId: trackId, entityType: 'Track' }], reviewId },
         })
         if (invalidate) {
            queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
         }
      }
   }

   return () => {
      const values = { title: 'Create Comment', onCancel: () => closeCommentModal(), onSubmit, trackId }
      openCommentModal(values)
   }
}