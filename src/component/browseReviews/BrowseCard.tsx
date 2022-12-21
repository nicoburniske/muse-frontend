import { ReviewDetailsFragment } from 'graphql/generated/schema'
import { useNavigate } from 'react-router'
import { nonNullable, findFirstImage } from 'util/Utils'

interface BrowseCardProps {
    review: ReviewDetailsFragment
}

export function BrowseCard({ review }: BrowseCardProps) {
    const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
    const allEntities = nonNullable(review?.entity) ? [review?.entity, ...childEntities] : childEntities
    const image = findFirstImage(allEntities)
    const entityName = allEntities.map(e => e.name).find(nonNullable)
    const nav = useNavigate()
    const linkToReviewPage = () => nav(`/reviews/${review.id}`)
    const creatorName = review?.creator?.spotifyProfile?.displayName ?? 'Unknown'
    return (
        <div className="card bg-base-100 shadow-xl hover:bg-base-200 transition-all duration-200 hover:shadow hover:-translate-y-1 cursor-pointer " key={review.id} onClick={linkToReviewPage}>
            <img className="aspect-square object-contain" src={image} />
            <div className="mt-auto flex flex-col justify-center items-center text-center">
                <div className="stat-title text-xs md:text-base w-full truncate">{entityName}</div>
                <div className="stat-value text-xs md:text-base w-full truncate">{review.reviewName}</div>
                <div className="stat-desc text-xs md:text-base w-full truncate"> {creatorName} </div>
            </div>
        </div >
    )
}
