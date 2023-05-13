import { useQueryClient } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithReset, RESET } from 'jotai/utils'
import { toast } from 'react-hot-toast'

import { useDeleteCommentMutation, useDetailedReviewCommentsQuery } from '@/graphql/generated/schema'
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/lib/component/AlertDialog'

type DeleteModalValues = {
   reviewId: string
   commentId: number
   invalidate?: boolean
}

const deleteModalOpenAtom = atom(false)
const deleteModalValues = atomWithReset<DeleteModalValues>({
   reviewId: '',
   commentId: -1,
})

const setModalValuesAtom = atom(null, (_get, set, values: DeleteModalValues) => {
   set(deleteModalOpenAtom, true)
   set(deleteModalValues, values)
})

const closeModalAtom = atom(null, (_get, set) => {
   set(deleteModalOpenAtom, false)
   set(deleteModalValues, RESET)
})

export const useOpenDeleteConfirmation = () => useSetAtom(setModalValuesAtom)

export const DeleteCommentModal = () => {
   const [open, setOpen] = useAtom(deleteModalOpenAtom)
   const { reviewId, commentId, invalidate = false } = useAtomValue(deleteModalValues)
   const close = useSetAtom(closeModalAtom)

   const queryClient = useQueryClient()

   const { mutateAsync: deleteCommentMutation, isLoading } = useDeleteCommentMutation({
      onSuccess: () => {
         if (invalidate) {
            queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
         }
         close()
      },
      onError: () => toast.error('Failed to delete comment'),
   })
   const deleteComment = () => deleteCommentMutation({ input: { reviewId, commentId } })

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
               <AlertDialogDescription>
                  Once you delete your comment, you won't be able to recover it
               </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
               <AlertDialogCancel disabled={isLoading} onClick={() => setOpen(false)}>
                  Cancel
               </AlertDialogCancel>
               <AlertDialogAction disabled={isLoading} onClick={deleteComment}>
                  Continue
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   )
}
