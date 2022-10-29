import { useNavigate } from "react-router-dom";
import { EntityType, ReviewEntityOverviewFragment, ReviewOverviewFragment, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import toast from 'react-hot-toast';
import { HeroLoading } from "component/HeroLoading";
import { currentUserIdAtom, refreshOverviewAtom, searchLoweredAtom } from "state/Atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import NavbarRhs from "component/NavbarRhs";
import useWindowSize from "hook/useWindowSize";

export default function BrowsePage() {
  const nav = useNavigate()
  const linkToHome = () => nav('/')
  const search = useAtomValue(searchLoweredAtom)
  const { data, loading, refetch } = useProfileAndReviewsQuery({ onError: () => toast.error("Failed to load profile.") })
  const reviews = useMemo(() =>
    data?.user?.reviews?.filter(r =>
      // Titles.
      r.reviewName.toLowerCase().includes(search) ||
      r.creator?.id.toLowerCase().includes(search) ||
      r.entity?.name.toLowerCase().includes(search) ||
      // playlist owner.
      (r.entity?.__typename === EntityType.Playlist &&
        (r.entity?.owner?.id.toLowerCase().includes(search) ||
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

  const {isSm} = useWindowSize()
  useEffect(() => isSm ? setNumPerRow(2) : undefined, [isSm])

  const [numPerRow, setNumPerRow] = useState(isSm? 2 : 5)
  const gridStyle = useMemo(() => `grid gap-4 pt-2 px-2 bg-base-300 ${styles.get(numPerRow)}`, [numPerRow])

  if (loading && data == undefined) {
    return <HeroLoading />
  } else {
    return (
      <div className="flex flex-col w-full h-full items-center">
        <div className="navbar bg-base-100 z-50">
          <div className="navbar-start">
            <button onClick={() => toast.success("yes")}>test</button>
            <button onClick={() => toast.error("no")}>test</button>
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
              </label>
              <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
              </ul>
            </div>
          </div>
          <div className="navbar-center">
            <a className="btn btn-ghost normal-case text-xl text-base-content" onClick={linkToHome}>muse</a>
          </div>
            <NavbarRhs className='navbar-end space-x-5'/>
        </div>
        <div className="min-h-fit w-full flex flex-row justify-center">
          <input type="range" min={1} max={8} value={numPerRow} className="range range-primary max-w-xl " step={1}
            onChange={e => { setNumPerRow(parseInt(e.currentTarget.value)) }} />
        </div>
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
  const linkToReviewPage = () => nav(`/reviews/${review.id}`)
  const creatorName = review?.creator?.spotifyProfile?.displayName ?? "Unknown"
  return (
    <div key={review.id} className="card bg-base-100 shadow-xl">
      <figure><img src={image} /></figure>
      <button onClick={linkToReviewPage} className="card-body p-0 flex justify-center hover:bg-base-200">
        <div className="w-full flex flex-col justify-center items-center hover:whitespace-normal">
          <div className="stat-title text-xs md:text-base w-full truncate">{entityName}</div>
          <div className="stat-value text-xs md:text-base w-full truncate">{review.reviewName}</div>
          <div className="stat-desc text-xs md:text-base w-full truncate"> {creatorName} </div>
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

// Would be great to have macros for tailwind.
const styles = new Map([
  [1, 'grid-cols-1'],
  [2, 'grid-cols-2'],
  [3, 'grid-cols-3'],
  [4, 'grid-cols-4'],
  [5, 'grid-cols-5'],
  [6, 'grid-cols-6'],
  [7, 'grid-cols-7'],
  [8, 'grid-cols-8'],
])