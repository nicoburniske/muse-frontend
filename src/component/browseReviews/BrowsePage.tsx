import { useNavigate } from "react-router-dom";
import { EntityType, ReviewEntityOverviewFragment, ReviewOverviewFragment, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { toast } from "react-toastify";
import { HeroLoading } from "component/HeroLoading";
import { currentUserIdAtom, refreshOverviewAtom, searchLoweredAtom } from "state/Atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";

export default function BrowsePage() {
  const search = useAtomValue(searchLoweredAtom)
  const { data, loading, refetch } = useProfileAndReviewsQuery({ onError: () => toast.error("Failed to load profile.") })
  const reviews = useMemo(() =>
    data?.user?.reviews?.filter(r =>
      // Titles.
      r.reviewName.toLowerCase().includes(search) ||
      r.creator?.id.toLowerCase().includes(search) ||
      r.entity.name.toLowerCase().includes(search) ||
      // playlist owner.
      (r.entity.__typename === EntityType.Playlist &&
        (r.entity.owner?.id.toLowerCase().includes(search) ||
          r.entity.owner?.spotifyProfile?.displayName?.toLowerCase().includes(search)))
      // review owner.
      || r.creator?.spotifyProfile?.displayName?.toLowerCase().includes(search)
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

  const [numPerRow, setNumPerRow] = useState(6)
  const gridStyle = useMemo(() => `grid gap-4 py-10 px-2 bg-base-300 ${styles.get(numPerRow)}`, [numPerRow])

  if (loading && data == undefined) {
    return <HeroLoading />
  } else {
    return (
      <div className="flex flex-col items-center pt-1">
        <input type="range" min={3} max={8} value={numPerRow} className="range range-primary max-w-xl" step={1}
          onChange={e => { setNumPerRow(parseInt(e.currentTarget.value)) }} />
        <div className={gridStyle}>
          {reviews.map(review => <CreateCard key={review.id} review={review} />)}
        </div>
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
          <div className="stat-title whitespace-normal truncate">{entityName}</div>
          <div className="stat-value w-full text-lg whitespace-normal truncate">{review.reviewName}</div>
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

const styles = new Map([
  [3, 'grid-cols-3'],
  [4, 'grid-cols-4'],
  [5, 'grid-cols-5'],
  [6, 'grid-cols-6'],
  [7, 'grid-cols-7'],
  [8, 'grid-cols-8'],
])