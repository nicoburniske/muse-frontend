import { useNavigate } from "react-router-dom";
import { ReviewEntityOverviewFragment, ReviewOverviewFragment, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { toast } from "react-toastify";
import { HeroLoading } from "component/HeroLoading";

export default function BrowsePage() {
  const { data, loading } = useProfileAndReviewsQuery({ onError: () => toast.error("Failed to load profile.") })
  const reviews = data?.user?.reviews ?? []

  const createGrid = () => {
    return (
      <div className="grid grid-cols-5 gap-4">
        {reviews.map(review => <CreateCard review={review} />)}
      </div>
    )
  }

  if (loading) {
    return <HeroLoading />
  } else {
    return (
      createGrid() 
    )
  }
}
interface CreateCardProps {
  review: ReviewOverviewFragment
}

function CreateCard({ review }: CreateCardProps) {
  const [entityName, image] = getNameAndImage(review.entity)
  const nav = useNavigate()
  const linkToReviewPage = () => nav(`reviews/${review.id}`)
  return (
    <div key={review.id} className="card bg-base-100 shadow-xl">
      <figure><img src={image} /></figure>
      <button onClick={linkToReviewPage} className="card-body hover:bg-base-200">
        <h2 className="card-title">{review.reviewName}</h2>
        <p>{review.entityType} Review: {entityName}</p>
        {/* <div className="card-actions justify-end">
          <button onClick={linkToReviewPage} className="btn btn-primary">View</button>
        </div> */}
      </button>
    </div>
  )
}

// Example: Exhaustive type inferences!
// There are two cases here. 
// Entity types -> Track, Album, Artist, Playlist. 
// 1. Track, Artist, and Playlist all have images on top level.
// 2. Track has images INSIDE of its album.
function getNameAndImage(data: ReviewEntityOverviewFragment): [string, string] {
  if ("images" in data) {
    return [data.name, data.images?.[0]]
  } else {
    // this is a track.
    return [data.name, data.album?.images?.[0] ?? ""]
  }
}
