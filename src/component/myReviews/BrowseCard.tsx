import { ReviewDetailsFragment } from 'graphql/generated/schema'
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
   const nav = useNavigate()
   const linkToReviewPage = () => nav(`/app/reviews/${review.id}`)
   const creatorName = review?.creator?.spotifyProfile?.displayName ?? 'Unknown'
   return (
      <div
         className='bg-base-200 shadow transition-all duration-200 hover:-translate-y-0.5 hover:bg-base-300 hover:shadow-xl'
         key={review.id}
      >
         {/* This ensures that we have square aspect ratio */}
         <div className='aspect-w-4 aspect-h-4' onClick={onClick}>
            {/* No image distortion and crop the image into center */}
            <img src={image} alt='ReviewImage' className='object-cover object-center' />
         </div>

         <div
            className='mt-auto flex cursor-pointer flex-col items-center justify-center text-center'
            onClick={linkToReviewPage}
         >
            <div className='stat-title w-full truncate text-xs md:text-base'>{entityName}</div>
            <div className='w-full truncate text-xs font-extrabold md:text-base'>{review.reviewName}</div>
            <div className='stat-desc w-full truncate text-xs md:text-base'> {creatorName} </div>
         </div>
      </div>
   )
}
