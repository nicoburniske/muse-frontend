import { useQueryClient } from '@tanstack/react-query'
import { useDeleteCommentMutation, useDetailedReviewCommentsQuery } from 'graphql/generated/schema'
import { atom, useSetAtom, useAtom, useAtomValue } from 'jotai'
import { atomWithReset, useResetAtom } from 'jotai/utils'
import { Button } from 'lib/component/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from 'lib/component/Dialog'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

type DeleteModalValues = {
   reviewId: string
   commentId: number
   invalidate?: boolean
}

const deleteModalOpenAtom = atom(false)
const deleteModalValues = atomWithReset<DeleteModalValues>({
   reviewId: '',
   commentId: -1,
   invalidate: false,
})

const setModalValuesAtom = atom(null, (_get, set, values: DeleteModalValues) => {
   set(deleteModalOpenAtom, true)
   set(deleteModalValues, values)
})

export const useOpenDeleteConfirmation = (values: DeleteModalValues) => {
   const setModalValues = useSetAtom(setModalValuesAtom)
   return useCallback(() => setModalValues(values), [setModalValues, values])
}

export const DeleteCommentConfirmation = () => {
   const [isModalOpen, setIsModalOpen] = useAtom(deleteModalOpenAtom)
   const { reviewId, commentId, invalidate = false } = useAtomValue(deleteModalValues)
   const resetModalValues = useResetAtom(deleteModalValues)

   const queryClient = useQueryClient()

   const { mutateAsync: deleteCommentMutation, isLoading } = useDeleteCommentMutation({
      onSuccess: () => {
         setIsModalOpen(false)
         if (invalidate) {
            queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
         }
         resetModalValues()
      },
      onError: () => toast.error('Failed to delete comment'),
   })
   const deleteComment = () => deleteCommentMutation({ input: { reviewId, commentId } })

   return (
      <Dialog open={isModalOpen} onOpenChange={open => setIsModalOpen(open)}>
         <DialogContent>
            <DialogTitle>Delete Comment </DialogTitle>
            <DialogDescription>Once you delete your comment, you won't be able to recover it.</DialogDescription>
            <DialogFooter>
               <Button disabled={isLoading} onClick={() => setIsModalOpen(false)}>
                  Cancel
               </Button>

               <Button disabled={isLoading} onClick={deleteComment} variant={'destructive'}>
                  Delete Comment
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}
