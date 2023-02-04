import { useDetailedReviewQuery, useLinkReviewsMutation, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { useState } from 'react'
import { CheckIcon, CrossIcon, LinkIcon } from 'component/Icons'
import { Virtuoso } from 'react-virtuoso'
import { getReviewOverviewImage } from 'util/Utils'
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
      { onError: () => toast.error('Failed to load user reviews.') }
   )
   const { mutate: createReviewLink } = useLinkReviewsMutation({
      onSuccess: () => {
         queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId }))
         onCancel()
      },
      onError: () => toast.error('Failed to link review.'),
   })
   // We don't want to include any unlinkable reviews.
   const reviews = (data?.user?.reviews ?? [])
      .filter(r => !alreadyLinkedIds.includes(r.id))
      .filter(r => r.id !== reviewId)
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
            <ThemeModal open={isModalOpen} className='h-4/5 max-w-2xl grow'>
               <div className='flex h-full w-full flex-col items-center justify-between space-y-5 p-3 '>
                  <Dialog.Title>
                     <h3 className='flex-1 text-lg font-bold text-base-content'> Link Review </h3>
                  </Dialog.Title>

                  <Virtuoso
                     className='w-full space-y-1 overflow-y-auto'
                     data={reviews}
                     overscan={200}
                     itemContent={(i, review) => {
                        const image = getReviewOverviewImage(review)
                        const [bgStyle, textStyle, hoverStyle] =
                           review.id === selectedReview
                              ? ['bg-success', 'text-success-content', '']
                              : ['bg-base-200', 'text-base-content', 'hover:bg-base-focus']
                        return (
                           <div
                              className={`card card-body m-1 flex h-24 w-full max-w-full flex-row items-center justify-around p-0.5 ${bgStyle} ${hoverStyle}`}
                              key={i}
                              onClick={() => setSelectedReview(review.id)}
                           >
                              <div className='avatar flex-none'>
                                 <div className='w-8 rounded md:w-16'>
                                    <img src={image} />
                                 </div>
                              </div>
                              <div className='grid max-w-[75%] grow grid-cols-3 text-center'>
                                 <div className={`${searchTextResult} ${textStyle}`}> {review.reviewName} </div>
                                 <div className={`${searchTextResult} ${textStyle}`}> {review.entity?.name} </div>
                                 <div className={`${searchTextResult} ${textStyle}`}> {review.creator.id} </div>
                              </div>
                           </div>
                        )
                     }}
                  />
                  <div className='m-0 flex w-full flex-row items-center justify-around'>
                     <button
                        className={`btn btn-success disabled:btn-outline ${isLoading ? 'loading' : ''}`}
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
