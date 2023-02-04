import { CheckIcon, CrossIcon } from 'component/Icons'
import {
   EntityType,
   useCreateReviewMutation,
   useDetailedReviewQuery,
   useProfileAndReviewsQuery,
} from 'graphql/generated/schema'
import { Atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { nonNullable } from 'util/Utils'

interface CreateReviewButtonProps {
   entityTypeAtom: PrimitiveAtom<EntityType>
   entityIdAtom: PrimitiveAtom<string | undefined>
   isPublicAtom: PrimitiveAtom<boolean>
   parentReviewIdAtom: Atom<string | undefined>
   debouncedReviewNameAtom: PrimitiveAtom<string>
   createReviewModalOpenAtom: PrimitiveAtom<boolean>
}

export const CreateReviewButtons = ({
   entityTypeAtom,
   entityIdAtom,
   isPublicAtom,
   parentReviewIdAtom,
   debouncedReviewNameAtom,
   createReviewModalOpenAtom,
}: CreateReviewButtonProps) => {
   const [entityType, setEntityType] = useAtom(entityTypeAtom)
   const [isPublic, setIsPublic] = useAtom(isPublicAtom)
   const [entityId, setEntityId] = useAtom(entityIdAtom)
   const parentReviewId = useAtomValue(parentReviewIdAtom)
   const queryClient = useQueryClient()

   const [name, setReviewName] = useAtom(debouncedReviewNameAtom)
   const setModalOpen = useSetAtom(createReviewModalOpenAtom)

   const { isLoading, mutate } = useCreateReviewMutation({
      onError: () => toast.error(`Failed to create ${entityType} review.`),
      onSuccess: () => {
         toast.success(`Successfully created ${entityType} review.`)
         setModalOpen(false)
         setEntityId(undefined)
         setIsPublic(false)
         setReviewName('')
         queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())
         if (nonNullable(parentReviewId)) {
            queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId: parentReviewId }))
         }
      },
   })

   const parentLink = parentReviewId === undefined ? undefined : { parentReviewId }
   const entity = entityId !== undefined ? { entityId, entityType } : undefined
   const input = { isPublic: isPublic ? true : false, name, entity, link: parentLink }

   const createReviewMutation = () => mutate({ input })

   const canSubmit = useMemo(() => !isLoading && name.length > 0, [isLoading, name])

   const onCancel = () => {
      setModalOpen(false)
      setEntityId(undefined)
      setReviewName('')
      setEntityType(EntityType.Playlist)
   }

   return (
      <div className='m-0 flex w-full flex-row items-center justify-around'>
         <button
            className='btn btn-success disabled:btn-outline'
            disabled={!canSubmit}
            onClick={() => createReviewMutation()}
         >
            <CheckIcon />
         </button>
         <button className='btn btn-info' onClick={onCancel}>
            <CrossIcon />
         </button>
      </div>
   )
}
