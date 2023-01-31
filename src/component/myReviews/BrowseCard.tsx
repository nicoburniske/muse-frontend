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
        <div className="relative group card bg-base-200 shadow-xl hover:bg-base-300 transition-all duration-200 hover:shadow hover:-translate-y-1 cursor-pointer"
            key={review.id}
            onClick={onClick}
        >
            <button
                className="z-10 absolute top-0 right-0 btn btn-square btn-ghost"
                onClick={linkToReviewPage}
            >
                <ArrowTopRightOnSquareIcon
                    className="h-6 w-6 stroke-accent transition-all ease-out opacity-0 
                    group-hover:opacity-100 hover:scale-125 duration-300" />
            </button>
            {/* <div className=" block w-full overflow-hidden rounded-lg">
                <img className="object-cover object-center" src={image} />
            </div> */}
            <div className="aspect-w-4 aspect-h-4 block w-full overflow-hidden">
                <img src={image} alt="" className="object-cover" />
            </div>

            <div className="mt-auto flex flex-col justify-center items-center text-center">
                <div className="stat-title text-xs md:text-base w-full truncate">{entityName}</div>
                <div className="stat-value text-xs md:text-base w-full truncate">{review.reviewName}</div>
                <div className="stat-desc text-xs md:text-base w-full truncate"> {creatorName} </div>
            </div>
        </div >
    )
}
