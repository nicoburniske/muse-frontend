import { useQueryClient } from '@tanstack/react-query'
import { EntityType, useCreateCommentMutation, useDetailedReviewCommentsQuery } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { useCommentModal } from '../commentForm/CommentFormModalWrapper'

export const useCommentModalTrack = (reviewId: string, trackId: string) => {
    // On successful comment creation, clear the comment box 
    const { openCommentModal, closeCommentModal } = useCommentModal()
    const { mutateAsync: createComment, isLoading: isLoadingComment } = useCreateCommentMutation({
        onSuccess: () => closeCommentModal(),
        onError: () => toast.error('Failed to create comment.')
    })
    const queryClient = useQueryClient()
    const onSubmit = async (comment: string) => {
        if (!isLoadingComment) {
            // TODO: insert into cache? 
            await createComment({ input: { comment, entities: [{ entityId: trackId, entityType: EntityType.Track }], reviewId } })
            queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
        }
    }

    return  () => {
        const values = { title: 'create comment', onCancel: () => closeCommentModal(), onSubmit , trackId}
        openCommentModal(values)
    }
}