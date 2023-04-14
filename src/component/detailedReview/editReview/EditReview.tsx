import { Dialog } from '@headlessui/react'
import { ThemeModal } from 'platform/component/ThemeModal'
import { useUpdateReviewMutation } from 'graphql/generated/schema'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from 'util/Utils'
import { DeleteReviewButton } from 'component/DeleteReviewButton'
import { useNavigate } from 'react-router-dom'

export type EditReviewProps = {
   isOpen: boolean
   reviewId: string
   reviewName: string
   isPublic: boolean
   onSuccess: () => void
   onCancel: () => void
}

const EditReviewSchema = z.object({
   isPublic: z.union([z.literal('public'), z.literal('private')]),
   reviewName: z.string().min(1).max(50),
})

type EditReviewInputType = z.infer<typeof EditReviewSchema>

export const EditReview = ({ isOpen, reviewId, reviewName, isPublic, onSuccess, onCancel }: EditReviewProps) => {
   const defaultValues: EditReviewInputType = { reviewName, isPublic: isPublic ? 'public' : 'private' }

   const {
      register,
      reset,
      handleSubmit,
      formState: { isSubmitting, isValid, isDirty },
   } = useForm<EditReviewInputType>({
      resolver: zodResolver(EditReviewSchema),
      defaultValues,
   })

   // So on an update, the form will reset to the new values.
   useEffect(() => {
      reset(defaultValues)
   }, [reviewName, isPublic])

   const { mutate, isLoading } = useUpdateReviewMutation({
      onError: () => toast.error('Failed to update review.'),
      onSuccess: () => {
         toast.success('Updated review.')
         onSuccess()
      },
   })

   const onSubmit = (input: EditReviewInputType) => {
      const reviewInput = { reviewId, name: input.reviewName, isPublic: input.isPublic === 'public' }
      mutate({ input: reviewInput })
   }

   const submitDisabled = !isDirty || !isValid || isSubmitting

   const nav = useNavigate()
   const onDeleted = () => nav('/app/reviews')

   return (
      <ThemeModal open={isOpen} className='max-w-md grow'>
         <div className='relative flex flex-col items-center justify-between space-y-5 p-3'>
            <Dialog.Title className='text-lg font-bold'>Edit Review</Dialog.Title>

            <form className='flex w-full flex-col items-center space-y-2 px-2' onSubmit={handleSubmit(onSubmit)}>
               <div className='w-full'>
                  <label className='label' htmlFor='review-name'>
                     <span className='label-text'>Review Name</span>
                  </label>
                  <input
                     id='review-name'
                     type='text'
                     className='input input-bordered w-full'
                     {...register('reviewName')}
                  />
               </div>
               <div className='flex w-full flex-col'>
                  <label className='label'>
                     <span className='label-text'>Public</span>
                  </label>
                  <select {...register('isPublic')} className='select select-bordered w-full'>
                     <option value={'private'}>Private</option>
                     <option value={'public'}>Public</option>
                  </select>
               </div>

               <button className={cn('btn btn-success w-32')} disabled={submitDisabled}>
                  {isLoading ? (
                     <ArrowPathIcon className={cn('h-6 w-6 animate-spin')} aria-hidden='true' />
                  ) : (
                     <>
                        Confirm
                        <CheckIcon className='h-6 w-6' aria-hidden='true' />
                     </>
                  )}
               </button>
            </form>
            <button className='btn btn-error btn-square btn-sm absolute top-0 right-2' onClick={onCancel}>
               <XMarkIcon className='h-6 w-6' />
            </button>
            <DeleteReviewButton reviewId={reviewId} onSettled={onDeleted} />
         </div>
      </ThemeModal>
   )
}
