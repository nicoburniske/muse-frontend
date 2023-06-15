import { useCallback } from 'react'
import toast from 'react-hot-toast'

import { CreateCommentInput, useCreateCommentMutation } from '@/graphql/generated/schema'
import { Prettify } from '@/util/Types'

import { useCommentModal } from './CommentFormModal'

type OpenNewComment = Prettify<
   {
      title: string
      trackId: string
   } & Omit<CreateCommentInput, 'entities' | 'comment'>
>

export type OpenNewCommentParams = Prettify<OpenNewComment>

const errorToast = () => toast.error('Failed to create comment')

export const useOpenNewComment = () => {
   const { openCommentModal, closeCommentModal } = useCommentModal()
   const { mutateAsync: createComment } = useCreateCommentMutation({
      onSuccess: closeCommentModal,
      onError: errorToast,
   })

   return useCallback(
      (options: OpenNewCommentParams) => {
         const { title, reviewId, parentCommentId, trackId } = options
         const onSubmit = async (comment: string) => {
            await createComment({
               input: {
                  comment,
                  entities: [{ entityId: trackId, entityType: 'Track' }],
                  reviewId,
                  parentCommentId,
               },
            })
         }
         openCommentModal({ title, trackId, onSubmit })
      },
      [openCommentModal, createComment]
   )
}
