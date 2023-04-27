import { useUpdateReviewMutation } from 'graphql/generated/schema'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { DeleteReviewButton } from 'component/DeleteReviewButton'
import { useNavigate } from 'react-router-dom'
import { Input } from 'platform/component/Input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from 'platform/component/Select'
import { Button } from 'platform/component/Button'
import { Label } from 'platform/component/Label'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from 'platform/component/Dialog'
import { useInvalidateDetailedReviewCache } from 'state/useDetailedReviewCacheQuery'

export type EditReviewProps = {
   reviewId: string
   reviewName: string
   isPublic: boolean
}

const EditReviewSchema = z.object({
   isPublic: z.union([z.literal('public'), z.literal('private')]),
   reviewName: z.string().min(1).max(50),
})

type EditReviewInputType = z.infer<typeof EditReviewSchema>

export const EditReview = ({ reviewId, reviewName, isPublic }: EditReviewProps) => {
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

   const invalidate = useInvalidateDetailedReviewCache(reviewId)

   const { mutate, isLoading } = useUpdateReviewMutation({
      onError: () => toast.error('Failed to update review.'),
      onSuccess: () => {
         toast.success('Updated review.')
         invalidate()
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
      <Dialog>
         <DialogTrigger>
            <Button variant='outline'>Edit</Button>
         </DialogTrigger>

         <DialogContent>
            <DialogHeader>
               <DialogTitle>Edit Review</DialogTitle>
               <DialogDescription>Update properties of this review.</DialogDescription>
            </DialogHeader>

            <form className='flex w-full flex-col items-center space-y-2 px-2' onSubmit={handleSubmit(onSubmit)}>
               <div className='w-full'>
                  <Label htmlFor='review-name'>Review Name</Label>
                  <Input
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
                  <Select {...register('isPublic')}>
                     <SelectTrigger>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectGroup>
                           <SelectItem value={'public'}>Public</SelectItem>
                           <SelectItem value={'private'}>Private</SelectItem>
                        </SelectGroup>
                     </SelectContent>
                  </Select>
               </div>

               <Button disabled={submitDisabled || isLoading}>Confirm</Button>
            </form>
            <DialogFooter>
               <DeleteReviewButton reviewId={reviewId} onSettled={onDeleted} />
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}
