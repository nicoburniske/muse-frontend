import { useQueryClient } from '@tanstack/react-query'
import {
   CreateCommentInput,
   EntityType,
   useCreateCommentMutation,
   useDetailedReviewCommentsQuery,
} from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { useCommentModal } from './CommentFormModal'
import { Prettify } from 'util/Types'
import { useCallback } from 'react'

type OpenNewComment = {
   title: string
   trackId: string
   errorToastMessage?: string
   invalidate?: boolean
} & Omit<CreateCommentInput, 'entities' | 'comment'>

export type OpenNewCommentParams = Prettify<OpenNewComment>

export const useOpenNewComment = (options: OpenNewCommentParams) => {
   const { title, reviewId, parentCommentId, trackId, errorToastMessage, invalidate = false } = options

   const { openCommentModal, closeCommentModal } = useCommentModal()
   const { mutateAsync: createComment, isLoading: isLoadingComment } = useCreateCommentMutation({
      onSuccess: () => closeCommentModal(),
      onError: () =>
         useCallback(() => toast.error(errorToastMessage ?? 'Failed to create comment'), [errorToastMessage]),
   })
   const queryClient = useQueryClient()
   const onSubmit = async (comment: string) => {
      if (!isLoadingComment) {
         await createComment({
            input: {
               comment,
               entities: [{ entityId: trackId, entityType: 'Track' }],
               reviewId,
               parentCommentId,
            },
         })
         // Review comment subscription should take care of this.
         if (invalidate) {
            queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
         }
      }
   }

   return () => {
      const values = { title, onCancel: () => closeCommentModal(), onSubmit, trackId }
      openCommentModal(values)
   }
}
