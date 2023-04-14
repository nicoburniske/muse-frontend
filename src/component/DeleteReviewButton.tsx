import { useQueryClient } from '@tanstack/react-query'
import { useDeleteReviewMutation, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { ThemeModal } from 'platform/component/ThemeModal'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from 'util/Utils'
import { TrashIcon } from './Icons'
import Portal from 'platform/component/Portal'

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

   const deleteReview = () => {
      mutate({ input: { id: reviewId } })
   }

   return (
      <>
         <Portal>
            <ThemeModal open={isModalOpen} className='max-w-md'>
               <div className='bg-base-100 text-base-content shadow sm:rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                     <h3 className='text-lg font-medium leading-6 '>Delete Review</h3>
                     <div className='mt-2 max-w-xl text-sm'>
                        <p>Once you delete your review, you won't be able to recover it.</p>
                     </div>
                     <div className='mt-5 flex w-full flex-row items-center justify-around'>
                        <button
                           type='button'
                           disabled={isLoading}
                           onClick={() => setIsModalOpen(false)}
                           className={cn('btn btn-primary btn-md', isLoading && 'btn-loading')}
                        >
                           Cancel
                        </button>

                        <button
                           type='button'
                           disabled={isLoading}
                           onClick={deleteReview}
                           className={cn('btn btn-error btn-md', isLoading && 'btn-loading')}
                        >
                           Delete
                        </button>
                     </div>
                  </div>
               </div>
            </ThemeModal>
         </Portal>

         <button type='button' className='btn btn-error' onClick={() => setIsModalOpen(true)}>
            <TrashIcon className='h-5 w-5' aria-hidden='true' />
            <span className='ml-4'>Delete Review</span>
         </button>
      </>
   )
}
