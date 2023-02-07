import { useQueryClient } from '@tanstack/react-query'
import {
   CreateCommentInput,
   EntityType,
   useCreateCommentMutation,
   useDetailedReviewCommentsQuery,
} from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { useCommentModal } from './CommentFormModalWrapper'
import { Prettify } from 'util/Types'

type OpenNewComment = {
   title: string
   trackId: string
   errorToastMessage?: string
} & Omit<CreateCommentInput, 'entities' | 'comment'>

export type OpenNewCommentParams = Prettify<OpenNewComment>

export const useOpenNewComment = (options: OpenNewCommentParams) => {
   const { title, reviewId, parentCommentId, trackId, errorToastMessage } = options

   const { openCommentModal, closeCommentModal } = useCommentModal()
   const { mutateAsync: createComment, isLoading: isLoadingComment } = useCreateCommentMutation({
      onSuccess: () => closeCommentModal(),
      onError: () => toast.error(errorToastMessage ?? 'Failed to create comment'),
   })
   const queryClient = useQueryClient()
   const onSubmit = async (comment: string) => {
      if (!isLoadingComment) {
         await createComment({
            input: {
               comment,
               entities: [{ entityId: trackId, entityType: EntityType.Track }],
               reviewId,
               parentCommentId,
            },
         })
         queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
      }
   }

   return () => {
      const values = { title, onCancel: () => closeCommentModal(), onSubmit, trackId }
      openCommentModal(values)
   }
}
