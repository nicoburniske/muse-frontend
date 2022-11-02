import { DetailedCommentFragment, EntityType, ReviewDetailsFragment, ReviewEntityOverviewFragment, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useGetPlaylistQuery, useSeekPlaybackMutation } from "graphql/generated/schema"
import DetailedPlaylist, { RenderOptions } from "component/detailedReview/DetailedPlaylist"
import { useEffect, useMemo, useState } from "react"
import { useSetAtom, useAtomValue } from "jotai"
import { playbackDevicesAtom, currentlyPlayingTrackAtom, currentUserIdAtom } from "state/Atoms"
import { ShareReview } from "./ShareReview"
import { Alert, AlertSeverity } from "component/Alert"
import { HeroLoading } from "component/HeroLoading"
import { CommentFormModalWrapper } from "./commentForm/CommentFormModalWrapper"
import { EditReview } from "./editReview/EditReview"
import { ArrowRightLeftIcon, CommentIcon, EllipsisIcon, MusicIcon, SkipBackwardIcon } from "component/Icons"
import NavbarRhs from "component/NavbarRhs"
import { useNavigate } from "react-router-dom"
import useStateWithSyncedDefault from "hook/useStateWithSyncedDefault"
import { PlaybackTimeWrapper } from "./playback/PlaybackTimeWrapper"
import Split from "react-split"
import PlaylistTrackTable from "./PlaylistTrackTable"
import { useBoolToggle } from "hook/useToggle"
import { Virtuoso } from "react-virtuoso"
import { parentReviewIdAtom } from "component/createReview/createReviewAtoms"
import { nonNullable, findFirstImage } from "util/Utils"
export interface DetailedReviewProps {
  reviewId: string
  isSm: boolean
}

// const useLatestReviewComments = (reviewId: string) => {
//   const [comments, setComments] = useState<DetailedCommentFragment[]>([])

//   useDetailedReviewCommentsQuery({
//     variables: { reviewId },
//     nextFetchPolicy: "cache-first",
//     pollInterval: 0,
//     onCompleted: (data) => data.review?.comments && setComments(data.review.comments)
//   })

//   useReviewUpdatesSubscription({
//     variables: { reviewId }, onSubscriptionData: (data) => {
//       const commentEvent = data.subscriptionData.data?.reviewUpdates
//       if (commentEvent?.__typename) {
//         switch (commentEvent.__typename) {
//           case "CreatedComment":
//             setComments([...comments, commentEvent.comment])
//             break;
//           case "UpdatedComment":
//             const updatedCommentId = commentEvent.comment.id
//             const filtered = comments.filter(comment => comment.id !== updatedCommentId)
//             filtered.push(commentEvent.comment)
//             setComments(filtered)
//             break;
//           case "DeletedComment":
//             const deletedCommentId = commentEvent.commentId
//             const removeDeleted = comments.filter(comment => comment.id !== deletedCommentId)
//             setComments(removeDeleted)
//             break;
//           default:
//             console.error("Unhandled review update event", commentEvent)
//         }
//       }
//     }
//   })
//   return comments
// }

export function DetailedReview({ reviewId, isSm }: DetailedReviewProps) {
  // Subscriptions.
  // Update jotai atom with playback devices.
  // const setDevices = useSetAtom(playbackDevicesAtom)
  // useAvailableDevicesSubscription({
  //   onSubscriptionData: (data) => {
  //     if (data.subscriptionData.data?.availableDevices) {
  //       setDevices(data.subscriptionData.data.availableDevices)
  //     } else {
  //       setDevices([])
  //     }
  //   }
  // })

  // Queries.
  // const comments = useLatestReviewComments(reviewId)
  // This only needs to happen so that playlist tracks are refreshed.
  const { data, isLoading, error, refetch } = useDetailedReviewQuery({ reviewId })

  if (isLoading && data == undefined) {
    return <HeroLoading />
  } else if (data?.review) {
    return (
      <DetailedReviewContent
        renderOption={isSm ? RenderOptions.Tracks : RenderOptions.Both}
        reviewId={reviewId}
        review={data.review}
        reload={() => refetch()} />
    )

  } else if (error) {
    return (
      <Alert severity={AlertSeverity.Error}>
        <span> Error Loading Review </span>
      </Alert >)
  }
}

interface DetailedReviewContentProps {
  renderOption: RenderOptions
  reviewId: string
  review: ReviewDetailsFragment
  reload: () => void
}

const DetailedReviewContent = ({ renderOption: renderOptionProp, reviewId, review, reload }: DetailedReviewContentProps) => {
  const [renderOption, setRenderOption,] = useStateWithSyncedDefault(renderOptionProp)
  const [openEditReview, setOpenEditReview] = useState(false)
  const nav = useNavigate()
  const userId = useAtomValue(currentUserIdAtom)
  const setParentReviewId = useSetAtom(parentReviewIdAtom)

  const isReviewOwner = userId === review?.creator?.id
  const collaborators = review?.collaborators ?? []
  const isPublic = review?.isPublic
  const title = review?.reviewName
  const entityName = review?.entity?.name
  const entityId = review?.entity?.id ?? ""
  const creator = review?.creator?.spotifyProfile?.displayName ?? review?.creator?.id
  const entity = review?.entity
  const children = review
    ?.childReviews
    ?.filter(Boolean)
    ?.filter(c => c?.id)
    ?.filter(c => c.entity?.id)
    ?.filter(c => c.entity?.__typename)
    .map(child => ({ reviewId: child.id, entityId: child.entity?.id, entityType: child.entity?.__typename, reviewName: child?.reviewName })) ?? []
  const parent = { reviewId, entityId, entityType: review?.entity?.__typename, reviewName: review?.reviewName }

  const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? [] 
  const reviewEntityImage = findFirstImage(nonNullable(entity) ? [entity,  ...childEntities] : childEntities)

  // On unmount reset parent review id.
  useEffect(() => {
    setParentReviewId(reviewId)
    return () => setParentReviewId(undefined)
  })

  const tabStyle = 'tab tab-xs md:tab-md lg:tab-lg tab-boxed'

  return (
    < div className="w-full h-full flex flex-col relative">
      <div className="grid grid-cols-3 items-center bg-base-100 z-50 h-[10%]">
        <div className="flex flex-row items-center px-1 space-x-1">
          <button className='btn btn-info btn-circle sm:w-6 sm:h-6 md:w-10 md:h-10 lg:w-16 lg:h-16' onClick={() => nav('/')}>
            <SkipBackwardIcon />
          </button>
          <div className="card flex flex-row items-center bg-base-200 px-1 md:mx-1 md:space-x-2">
            <div className="h-10 hidden md:avatar md:h-20" >
              <div className="rounded">
                <img loading='lazy' src={reviewEntityImage} />
              </div>
            </div>
            <div className="stat">
              <div className="stat-value text-sm lg:text-base text-clip">{title}</div>
              <div className="stat-title text-sm lg:text-base text-clip">{entityName}</div>
              <div className="flex flex-row justify-around">
                <div className="badge badge-primary text-clip overflow-hidden">playlist</div>
                <div className="badge badge-secondary text-clip overflow-hidden">{creator}</div>
              </div>
            </div>
          </div>
          {
            isReviewOwner ?
              <div className="btn-group btn-group-vertical lg:btn-group-horizontal">
                <ShareReview reviewId={reviewId} collaborators={collaborators} onChange={() => reload()} />
                <button className="btn btn-secondary btn-xs lg:btn-md" onClick={() => setOpenEditReview(true)}>
                  <EllipsisIcon />
                </button>
              </div>
              : null
          }
        </div>
        <div className="tabs flex flex-row justify-center">
          <button className={`${tabStyle} ${renderOption === RenderOptions.Tracks ? 'tab-active' : ''}`}
            onClick={() => setRenderOption(RenderOptions.Tracks)}
          >
            <MusicIcon />
          </button>
          <button className={`${tabStyle} ${renderOption === RenderOptions.Both ? 'tab-active' : ''}`}
            onClick={() => setRenderOption(RenderOptions.Both)}
          >
            <ArrowRightLeftIcon />
          </button>
          <button
            className={`${tabStyle} ${renderOption === RenderOptions.Comments ? 'tab-active' : ''}`}
            onClick={() => setRenderOption(RenderOptions.Comments)}
          >
            <CommentIcon />
          </button>
        </div>
        <NavbarRhs className='justify-end space-x-1' />

        {/* <div className="flex flex-row items-center h-full">
          <div className="stats shadow">
            <div className="stat h-full">
            </div>
          </div>
          {collaboratorImages}
        </div> */}
      </div>
      <EditReview reviewId={reviewId} reviewName={title!} isPublic={isPublic === undefined ? false : isPublic}
        onSuccess={() => { setOpenEditReview(false); reload(); }}
        isOpen={openEditReview}
        onCancel={() => setOpenEditReview(false)} />
      <CommentFormModalWrapper />
      <div className="w-full h-[80%] bg-base-300">
        {/* {entity?.__typename === 'Playlist' ?
          <DetailedPlaylist
            reviewId={review?.id as string}
            playlist={entity}
            comments={comments}
            options={renderOption}
          /> : */
          <DetailedReviewBody parent={parent} children={children} />

          // <Alert severity={AlertSeverity.Warning}>
          //   <span> Not Implemented Yet. </span>
          // </Alert >
        }
      </div>
      <div className='w-full h-[10%]'>
        <PlaybackTimeWrapper
          reviewId={reviewId}
          disabled={false}
        />
      </div>
    </div >
  )
}

interface DetailedReviewBodyProps {
  parent: ReviewOverview
  children: ReviewOverview[]
  options?: RenderOptions
}

const DetailedReviewBody = ({ parent, children, options = RenderOptions.Both }: DetailedReviewBodyProps) => (
  <div className="h-full px-1">
    {(options == RenderOptions.Both) ?
      <Split
        className="flex h-full"
        sizes={[40, 60]}
        direction="horizontal"
      >
        <TrackSectionTable parent={parent} children={children} />
        <ReviewCommentSection />
      </Split>
      : null
      // <div className="flex h-full">
      //   {(options == RenderOptions.Tracks) ?
      //     displayTracks : displayComments}
      // </div>
    }
  </div>
)

interface ReviewOverview {
  reviewName: string
  reviewId: string
  entityId: string
  entityType: EntityType
}

// consider flattening? 
const TrackSectionTable = ({ parent, children }: { parent: ReviewOverview, children: ReviewOverview[] }) => {
  const all = [parent, ...children]
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const handleAccordionClick = (index: number) => {
    const exists = openIndexes.includes(index);
    if (exists) {
      setOpenIndexes(
        openIndexes.filter((c) => {
          return c !== index;
        })
      );
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

  return (
    <Virtuoso
      className="w-full h-full overflow-y-auto"
      data={all}
      itemContent={(index, data) =>
        <TrackSectionCollapsible
          reviewId={data.reviewId}
          reviewName={data.reviewName}
          entityId={data.entityId}
          entityType={data.entityType}
          isOpen={openIndexes.includes(index)}
          // onToggle={() => handleAccordionClick(index)} />
          onToggle={() => () => {}} />
      }
      overscan={1000}
    />
  )
}

function ReviewCommentSection() {
  return (
    <div>
      yeet
    </div>
  )
}

interface TrackSectionCollapsibleProps {
  isOpen: boolean
  onToggle: () => void
  reviewName: string
  reviewId: string
  entityId: string
  entityType: EntityType
}


function TrackSectionCollapsible({ reviewId, reviewName, entityId, entityType  }: TrackSectionCollapsibleProps) {
  const { data } = useGetPlaylistQuery({ id: entityId })
  const [isOpen, setOpen, onToggle] = useBoolToggle(false)
  const name = reviewName ?? data?.getPlaylist?.name
  const tracks = data?.getPlaylist?.tracks ?? []

  const openClass = isOpen ? 'collapse-open' : 'collapse-close h-fit'

  return (
    <div className={`w-full collapse collapse-plus border border-base-300 bg-base-100 rounded-box flex flex-col justify-start ${openClass}`}
    >
      <div className="collapse-title text-xl font-medium bg-neutral h-fit w-full"
        onClick={onToggle}
      >
        {name}
      </div>
      <div className="collapse-content w-full h-screen m-0 p-0">
        <PlaylistTrackTable
          playlistId={entityId}
          reviewId={reviewId}
          playlistTracks={tracks}
        />
      </div>

    </div>
  )
}