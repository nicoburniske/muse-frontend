import { useNavigate } from "react-router-dom";
import { ReviewEntityOverviewFragment, ReviewOverviewFragment, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { toast } from "react-toastify";
import { HeroLoading } from "component/HeroLoading";

export default function BrowsePage() {
  const { data, loading } = useProfileAndReviewsQuery({ onError: () => toast.error("Failed to load profile.") })
  const reviews = data?.user?.reviews ?? []

  const createGrid = () => {
    return (
      <div className="grid grid-cols-6 gap-4 py-10 px-2 bg-inherit">
        {reviews.map(review => <CreateCard key={review.id} review={review} />)}
      </div>
    )
  }

  if (loading && data == undefined) {
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
  const creatorName = review?.creator?.spotifyProfile?.displayName ?? "Unknown"
  return (
    <div key={review.id} className="card bg-base-100 shadow-xl">
      <figure><img src={image} /></figure>
      <button onClick={linkToReviewPage} className="card-body hover:bg-base-200 p-2">

        <div className="stat w-full flex flex-col justify-center items-center">
          <div className="stat-title whitespace-normal">{entityName}</div>
          <div className="stat-value w-full text-lg whitespace-normal">{review.reviewName}</div>
          <div className="stat-desc"> {creatorName} </div>
        </div>
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
