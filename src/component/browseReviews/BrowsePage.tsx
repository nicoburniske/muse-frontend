import { useNavigate } from "react-router-dom";
import { EntityType, ReviewEntityOverviewFragment, ReviewOverviewFragment, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { toast } from "react-toastify";
import { HeroLoading } from "component/HeroLoading";
import { currentUserIdAtom, refreshOverviewAtom, searchLoweredAtom } from "state/Atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";

export default function BrowsePage() {
  const search = useAtomValue(searchLoweredAtom)
  const { data, loading, refetch } = useProfileAndReviewsQuery({ onError: () => toast.error("Failed to load profile.") })
  const reviews = useMemo(() =>
    data?.user?.reviews?.filter(r =>
      r.reviewName.toLowerCase().includes(search) ||
      r.creator.id.toLowerCase().includes(search) ||
      r.entity.name.toLowerCase().includes(search) ||
      (r.entity.__typename === EntityType.Playlist &&
        (r.entity.owner?.id.toLowerCase().includes(search) ||
          r.entity.owner?.spotifyProfile?.displayName?.toLowerCase().includes(search))) ||
      r.creator.spotifyProfile?.displayName?.toLowerCase().includes(search)
    ) ?? [], [search, data])

  // Set current user name.
  const setCurrentUserId = useSetAtom(currentUserIdAtom)
  useEffect(() => {
    const maybeUser = data?.user?.id
    if (maybeUser !== undefined) {
      setCurrentUserId(maybeUser)
    }
  }, [data])

  // We to update the reviews in case one gets created.
  const refreshCount = useAtomValue(refreshOverviewAtom)
  useMemo(() => refetch(), [refreshCount])

  if (loading && data == undefined) {
    return <HeroLoading />
  } else {
    return (
      <div className="grid grid-cols-6 gap-4 py-10 px-2 bg-inherit">
        {reviews.map(review => <CreateCard key={review.id} review={review} />)}
      </div>
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
      <button onClick={linkToReviewPage} className="card-body flex justify-center hover:bg-base-200 p-2">
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
  } else if ('artistImages' in data) {
    return [data.name, data.artistImages?.[0] ?? ""]
  } else {
    // TODO: what is this complaining about?
    return [data.name, data.album?.images?.[0] ?? ""]
  }
}
