import { useQueryClient } from '@tanstack/react-query'
import { useDeleteReviewMutation, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { TrashIcon } from '@heroicons/react/24/outline'
import { Button } from 'platform/component/Button'
import {
   Dialog,
   DialogFooter,
   DialogTitle,
   DialogTrigger,
   DialogContent,
   DialogDescription,
} from 'platform/component/Dialog'

type DeleteReviewButtonProps = {
   reviewId: string
   onSettled: () => void
}

export const DeleteReviewButton = ({ reviewId, onSettled }: DeleteReviewButtonProps) => {
   const [isModalOpen, setIsModalOpen] = useState(false)

   const queryClient = useQueryClient()
   const resetReviewOverviews = () => queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())

   const { mutate, isLoading } = useDeleteReviewMutation({
      onError: () => toast.error('Failed to delete review.'),
      onSuccess: () => {
         toast.success('Successfully deleted review.')
         resetReviewOverviews()
      },
      onSettled: () => {
         setIsModalOpen(false)
         onSettled()
      },
   })

   const deleteReview = () => mutate({ input: { id: reviewId } })

   return (
      <Dialog open={isModalOpen} onOpenChange={open => setIsModalOpen(open)}>
         <DialogTrigger>
            <Button type='button' onClick={() => setIsModalOpen(true)} variant={'destructive'}>
               <TrashIcon className='h-5 w-5' aria-hidden='true' />
               <span className='ml-1'>Delete Review</span>
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>Once you delete your review, you won't be able to recover it.</DialogDescription>
            <DialogFooter>
               <Button disabled={isLoading} onClick={() => setIsModalOpen(false)}>
                  Cancel
               </Button>

               <Button disabled={isLoading} onClick={deleteReview} variant={'destructive'}>
                  Delete Review
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}
