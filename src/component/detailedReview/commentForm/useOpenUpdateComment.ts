import { useQueryClient } from '@tanstack/react-query'
import { UpdateCommentInput, useDetailedReviewCommentsQuery, useUpdateCommentMutation } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { useCommentModal } from './CommentFormModalWrapper'
import { Prettify } from 'util/Types'

type UpdateComment = {
   title?: string
   errorToastMessage?: string
   trackId: string
   comment: string
} & Omit<UpdateCommentInput, 'comment'>

export type UpdateCommentParams = Prettify<UpdateComment>

export const useOpenUpdateComment = (options: UpdateCommentParams) => {
   const {
      commentId,
      reviewId,
      trackId,
      comment,
      title = 'Edit Comment',
      errorToastMessage = 'Failed to update comment.',
   } = options

   const { openCommentModal, closeCommentModal } = useCommentModal()
   const { mutate, isLoading } = useUpdateCommentMutation({
      onSuccess: () => closeCommentModal(),
      onError: () => toast.error(errorToastMessage),
      onSettled: () => queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) }),
   })
   const queryClient = useQueryClient()
   const onSubmit = async (editedComment: string) => {
      if (!isLoading) {
         mutate({
            input: {
               comment: editedComment,
               reviewId,
               commentId,
            },
         })
      }
   }

   return () => {
      const values = { title, onCancel: () => closeCommentModal(), onSubmit, trackId, initialValue: comment }
      openCommentModal(values)
   }
}
