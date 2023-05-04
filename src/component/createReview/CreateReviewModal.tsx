import { useQueryClient } from '@tanstack/react-query'
import { ListenOnSpotifyLogo } from 'component/ListenOnSpotify'
import {
   CreateReviewMutationVariables,
   EntityType,
   useCreateReviewMutation,
   useProfileAndReviewsQuery,
} from 'graphql/generated/schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Badge } from 'lib/component/Badge'
import { Button } from 'lib/component/Button'
import { Dialog, DialogContent } from 'lib/component/Dialog'
import { Input } from 'lib/component/Input'
import { Label } from 'lib/component/Label'
import { Switch } from 'lib/component/Switch'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export type CreateReviewProps = {
   entityId: string
   entityType: EntityType
   entityName: string
   entityImage: string
}

const createReviewAtom = atom<CreateReviewProps | undefined>(undefined)
const createReviewModalOpenAtom = atom(false)
const openModalAtom = atom(null, (_get, set, create: CreateReviewProps) => {
   set(createReviewModalOpenAtom, true)
   set(createReviewAtom, create)
})
const closeModalAtom = atom(null, (_get, set) => {
   set(createReviewModalOpenAtom, false)
   setTimeout(() => set(createReviewAtom, undefined), 500)
})
export const useCreateReviewModal = (create: CreateReviewProps) => {
   const setOpen = useSetAtom(openModalAtom)
   return {
      open: () => setOpen(create),
      close: useSetAtom(closeModalAtom),
   }
}

export const CreateReviewModal = () => {
   const isModalOpen = useAtomValue(createReviewModalOpenAtom)
   const close = useSetAtom(closeModalAtom)

   const nav = useNavigate()
   const queryClient = useQueryClient()
   const resetReviewOverviews = () => queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())

   const { entityId, entityType, entityName, entityImage } = useAtomValue(createReviewAtom) ?? {}

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
         open={isModalOpen}
         onOpenChange={open => {
            if (!open) close()
         }}
      >
         <DialogContent className='flex flex-col justify-evenly rounded-md sm:max-w-3xl sm:flex-row'>
            <img src={entityImage} alt='ReviewEntityImage' className='m-auto h-64 w-64 object-cover lg:h-96 lg:w-96' />
            <div className='flex flex-col justify-between gap-2'>
               <div className='flex w-full gap-2'>
                  <h2 className='truncate text-xl font-semibold leading-none tracking-tight'>{entityName}</h2>
                  <Badge className='ml-2'>{entityType} </Badge>
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
               <div className='card-actions justify-end'>
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
