import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { ReviewDetailsFragment } from 'graphql/generated/schema'
import { Badge } from 'platform/component/Badge'
import { Button } from 'platform/component/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from 'platform/component/Card'
import { useNavigate } from 'react-router'
import { nonNullable, findFirstImage } from 'util/Utils'

interface BrowseCardProps {
   review: ReviewDetailsFragment
   onClick: () => void
}

export function BrowseCard({ review, onClick }: BrowseCardProps) {
   const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
   const allEntities = nonNullable(review?.entity) ? [review?.entity, ...childEntities] : childEntities
   const image = findFirstImage(allEntities)
   const entityName = allEntities.map(e => e.name).find(nonNullable)
   const entityType = allEntities.map(e => e.__typename).find(nonNullable)
   const nav = useNavigate()
   const linkToReviewPage = () => nav(`/app/reviews/${review.id}`)
   const linkToProfile = () => nav(`/app/user/${review.creator.id}`)
   const creatorName = review?.creator?.spotifyProfile?.displayName ?? 'Unknown'

   return (
      <Card
         className='relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg'
         onClick={linkToReviewPage}
      >
         <CardHeader className='space-y-0 p-4 pb-0'>
            <CardTitle className='line-clamp-1'>{review.reviewName}</CardTitle>
            <Button
               variant='link'
               size='sm'
               onClick={e => {
                  linkToProfile()
                  e.stopPropagation()
               }}
               className='justify-start px-0 py-0 text-muted-foreground'
            >
               {creatorName}
            </Button>
         </CardHeader>
         <CardContent className='p-2'>
            <div className='muse-review-card-image aspect-h-4 aspect-w-4'>
               {/* No image distortion and crop the image into center */}
               <img src={image} alt='ReviewImage' className='object-cover object-center' />
            </div>
         </CardContent>
         <CardFooter className='flex-col items-start space-y-1 p-4 pt-0'>
            <CardDescription className='line-clamp-1'>{entityName}</CardDescription>
            <div className='flex w-full justify-between'>
               <Badge variant='outline'>{entityType}</Badge>
               <Button
                  variant='svg'
                  size='empty'
                  onClick={e => {
                     onClick()
                     e.stopPropagation()
                  }}
               >
                  <EllipsisVerticalIcon className='h-6 w-6' aria-hidden='true' />
               </Button>
            </div>
         </CardFooter>
      </Card>
   )
}
