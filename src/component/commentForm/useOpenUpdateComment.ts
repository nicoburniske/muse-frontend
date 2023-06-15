import toast from 'react-hot-toast'

import { UpdateCommentInput, useUpdateCommentMutation } from '@/graphql/generated/schema'
import { Prettify } from '@/util/Types'

import { useCommentModal } from './CommentFormModal'

type UpdateComment = Prettify<
   {
      trackId: string
   } & UpdateCommentInput
>

export type UpdateCommentParams = Prettify<UpdateComment>

const errorToast = () => toast.error('Failed to update comment')

export const useOpenUpdateComment = (options: UpdateCommentParams) => {
   const { commentId, reviewId, trackId, comment } = options

   const { openCommentModal, closeCommentModal } = useCommentModal()

   const { mutate } = useUpdateCommentMutation({
      onSuccess: closeCommentModal,
      onError: errorToast,
   })

   const onSubmit = async (editedComment: string) => {
      mutate({
         input: {
            comment: editedComment,
            reviewId,
            commentId,
         },
      })
   }

   return () => {
      const values = { title: 'Edit Comment', onSubmit, trackId, initialValue: comment }
      openCommentModal(values)
   }
}
