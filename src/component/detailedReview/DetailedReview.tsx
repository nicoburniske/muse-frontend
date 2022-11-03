import { EntityType, ReviewDetailsFragment, useDetailedReviewQuery, useGetPlaylistQuery } from "graphql/generated/schema"
import { RenderOptions } from "component/detailedReview/DetailedPlaylist"
import { useEffect, useState } from "react"
import { useSetAtom, useAtomValue } from "jotai"
import { playbackDevicesAtom, currentlyPlayingTrackAtom, currentUserIdAtom } from "state/Atoms"
import { ShareReview } from "./ShareReview"
import { Alert, AlertSeverity } from "component/Alert"
import { HeroLoading } from "component/HeroLoading"
import { CommentFormModalWrapper } from "./commentForm/CommentFormModalWrapper"
import { EditReview } from "./editReview/EditReview"
import { ArrowRightLeftIcon, CommentIcon, EllipsisIcon, LinkIcon, MusicIcon, SkipBackwardIcon } from "component/Icons"
import { useNavigate } from "react-router-dom"
import useStateWithSyncedDefault from "hook/useStateWithSyncedDefault"
import { PlaybackTimeWrapper } from "./playback/PlaybackTimeWrapper"
import Split from "react-split"
import PlaylistTrackTable from "./PlaylistTrackTable"
import { Virtuoso } from "react-virtuoso"
import { parentReviewIdAtom } from "component/createReview/createReviewAtoms"
import { nonNullable, findFirstImage } from "util/Utils"
import CreateReview from "component/createReview/CreateReview"
import { ThemeSetter } from "component/ThemeSetter"
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

  // Find first image!
  const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
  // Root review doesn't need an entity.
  const reviewEntityImage = findFirstImage(nonNullable(entity) ? [entity, ...childEntities] : childEntities)

  // Children!
  const children = review
    ?.childReviews
    ?.filter(Boolean)
    ?.filter(c => nonNullable(c?.id))
    ?.filter(c => nonNullable(c.entity?.id))
    ?.filter(c => nonNullable(c.entity?.__typename))
    .map(child => ({
      reviewId: child.id,
      entityId: child.entity?.id as string,
      entityType: child.entity?.__typename as EntityType,
      reviewName: child?.reviewName
    })) ?? []
  const parent = nonNullable(review?.entity) ?
    {
      reviewId,
      entityId,
      entityType: review.entity.__typename as EntityType,
      reviewName: review?.reviewName
    }
    : undefined
  const allReviews = [parent, ...children].filter(nonNullable)

  // On unmount reset parent review id.
  // This is for creating child reviews in modal.
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
                <div>
                  <button className="btn btn-secondary btn-xs lg:btn-md" onClick={() => setOpenEditReview(true)}>
                    <EllipsisIcon />
                  </button>
                </div>
                <CreateReview title="create linked review" className="btn btn-primary btn-xs lg:btn-md" />
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
        <div className='flex justify-end px-1'>
          <ThemeSetter />
        </div>

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
          <DetailedReviewBody reviews={allReviews} />

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
  reviews: ReviewOverview[]
  options?: RenderOptions
}

const DetailedReviewBody = ({ reviews, options = RenderOptions.Both }: DetailedReviewBodyProps) => (
  <div className="h-full px-1">
    {(options == RenderOptions.Both) ?
      <Split
        className="flex h-full"
        sizes={[40, 60]}
        direction="horizontal"
      >
        <TrackSectionTable all={reviews} />
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
const TrackSectionTable = ({ all }: { all: ReviewOverview[] }) => {
  // Need state so that children stay open on scroll.
  const [openIndexes, setOpenIndexes] = useState<number[]>(all.length > 0 ? [0] : []);

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
    <div className="w-full h-full overflow-y-auto">
      {all.map((data, index) => (
        <div key={index} className="w-full">
          <TrackSectionCollapsible
            reviewId={data.reviewId}
            reviewName={data.reviewName}
            entityId={data.entityId}
            entityType={data.entityType}
            isOpen={openIndexes.includes(index)}
            onToggle={() => handleAccordionClick(index)} />
        </div>
      ))}
    </div>
    // <Virtuoso
    //   data={all}
    //   itemContent={(index, data) =>
    //     <TrackSectionCollapsible
    //       reviewId={data.reviewId}
    //       reviewName={data.reviewName}
    //       entityId={data.entityId}
    //       entityType={data.entityType}
    //       isOpen={openIndexes.includes(index)}
    //       onToggle={() => handleAccordionClick(index)} />
    //   }
    //   overscan={3000}
    // />
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


function TrackSectionCollapsible({ reviewId, reviewName, entityId, entityType, isOpen, onToggle }: TrackSectionCollapsibleProps) {
  const { data } = useGetPlaylistQuery({ id: entityId })
  const name = reviewName ?? data?.getPlaylist?.name
  const tracks = data?.getPlaylist?.tracks ?? []

  return (
    <div className={`w-full flex flex-col justify-start p-1 h-full`}>
      <div className="text-xl font-medium bg-neutral text-neutral-content"
        onClick={onToggle}
      >
        {name}
      </div>
      {isOpen ?
        <div className="h-max overflow-y-hidden">
          <PlaylistTrackTable
            playlistId={entityId}
            reviewId={reviewId}
            playlistTracks={tracks}
          />
        </div>
        : null
      }

    </div>
  )
}