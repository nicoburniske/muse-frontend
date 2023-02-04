import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
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
         className='group card relative cursor-pointer bg-base-200 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-base-300 hover:shadow'
         key={review.id}
         onClick={onClick}
      >
         <button className='btn btn-ghost btn-square absolute top-0 right-0 z-10' onClick={linkToReviewPage}>
            <ArrowTopRightOnSquareIcon
               className='h-6 w-6 stroke-accent opacity-0 transition-all duration-300 
                    ease-out hover:scale-125 group-hover:opacity-100'
            />
         </button>
         {/* <div className=" block w-full overflow-hidden rounded-lg">
                <img className="object-cover object-center" src={image} />
            </div> */}
         <div className='aspect-w-4 aspect-h-4 block w-full overflow-hidden'>
            <img src={image} alt='' className='object-cover' />
         </div>

         <div className='mt-auto flex flex-col items-center justify-center text-center'>
            <div className='stat-title w-full truncate text-xs md:text-base'>{entityName}</div>
            <div className='stat-value w-full truncate text-xs md:text-base'>{review.reviewName}</div>
            <div className='stat-desc w-full truncate text-xs md:text-base'> {creatorName} </div>
         </div>
      </div>
   )
}
