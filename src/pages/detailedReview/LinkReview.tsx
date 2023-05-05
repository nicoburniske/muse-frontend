import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'

import {
   ProfileAndReviewsQuery,
   useDetailedReviewQuery,
   useLinkReviewsMutation,
   useProfileAndReviewsQuery,
} from '@/graphql/generated/schema'
import { Button } from '@/lib/component/Button'
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/lib/component/Dialog'
import { ScrollArea } from '@/lib/component/ScrollArea'
import { cn, getReviewOverviewImage } from '@/util/Utils'

const searchTextResult = 'select-none truncate text-sm lg:text-base p-0.5'

export const LinkReviewButton = ({ reviewId, alreadyLinkedIds }: { reviewId: string; alreadyLinkedIds: string[] }) => {
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
      setSelectedReview(undefined)
   }

   return (
      <Dialog>
         <DialogTrigger>
            <Button variant={'outline'}>Link</Button>
         </DialogTrigger>
         <DialogContent className='rounded-md sm:max-w-3xl'>
            <DialogTitle>Link Review</DialogTitle>

            <ScrollArea className='h-72 w-full'>
               {reviews.map(r => {
                  const image = getReviewOverviewImage(r)
                  const style =
                     r.id === selectedReview
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
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
            </ScrollArea>
            <DialogFooter>
               <Button onClick={handleLinkReview} disabled={!canSubmit || isLoading}>
                  Confirm
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}

const selectReviews = (alreadyLinkedReviewIds: string[]) => (data: ProfileAndReviewsQuery) => {
   return (data.user.reviews ?? [])
      .filter(r => !alreadyLinkedReviewIds.includes(r.id))
      .filter(r => r.entity?.__typename === 'Album' || r.entity?.__typename === 'Playlist')
}
