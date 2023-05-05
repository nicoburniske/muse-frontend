import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { DeleteReviewButton } from '@/component/deleteReview/DeleteReviewButton'
import { useUpdateReviewMutation } from '@/graphql/generated/schema'
import { Button } from '@/lib/component/Button'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/lib/component/Dialog'
import { Input } from '@/lib/component/Input'
import { Label } from '@/lib/component/Label'
import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectItemText,
   SelectTrigger,
   SelectValue,
} from '@/lib/component/Select'
import { useInvalidateDetailedReviewCache } from '@/state/useDetailedReviewCacheQuery'

export type EditReviewProps = {
   reviewId: string
   reviewName: string
   isPublic: boolean
   children: React.ReactNode
}

const EditReviewSchema = z.object({
   isPublic: z.union([z.literal('public'), z.literal('private')]),
   reviewName: z.string().min(1).max(50),
})

type EditReviewInputType = z.infer<typeof EditReviewSchema>

export const EditReview = ({ reviewId, reviewName, isPublic, children }: EditReviewProps) => {
   const defaultValues: EditReviewInputType = { reviewName, isPublic: isPublic ? 'public' : 'private' }

   const {
      control,
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
         <DialogTrigger asChild>{children}</DialogTrigger>

         <DialogContent>
            <DialogHeader>
               <DialogTitle>Edit Review</DialogTitle>
               <DialogDescription>Update properties of this review.</DialogDescription>
            </DialogHeader>

            <form className='flex w-full flex-col items-center space-y-2 px-2' onSubmit={handleSubmit(onSubmit)}>
               <div className='w-full'>
                  <Label htmlFor='review-name'>Review Name</Label>
                  <Input id='review-name' type='text' {...register('reviewName')} />
               </div>
               <div className='flex w-full flex-col'>
                  <label className='label'>
                     <span className='label-text'>Public</span>
                  </label>
                  <Controller
                     control={control}
                     name='isPublic'
                     render={({ field: { onChange, value } }) => (
                        <Select onValueChange={onChange} value={value}>
                           <SelectTrigger>
                              <SelectValue defaultValue={defaultValues.isPublic} />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectGroup>
                                 <SelectItem value={'public'}>
                                    <SelectItemText>Public</SelectItemText>
                                 </SelectItem>
                                 <SelectItem value={'private'}>
                                    <SelectItemText>Private</SelectItemText>
                                 </SelectItem>
                              </SelectGroup>
                           </SelectContent>
                        </Select>
                     )}
                  />
               </div>

               <div className='flex w-full justify-between'>
                  <DeleteReviewButton reviewId={reviewId} onSettled={onDeleted} />
                  <Button disabled={submitDisabled || isLoading}>Confirm</Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   )
}
