import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { ListenOnSpotifyLogo } from '@/component/ListenOnSpotify'
import {
   CreateReviewMutationVariables,
   EntityType,
   useCreateReviewMutation,
   useProfileAndReviewsQuery,
} from '@/graphql/generated/schema'
import atomValueOrThrow from '@/lib/atom/atomValueOrThrow'
import { makeModalAtoms } from '@/lib/atom/makeModalAtoms'
import { Badge } from '@/lib/component/Badge'
import { Button } from '@/lib/component/Button'
import { Dialog, DialogContent } from '@/lib/component/Dialog'
import { Input } from '@/lib/component/Input'
import { Label } from '@/lib/component/Label'
import { Switch } from '@/lib/component/Switch'

export type CreateReviewProps = {
   entityId: string
   entityType: EntityType
   entityName: string
   entityImage: string
}

const { setOpen, setClose, valueAtom, openAtom } = makeModalAtoms<CreateReviewProps | null, CreateReviewProps>(null)

const createReviewAtom = atomValueOrThrow(valueAtom)

export const useCreateReviewModal = () => ({
   openCreateReview: useSetAtom(setOpen),
   closeCreateReview: useSetAtom(setClose),
})

export const CreateReviewModal = () => {
   const open = useAtomValue(openAtom)
   if (open) {
      return <CreateReview />
   }
   return null
}

const CreateReview = () => {
   const close = useSetAtom(setClose)
   const open = useAtomValue(openAtom)

   const nav = useNavigate()
   const queryClient = useQueryClient()
   const resetReviewOverviews = () => queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())

   const { entityId, entityType, entityName, entityImage } = useAtomValue(createReviewAtom)

   const { isLoading, mutate } = useCreateReviewMutation({
      onError: () => toast.error(`Failed to create ${entityType} review.`),
      onSuccess: data => {
         close()
         toast.success(`Successfully created ${entityType} review.`)
         resetReviewOverviews()
         const id = data?.createReview?.id
         if (id) {
            nav(`/app/reviews/${id}`)
         }
      },
   })

   const [name, setName] = useState('')
   const [isPublic, setIsPublic] = useState(false)

   const entity = entityId !== undefined ? { entityId, entityType } : undefined
   const input = { isPublic: isPublic ? true : false, name, entity }
   const createReviewMutation = () => mutate({ input } as CreateReviewMutationVariables)

   const createDisabled = name.length === 0 || isLoading

   return (
      <Dialog
         open={open}
         onOpenChange={open => {
            if (!open) close()
         }}
      >
         <DialogContent className='flex flex-col justify-evenly rounded-md sm:max-w-3xl sm:flex-row sm:justify-between'>
            <img
               src={entityImage}
               alt='ReviewEntityImage'
               className='m-auto h-64 w-64 object-cover sm:m-0 lg:h-96 lg:w-96'
            />
            <div className='flex w-full min-w-0 flex-col justify-between gap-2'>
               <div className='flex w-full gap-2'>
                  <h2 className='truncate text-xl font-semibold leading-none tracking-tight'>{entityName}</h2>
                  <Badge>{entityType} </Badge>
               </div>

               <div className='flex gap-2 self-center'>
                  <ListenOnSpotifyLogo entityId={entityId} entityType={entityType} />
               </div>
               <div>
                  <div className='mt-1'>
                     <Label htmlFor='review-name'>Review Name</Label>
                     <Input
                        id='review-name'
                        type='text'
                        placeholder='Type here'
                        className='input w-full max-w-md'
                        onChange={e => setName(e.target.value)}
                     />
                  </div>
               </div>
               <div className='flex items-center gap-2'>
                  <Label htmlFor='review-public'>Public</Label>
                  <Switch id='review-public' checked={isPublic} onCheckedChange={setIsPublic} />
               </div>
               <div className='justify-end'>
                  <div className='mt-5 flex w-full flex-row items-center justify-around'>
                     <Button type='button' disabled={isLoading} variant='destructive' onClick={() => close()}>
                        Cancel
                     </Button>

                     <Button type='button' disabled={createDisabled || isLoading} onClick={createReviewMutation}>
                        Create
                     </Button>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   )
}
