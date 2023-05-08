import { useQueryClient } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithReset, RESET } from 'jotai/utils'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

import { useDeleteCommentMutation, useDetailedReviewCommentsQuery } from '@/graphql/generated/schema'
import atomValueOrThrow from '@/lib/atom/atomValueOrThrow'
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

const maybeModalValuesAtom = atomWithReset<DeleteModalValues | null>(null)
const deleteModalValues = atomValueOrThrow(maybeModalValuesAtom)
const openAtom = atom(
   get => get(maybeModalValuesAtom) !== null,
   (_, set, open: boolean) => {
      if (!open) {
         set(maybeModalValuesAtom, RESET)
      }
   }
)

export const useOpenDeleteConfirmation = () => {
   const setModalValues = useSetAtom(maybeModalValuesAtom)
   return useCallback((values: DeleteModalValues) => setModalValues(values), [setModalValues])
}

export const DeleteCommentModal = () => {
   const open = useAtomValue(openAtom)
   if (open) {
      return <DeleteComment />
   } else {
      return null
   }
}

export const DeleteComment = () => {
   const [open, setOpen] = useAtom(openAtom)
   const { reviewId, commentId, invalidate = false } = useAtomValue(deleteModalValues)

   const queryClient = useQueryClient()

   const { mutateAsync: deleteCommentMutation, isLoading } = useDeleteCommentMutation({
      onSuccess: () => {
         setOpen(false)
         if (invalidate) {
            queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
         }
         toast.success('Deleted comment.')
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
