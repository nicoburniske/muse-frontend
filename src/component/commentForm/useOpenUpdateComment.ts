import { useQueryClient } from '@tanstack/react-query'
import { UpdateCommentInput, useDetailedReviewCommentsQuery, useUpdateCommentMutation } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { useCommentModal } from './CommentFormModal'
import { Prettify } from 'util/Types'
import { useCallback } from 'react'

type UpdateComment = {
   title?: string
   errorToastMessage?: string
   invalidate?: boolean
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
      invalidate = false,
   } = options

   const queryClient = useQueryClient()
   const { openCommentModal, closeCommentModal } = useCommentModal()

   const { mutate, isLoading } = useUpdateCommentMutation({
      onSuccess: () => {
         closeCommentModal()
      },
      onError: () => useCallback(() => toast.error(errorToastMessage), [errorToastMessage]),
      onSettled: () => {
         // Review comment subscription should take care of this.
         if (invalidate) {
            queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
         }
      },
   })

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
