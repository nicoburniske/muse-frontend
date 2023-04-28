import { PlusIcon as PlusIconMini } from '@heroicons/react/20/solid'
import { ListenOnSpotifyLogoTooltip } from 'component/ListenOnSpotify'
import { ShareReview } from 'component/shareReview/ShareReview'
import { UserWithAccessLevel } from 'component/shareReview/UserWithAccessLevel'
import { useCollaboratorsQuery, useDetailedReviewCacheQuery, useIsReviewOwner } from 'state/useDetailedReviewCacheQuery'
import { ReviewDetailsFragment } from 'graphql/generated/schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUserId } from 'state/CurrentUser'
import { nonNullable, findFirstImage, cn } from 'util/Utils'
import { DeleteReviewButton } from 'component/DeleteReviewButton'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from 'platform/component/Sheet'
import { Badge } from 'platform/component/Badge'
import { Button } from 'platform/component/Button'

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

   return (
      review && (
         <Sheet
            open={selectedReviewOpen}
            onOpenChange={open => {
               if (!open) {
                  closeSelectedReview()
               }
            }}
         >
            <SidebarContent review={review} />
         </Sheet>
      )
   )
}

const SidebarContent = ({ review }: { review: ReviewDetailsFragment }) => {
   const { closeSelectedReview } = useSelectReview()

   const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
   const allEntities = nonNullable(review?.entity) ? [review?.entity, ...childEntities] : childEntities
   const image = findFirstImage(allEntities)
   const entityType = review?.entity?.__typename
   const entityName = review?.entity?.name
   const entityId = review?.entity?.id

   const nameToShow = review.creator.spotifyProfile?.displayName ?? review.creator.id

   const info = (() => ({
      'Review Owner': <Link to={`/app/user/${review.creator.id}`}>{nameToShow}</Link>,
      Created: new Date(review.createdAt).toLocaleDateString(),
      Public: review?.isPublic ? 'True' : 'False',
      Links: childEntities?.length ?? 0,

      // Include playlist owner, popularity / num followers, num tracks.
      // [`${entityType} Name`]: review?.entity?.name,
   }))() as Record<string, React.ReactNode>

   const { data: collabData } = useCollaboratorsQuery(review.id)
   const collaborators = collabData ?? []

   const currentUserId = useCurrentUserId()
   const isEditable = useIsReviewOwner(review.id, currentUserId)

   return (
      <SheetContent position='right' size='content' className='overflow-y-auto'>
         {/* <div className='flex w-full items-center justify-start space-x-5 p-2 pl-1'> */}
         <SheetHeader>
            <SheetTitle>
               <span className='sr-only'>Details for Review </span>
               {review.reviewName}
            </SheetTitle>

            <SheetDescription className='flex justify-evenly'>
               <span className='text-lg'>{entityName} </span>
               <Badge variant='outline'>{entityType}</Badge>
            </SheetDescription>
         </SheetHeader>
         {/* </div> */}
         <Link to={`/app/reviews/${review.id}`}>
            <img src={image} alt='Review Entity Image' className='h-56 w-56 object-cover py-2 md:h-96 md:w-96' />
         </Link>
         <div className='w-full overflow-hidden px-2 md:px-4 lg:px-8'>
            <div>
               <h3 className='font-medium'>Information</h3>
               <dl className='divide-secondary-content/50 mt-2 divide-y'>
                  {Object.keys(info).map(key => (
                     <div key={key} className='flex justify-between py-3 text-sm font-medium'>
                        <dt className={cn(textColorSecondary)}>{key}</dt>
                        <dd className='text-right'>{info[key]}</dd>
                     </div>
                  ))}
               </dl>
               <div className='grid place-items-center'>
                  <ListenOnSpotifyLogoTooltip entityId={entityId} entityType={entityType} />
               </div>
            </div>

            {collaborators.length > 0 && (
               <div>
                  <h3 className='font-medium'>Shared with</h3>
                  <ul role='list' className='my-2 h-40 overflow-y-auto border-b border-t'>
                     {collaborators.map(user => (
                        <div className='p-2' key={user.user.id}>
                           <UserWithAccessLevel reviewId={review.id} user={user} />
                        </div>
                     ))}
                  </ul>
               </div>
            )}
         </div>

         <div className='flex flex-col space-y-2'>
            <ShareReview reviewId={review.id} collaborators={review.collaborators ?? []}>
               <Button>
                  <span className='flex items-center justify-center rounded-full border-2 border-dashed'>
                     <PlusIconMini className='h-5 w-5' aria-hidden='true' />
                  </span>
                  <span className='ml-4'>Share</span>
               </Button>
            </ShareReview>

            <DeleteReviewButton reviewId={review.id} onSettled={closeSelectedReview} />
         </div>
      </SheetContent>
   )
}
