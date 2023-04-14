import {
   ProfileAndReviewsQuery,
   useDetailedReviewQuery,
   useLinkReviewsMutation,
   useProfileAndReviewsQuery,
} from 'graphql/generated/schema'
import { useState } from 'react'
import { CheckIcon, CrossIcon, LinkIcon } from 'component/Icons'
import { cn, getReviewOverviewImage } from 'util/Utils'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Dialog } from '@headlessui/react'
import { ThemeModal } from 'platform/component/ThemeModal'
import Portal from 'platform/component/Portal'

const searchTextResult = 'select-none truncate text-sm lg:text-base p-0.5'

export const LinkReviewButton = ({ reviewId, alreadyLinkedIds }: { reviewId: string; alreadyLinkedIds: string[] }) => {
   const [isModalOpen, setIsModalOpen] = useState(false)
   const queryClient = useQueryClient()
   const { data, isLoading } = useProfileAndReviewsQuery(
      {},
      {
         onError: () => toast.error('Failed to load user reviews.'),
         select: selectReviews([...alreadyLinkedIds, reviewId]),
      }
   )
   const reviews = data ?? []

   const { mutate: createReviewLink } = useLinkReviewsMutation({
      onSuccess: () => {
         queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId }))
         onCancel()
      },
      onError: () => toast.error('Failed to link review.'),
   })

   const [selectedReview, setSelectedReview] = useState<undefined | string>(undefined)

   const handleLinkReview = () => {
      if (selectedReview) {
         createReviewLink({ input: { parentReviewId: reviewId, childReviewId: selectedReview } })
      }
   }

   const canSubmit = selectedReview !== undefined

   const onCancel = () => {
      setIsModalOpen(false)
      setSelectedReview(undefined)
   }

   return (
      <>
         <button className='btn btn-secondary btn-sm lg:btn-md' onClick={() => setIsModalOpen(true)}>
            <LinkIcon />
         </button>
         <Portal>
            <ThemeModal open={isModalOpen} className='max-w-2xl grow'>
               <div className='flex h-full w-full flex-col items-center justify-between space-y-5 p-3 '>
                  <Dialog.Title>
                     <h3 className='flex-1 text-lg font-bold text-base-content'> Link Review </h3>
                  </Dialog.Title>

                  <div className='h-96 w-full space-y-1 overflow-y-auto'>
                     {reviews.map(r => {
                        const image = getReviewOverviewImage(r)
                        const style =
                           r.id === selectedReview
                              ? 'bg-success text-success-content'
                              : 'bg-base-200 text-base-content hover:bg-base-focus'
                        return (
                           <div
                              className={cn('card card-body flex h-20 flex-row items-center justify-around p-1', style)}
                              key={r.id}
                              onClick={() => setSelectedReview(r.id)}
                           >
                              <div className='avatar flex-none'>
                                 <div className='w-16 rounded'>
                                    <img src={image} />
                                 </div>
                              </div>
                              <div className='grid min-w-0 grow grid-cols-3 text-center'>
                                 <div className={searchTextResult}> {r.reviewName} </div>
                                 <div className={searchTextResult}>{r.entity?.name} </div>
                                 <div className={searchTextResult}>{r.creator.id} </div>
                              </div>
                           </div>
                        )
                     })}
                  </div>
                  <div className='m-0 flex w-full flex-row items-center justify-around'>
                     <button
                        className={cn('btn btn-success disabled:btn-outline', isLoading ?? 'loading')}
                        disabled={!canSubmit}
                        onClick={handleLinkReview}
                     >
                        <CheckIcon />
                     </button>
                     <button className='btn btn-info' onClick={onCancel}>
                        <CrossIcon />
                     </button>
                  </div>
               </div>
            </ThemeModal>
         </Portal>
      </>
   )
}

const selectReviews = (alreadyLinkedReviewIds: string[]) => (data: ProfileAndReviewsQuery) => {
   return (data.user.reviews ?? [])
      .filter(r => !alreadyLinkedReviewIds.includes(r.id))
      .filter(r => r.entity?.__typename === 'Album' || r.entity?.__typename === 'Playlist')
}
