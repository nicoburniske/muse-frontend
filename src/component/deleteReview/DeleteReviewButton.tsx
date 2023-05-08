import { useQueryClient } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithReset, RESET } from 'jotai/utils'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { useDeleteReviewMutation, useProfileAndReviewsQuery } from '@/graphql/generated/schema'
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

const reviewIdAtom = atomWithReset<string | null>(null)
const openAtom = atom(
   get => get(reviewIdAtom) !== null,
   (_, set, open: boolean) => {
      if (!open) {
         set(reviewIdAtom, RESET)
      }
   }
)

export const useDeleteReview = () => {
   const setReviewId = useSetAtom(reviewIdAtom)

   return useCallback((reviewId: string) => setReviewId(reviewId), [setReviewId])
}

export const DeleteReviewModal = () => {
   const reviewId = useAtomValue(reviewIdAtom)

   if (reviewId !== null) {
      return <DeleteReview reviewId={reviewId} />
   } else {
      return null
   }
}

export const DeleteReview = ({ reviewId }: { reviewId: string }) => {
   const [open, setOpen] = useAtom(openAtom)

   const queryClient = useQueryClient()
   const resetReviewOverviews = () => queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())

   const { mutate, isLoading } = useDeleteReviewMutation({
      onError: () => toast.error('Failed to delete review.'),
      onSuccess: () => {
         toast.success('Successfully deleted review.')
         resetReviewOverviews()
         nav('/app/reviews')
      },
      onSettled: () => {
         setOpen(false)
      },
   })

   const deleteReview = () => mutate({ input: { id: reviewId } })
   const nav = useNavigate()

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
               <AlertDialogDescription>
                  Once you delete your review, you won't be able to recover it.
               </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
               <AlertDialogCancel disabled={isLoading} onClick={() => setOpen(false)}>
                  Cancel
               </AlertDialogCancel>
               <AlertDialogAction disabled={isLoading} onClick={deleteReview}>
                  Continue
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   )
}
