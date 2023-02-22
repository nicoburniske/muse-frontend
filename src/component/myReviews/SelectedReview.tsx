import { ChevronRightIcon, PlusIcon as PlusIconMini, TrashIcon } from '@heroicons/react/20/solid'
import { useQueryClient } from '@tanstack/react-query'
import { ListenOnSpotifyLogo } from 'component/ListenOnSpotify'
import { ShareReview } from 'component/shareReview/ShareReview'
import { UserWithAccessLevel } from 'component/shareReview/UserWithAccessLevel'
import {
   useCollaboratorsQuery,
   useDetailedReviewCacheQuery,
   useIsReviewEditableQuery,
} from 'component/useDetailedReviewCacheQuery'
import { ReviewDetailsFragment, useDeleteReviewMutation, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import Portal from 'platform/component/Portal'
import RightSidePane from 'platform/component/RightSidePane'
import { ThemeModal } from 'platform/component/ThemeModal'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useCurrentUserId } from 'state/CurrentUser'
import { nonNullable, findFirstImage, cn } from 'util/Utils'

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
const useSelectedReview = (userId?: string) => {
   const reviewId = useAtomValue(selectedReviewIdAtom)
   const { data } = useDetailedReviewCacheQuery(
      reviewId!,
      d => d.review,
      { enabled: !!reviewId, staleTime: Infinity },
      userId
   )
   return data
}

const textColorSecondary = 'text-secondary-content/50'

export const SelectedReview = ({ userId }: { userId?: string }) => {
   const { closeSelectedReview } = useSelectReview()
   // Close review details after going to new page.
   useEffect(() => () => closeSelectedReview(), [closeSelectedReview])
   const selectedReviewOpen = useAtomValue(selectedReviewOpenAtom)
   const review = useSelectedReview(userId)

   return <RightSidePane isOpen={selectedReviewOpen}>{review && <SidebarContent review={review} />}</RightSidePane>
}

const SidebarContent = ({ review }: { review: ReviewDetailsFragment }) => {
   const { closeSelectedReview } = useSelectReview()

   const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
   const allEntities = nonNullable(review?.entity) ? [review?.entity, ...childEntities] : childEntities
   const image = findFirstImage(allEntities)
   const entityType = review?.entity?.__typename
   const entityId = review?.entity?.id

   const nameToShow = review.creator.spotifyProfile?.displayName ?? review.creator.id

   const info = (() => ({
      'Review Owner': <Link to={`/app/user/${review.creator.id}`}>{nameToShow}</Link>,
      Created: new Date(review.createdAt).toLocaleDateString(),
      Public: review?.isPublic ? 'True' : 'False',
      Links: childEntities?.length ?? 0,

      // Include playlist owner, popularity / num followers, num tracks.
      [`${entityType} Name`]: review?.entity?.name,
   }))()

   const { data: collabData } = useCollaboratorsQuery(review.id)
   const collaborators = collabData ?? []

   const currentUserId = useCurrentUserId()
   const isEditable = useIsReviewEditableQuery(review.id, currentUserId)

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
               <p className={cn('text-sm font-medium', textColorSecondary)}>{entityType}</p>
            </div>
         </div>
         <Link to={`/app/reviews/${review.id}`}>
            <img src={image} alt='' className='h-full w-full object-cover' />
         </Link>
         <div className='w-full space-y-6 overflow-hidden px-2 md:px-4 lg:px-8'>
            <div>
               <h3 className='font-medium'>Information</h3>
               <dl className='mt-2 divide-y divide-secondary-content/50'>
                  {Object.keys(info).map(key => (
                     <div key={key} className='flex justify-between py-3 text-sm font-medium'>
                        <dt className={cn(textColorSecondary)}>{key}</dt>
                        <dd className='text-right'>{info[key]}</dd>
                     </div>
                  ))}
               </dl>
               <div className='grid place-items-center'>
                  <ListenOnSpotifyLogo entityId={entityId} entityType={entityType} />
               </div>
            </div>

            <div>
               <h3 className='font-medium'>Shared with</h3>
               <ul
                  role='list'
                  className='mt-2 divide-y divide-secondary-content/50 border-t border-b border-secondary-content/50'
               >
                  {collaborators.map(user => (
                     <div className='p-2' key={user.user.id}>
                        <UserWithAccessLevel reviewId={review.id} user={user} />
                     </div>
                  ))}
                  {isEditable && (
                     <li className='m-auto flex items-center justify-center py-2'>
                        <ShareReview reviewId={review.id} collaborators={review.collaborators ?? []}>
                           <span className='flex items-center justify-center rounded-full border-2 border-dashed'>
                              <PlusIconMini className='h-5 w-5' aria-hidden='true' />
                           </span>
                           <span className='ml-4'>Share</span>
                        </ShareReview>
                     </li>
                  )}
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
