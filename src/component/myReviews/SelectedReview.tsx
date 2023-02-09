import { Transition } from '@headlessui/react'
import { ChevronRightIcon, PlusIcon as PlusIconMini, TrashIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useQueryClient } from '@tanstack/react-query'
import { ShareReview } from 'component/detailedReview/ShareReview'
import {
   ReviewDetailsFragment,
   useDeleteReviewMutation,
   useProfileAndReviewsQuery,
   useShareReviewMutation,
} from 'graphql/generated/schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import Portal from 'platform/component/Portal'
import { ThemeModal } from 'platform/component/ThemeModal'
import { Fragment, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { nonNullable, findFirstImage, classNames } from 'util/Utils'

const selectedReviewOpenAtom = atom(false)
const selectedReviewIdAtom = atom<string | undefined>(undefined)
const openSelectedReview = atom(null, (_get, set, reviewId: string) => {
   set(selectedReviewOpenAtom, true)
   set(selectedReviewIdAtom, reviewId)
})
const closeSelectedReviewAtom = atom(null, (_get, set) => {
   set(selectedReviewOpenAtom, false)
   setTimeout(() => set(selectedReviewIdAtom, undefined), 500)
})
export const useSelectReview = () => {
   const setSelectedReview = useSetAtom(openSelectedReview)
   const closeSelectedReview = useSetAtom(closeSelectedReviewAtom)
   return {
      setSelectedReview,
      closeSelectedReview,
   }
}

// We need to subscribe to the review overview in react query cache.
const useSelectedReview = () => {
   const reviewId = useAtomValue(selectedReviewIdAtom)
   const { data } = useProfileAndReviewsQuery({}, { staleTime: Infinity })

   if (reviewId) {
      return data?.user?.reviews?.find(r => r.id === reviewId)
   } else {
      return undefined
   }
}

const textColorSecondary = 'text-secondary-content/50'

export const SelectedReview = () => {
   const { closeSelectedReview } = useSelectReview()
   // Close review details after going to new page.
   useEffect(() => () => closeSelectedReview(), [closeSelectedReview])
   const selectedReviewOpen = useAtomValue(selectedReviewOpenAtom)
   const review = useSelectedReview()

   return (
      <Transition
         show={selectedReviewOpen}
         as={Fragment}
         enter='transform transition ease-in-out duration-300'
         enterFrom='translate-x-full'
         enterTo='translate-x-0'
         leave='transform transition ease-in-out duration-300'
         leaveFrom='translate-x-0'
         leaveTo='translate-x-full'
      >
         <div className='fixed right-0 z-10 flex h-full flex-col bg-secondary text-secondary-content'>
            <aside className='h-full w-52 overflow-y-auto  md:w-96'>
               {review && <SidebarContent review={review} />}
            </aside>
         </div>
      </Transition>
   )
}

const SidebarContent = ({ review }: { review: ReviewDetailsFragment }) => {
   const { closeSelectedReview } = useSelectReview()
   const nav = useNavigate()
   const linkToReviewPage = () => nav(`/app/reviews/${review.id}`)

   const queryClient = useQueryClient()
   const resetReviewOverviews = () => queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())
   const { mutate: shareReview } = useShareReviewMutation({
      onError: () => toast.error('Failed to update review sharing.'),
      onSuccess: () => {
         toast.success('Updated review sharing.')
         resetReviewOverviews()
      },
   })
   const unShareReview = (reviewId: string, userId: string) => shareReview({ input: { reviewId, userId } })

   const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
   const allEntities = nonNullable(review?.entity) ? [review?.entity, ...childEntities] : childEntities
   const image = findFirstImage(allEntities)
   const entityType = review?.entity?.__typename
   const info = (() => ({
      'Review Owner': review?.creator?.id,
      Created: new Date(review?.createdAt).toLocaleDateString(),
      Public: review?.isPublic ? 'True' : 'False',
      Links: childEntities?.length ?? 0,

      // Include playlist owner, popularity / num followers, num tracks.
      [`${entityType} Name`]: review?.entity?.name,
   }))()

   const collaborators =
      review?.collaborators
         ?.map(collaborator => ({
            userId: collaborator?.user?.id,
            accessLevel: collaborator?.accessLevel,
            image: collaborator?.user?.spotifyProfile?.images?.at(-1),
         }))
         .filter(nonNullable) ?? []

   return (
      <div className='space-y-2'>
         <div className='mt-4 flex w-full items-start justify-start space-x-5 pl-1'>
            <button type='button' className='btn btn-ghost btn-square' onClick={() => closeSelectedReview()}>
               <span className='sr-only'>Close panel</span>
               <ChevronRightIcon className='h-8 w-8' aria-hidden='true' />
            </button>

            <div>
               <h2 className='text-xl font-bold'>
                  <span className='sr-only'>Details for </span>
                  {review.reviewName}
               </h2>
               <p className={classNames('text-sm font-medium', textColorSecondary)}>{entityType}</p>
            </div>
         </div>
         <div className='relative cursor-pointer' onClick={linkToReviewPage}>
            <img src={image} alt='' className='h-full w-full object-cover' />
         </div>
         <div className='w-full space-y-6 overflow-hidden px-2 md:px-4 lg:px-8'>
            <div>
               <h3 className='font-medium'>Information</h3>
               <dl className='mt-2 divide-y divide-secondary-content/50'>
                  {Object.keys(info).map(key => (
                     <div key={key} className='flex justify-between py-3 text-sm font-medium'>
                        <dt className={classNames(textColorSecondary)}>{key}</dt>
                        <dd className='whitespace-nowrap'>{info[key]}</dd>
                     </div>
                  ))}
               </dl>
            </div>
            <div>
               <h3 className='font-medium'>Shared with</h3>
               <ul
                  role='list'
                  className='mt-2 divide-y  divide-secondary-content/50 border-t border-b border-secondary-content/50'
               >
                  {collaborators.map(({ userId, accessLevel, image }) => (
                     <li
                        key={userId}
                        className='grid h-full w-full grid-cols-3 place-content-between place-items-center py-3 md:grid-cols-5'
                     >
                        <div className='col-span-2 flex items-center place-self-start'>
                           {image ? (
                              <img src={image} alt='' className='hidden h-8 w-8 rounded-lg md:block' />
                           ) : (
                              <div className='avatar placeholder'>
                                 <div className='w-8 rounded-lg bg-neutral-focus text-neutral-content'>
                                    <span className='text-xl'>{userId.charAt(0) ?? '?'}</span>
                                 </div>
                              </div>
                           )}
                           <p className='ml-2 truncate text-sm font-medium'>{userId}</p>
                        </div>
                        <div className='badge badge-primary col-span-2 hidden md:flex'>{accessLevel}</div>
                        <div className='col-span-1 place-self-end'>
                           <button
                              type='button'
                              className='btn btn-error btn-square btn-xs'
                              onClick={() => unShareReview(review.id, userId)}
                           >
                              <XMarkIcon className='h-4 w-4' />
                              <span className='sr-only'> {userId}</span>
                           </button>
                        </div>
                     </li>
                  ))}
                  <li className='m-auto flex items-center justify-center py-2'>
                     <ShareReview reviewId={review.id} collaborators={review.collaborators ?? []}>
                        <span className='flex items-center justify-center rounded-full border-2 border-dashed'>
                           <PlusIconMini className='h-5 w-5' aria-hidden='true' />
                        </span>
                        <span className='ml-4'>Share</span>
                     </ShareReview>
                  </li>
               </ul>
            </div>
            <div className='flex justify-center'>
               <DeleteReviewButton reviewId={review.id} />
            </div>
         </div>
      </div>
   )
}

const DeleteReviewButton = ({ reviewId }: { reviewId: string }) => {
   const [isModalOpen, setIsModalOpen] = useState(false)

   const queryClient = useQueryClient()
   const resetReviewOverviews = () => queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())
   const { closeSelectedReview } = useSelectReview()

   const { mutate, isLoading } = useDeleteReviewMutation({
      onError: () => toast.error('Failed to delete review.'),
      onSuccess: () => {
         toast.success('Successfully deleted review.')
         resetReviewOverviews()
      },
      onSettled: () => {
         setIsModalOpen(false)
         closeSelectedReview()
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
                           className={classNames('btn btn-primary btn-md', isLoading && 'btn-loading')}
                        >
                           Cancel
                        </button>

                        <button
                           type='button'
                           disabled={isLoading}
                           onClick={deleteReview}
                           className={classNames('btn btn-error btn-md', isLoading && 'btn-loading')}
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
