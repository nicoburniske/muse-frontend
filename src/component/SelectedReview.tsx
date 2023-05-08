import { ArrowUpOnSquareIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { DeleteReviewModal } from '@/component/deleteReview/DeleteReviewButton'
import { useEditReview } from '@/component/editReview/EditReview'
import { ListenOnSpotifyLogoTooltip } from '@/component/ListenOnSpotify'
import { UserWithAccessLevel } from '@/component/shareReview/UserWithAccessLevel'
import { ReviewDetailsFragment } from '@/graphql/generated/schema'
import { makeModalAtoms } from '@/lib/atom/makeModalAtoms'
import { Badge } from '@/lib/component/Badge'
import { Button } from '@/lib/component/Button'
import { ScrollArea } from '@/lib/component/ScrollArea'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/lib/component/Sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/component/Tabs'
import { useCurrentUserId } from '@/state/CurrentUser'
import {
   useCollaboratorsQuery,
   useDetailedReviewCacheQuery,
   useIsReviewOwner,
} from '@/state/useDetailedReviewCacheQuery'
import { cn, findFirstImage, nonNullable } from '@/util/Utils'

import { useShareReview } from './shareReview/ShareReview'

const { setOpen, setClose, valueAtom: reviewIdAtom, openAtom } = makeModalAtoms<string | null, string>(null)

export const useSelectReview = () => ({
   setSelectedReview: useSetAtom(setOpen),
   closeSelectedReview: useSetAtom(setClose),
})

// We need to subscribe to the review overview in react query cache.
const useSelectedReview = (userId?: string) => {
   const reviewId = useAtomValue(reviewIdAtom) ?? ''
   const { data } = useDetailedReviewCacheQuery(reviewId, d => d.review, { staleTime: Infinity }, userId)
   return data
}

export const SelectedReviewModal = ({ userId }: { userId?: string }) => {
   const { closeSelectedReview } = useSelectReview()
   // Close review details after going to new page.
   useEffect(() => () => closeSelectedReview(), [closeSelectedReview])
   const [open, setOpen] = useAtom(openAtom)
   const review = useSelectedReview(userId)

   return review ? (
      <Sheet open={open} onOpenChange={setOpen}>
         <SidebarContent review={review} />
      </Sheet>
   ) : null
}

const SidebarContent = ({ review }: { review: ReviewDetailsFragment }) => {
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

   const { openShareReview } = useShareReview()
   const { openEditReview } = useEditReview()

   return (
      <SheetContent position='right' size='content' className='overflow-y-auto'>
         {/* <div className='flex w-full items-center justify-start space-x-5 p-2 pl-1'> */}
         <SheetHeader>
            <SheetTitle>
               <span className='sr-only'>Details for Review </span>
               {review.reviewName}
            </SheetTitle>

            <div className='flex justify-evenly'>
               <SheetDescription>
                  <span className='text-lg'>{entityName} </span>
               </SheetDescription>

               <Badge>{entityType}</Badge>
            </div>
         </SheetHeader>
         {/* </div> */}
         <Link to={`/app/reviews/${review.id}`}>
            <img src={image} alt='Review Entity Image' className='h-56 w-56 object-cover py-2 md:h-96 md:w-96' />
         </Link>

         <div className='grid place-items-center'>
            <ListenOnSpotifyLogoTooltip entityId={entityId} entityType={entityType} />
         </div>
         {isEditable && (
            <div className='m-auto flex items-center justify-center gap-4 p-1'>
               <Button variant='outline' onClick={() => openShareReview(review.id)}>
                  <ArrowUpOnSquareIcon className='h-5 w-5' aria-hidden='true' />
                  <span className='ml-1'>Share</span>
               </Button>
               <Button variant='outline' onClick={() => openEditReview(review.id)}>
                  <PencilSquareIcon className='h-5 w-5' aria-hidden='true' />
                  <span className='ml-1'>Edit</span>
               </Button>
            </div>
         )}
         <Tabs defaultValue='info' className='my-2'>
            <TabsList className='grid w-full grid-cols-2'>
               <TabsTrigger value='info'>Info</TabsTrigger>
               <TabsTrigger value='share'>Sharing</TabsTrigger>
            </TabsList>
            <TabsContent value='info'>
               <dl className='divide-primary-content/50 mt-2 divide-y px-4'>
                  {Object.keys(info).map(key => (
                     <div key={key} className='flex justify-between py-3 text-sm font-medium'>
                        <dt className={cn()}>{key}</dt>
                        <dd className='text-right'>{info[key]}</dd>
                     </div>
                  ))}
               </dl>
            </TabsContent>
            <TabsContent value='share'>
               {collaborators.length > 0 ? (
                  <ScrollArea className='h-40'>
                     {collaborators.map(user => (
                        <div className='p-1' key={user.user.id}>
                           <UserWithAccessLevel reviewId={review.id} user={user} />
                        </div>
                     ))}
                  </ScrollArea>
               ) : (
                  <div className='grid h-40 place-items-center'>
                     <div>Not Shared</div>
                  </div>
               )}
            </TabsContent>
         </Tabs>

         {isEditable && (
            <div className='m-1 flex flex-col'>
               <DeleteReviewModal reviewId={review.id} />
            </div>
         )}
      </SheetContent>
   )
}
