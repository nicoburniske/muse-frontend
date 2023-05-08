import { useQueryClient } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithReset, RESET } from 'jotai/utils'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { useDeleteReviewMutation, useProfileAndReviewsQuery } from '@/graphql/generated/schema'
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

const maybeReviewIdAtom = atomWithReset<string | null>(null)
const reviewIdAtom = atomValueOrThrow(maybeReviewIdAtom)
const openAtom = atom(
   get => get(maybeReviewIdAtom) !== null,
   (_, set, open: boolean) => {
      if (!open) {
         set(maybeReviewIdAtom, RESET)
      }
   }
)

export const useDeleteReview = () => {
   const setReviewId = useSetAtom(maybeReviewIdAtom)

   return useCallback((reviewId: string) => setReviewId(reviewId), [setReviewId])
}

export const DeleteReviewModal = () => {
   const isOpen = useAtomValue(openAtom)

   if (isOpen) {
      return <DeleteReview />
   } else {
      return null
   }
}

export const DeleteReview = () => {
   const reviewId = useAtomValue(reviewIdAtom)
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
