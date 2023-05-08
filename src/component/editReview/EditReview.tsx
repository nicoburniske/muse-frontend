import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { useUpdateReviewMutation } from '@/graphql/generated/schema'
import { makeModalAtoms } from '@/lib/atom/makeModalAtoms'
import { Button } from '@/lib/component/Button'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
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
import { useDetailedReviewCacheQuery, useInvalidateDetailedReviewCache } from '@/state/useDetailedReviewCacheQuery'

const { setOpen, setClose, valueAtom: reviewIdAtom, openAtom } = makeModalAtoms<string | null, string>(null)

export const useEditReview = () => ({
   openEditReview: useSetAtom(setOpen),
   closeEditReview: useSetAtom(setClose),
})

export const EditReviewModal = () => {
   const reviewId = useAtomValue(reviewIdAtom) ?? ''
   const { data } = useDetailedReviewCacheQuery(reviewId, r => r.review)
   if (data) {
      return <EditReview reviewId={reviewId} reviewName={data.reviewName} isPublic={data.isPublic} />
   } else {
      return null
   }
}

const EditReviewSchema = z.object({
   isPublic: z.union([z.literal('public'), z.literal('private')]),
   reviewName: z.string().min(1).max(50),
})

type EditReviewInputType = z.infer<typeof EditReviewSchema>

type EditReviewProps = {
   reviewId: string
   reviewName: string
   isPublic: boolean
}

const EditReview = ({ reviewId, reviewName, isPublic }: EditReviewProps) => {
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

   const [open, onOpenChange] = useAtom(openAtom)

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <Label htmlFor='select-public'>Public</Label>
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

               <DialogFooter className='w-full'>
                  <Button disabled={submitDisabled || isLoading}>Confirm</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   )
}
