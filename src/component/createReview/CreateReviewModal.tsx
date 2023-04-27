import { Portal } from '@headlessui/react'
import { useQueryClient } from '@tanstack/react-query'
import { ListenOnSpotifyLogo } from 'component/ListenOnSpotify'
import {
   CreateReviewMutationVariables,
   EntityType,
   useCreateReviewMutation,
   useProfileAndReviewsQuery,
} from 'graphql/generated/schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ThemeModal } from 'platform/component/ThemeModal'
import { ToggleWithDescription } from 'platform/component/ToggleWithDescription'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { cn } from 'util/Utils'

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
      <Portal>
         <ThemeModal open={isModalOpen} className='max-w-md border-0 bg-transparent lg:max-w-2xl'>
            <div className='card lg:card-side max-h-full bg-background shadow-xl'>
               <figure>
                  <img
                     src={entityImage}
                     alt='ReviewEntityImage'
                     className='h-36 w-36 md:h-64 md:w-64 lg:h-96 lg:w-96'
                  />
               </figure>
               <div className='card-body justify-between'>
                  <h2 className='card-title w-full text-center'>
                     {entityName}
                     <div className='badge badge-secondary'>{entityType}</div>
                  </h2>
                  <div className='self-center'>
                     <ListenOnSpotifyLogo entityId={entityId} entityType={entityType} />
                  </div>
                  <div>
                     <label className='block text-base font-bold text-foreground'>Review Name</label>
                     <div className='mt-1'>
                        <input
                           type='text'
                           placeholder='Type here'
                           className='input w-full max-w-md'
                           onChange={e => setName(e.target.value)}
                        />
                     </div>
                  </div>
                  <ToggleWithDescription
                     label='Public'
                     description='If this review is public, it will be viewable by other users.'
                     enabled={isPublic}
                     setEnabled={setIsPublic}
                  />
                  <div className='card-actions justify-end'>
                     <div className='mt-5 flex w-full flex-row items-center justify-around'>
                        <button
                           type='button'
                           disabled={isLoading}
                           onClick={() => close()}
                           className={cn('btn btn-primary btn-md', isLoading && 'btn-loading')}
                        >
                           Cancel
                        </button>

                        <button
                           type='button'
                           disabled={createDisabled}
                           onClick={createReviewMutation}
                           className={cn('btn btn-success btn-md', isLoading && 'btn-loading')}
                        >
                           Create
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </ThemeModal>
      </Portal>
   )
}
