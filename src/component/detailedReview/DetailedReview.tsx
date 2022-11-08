import { DetailedCommentFragment, DetailedTrackFragment, EntityType, GetPlaylistQuery, ReviewDetailsFragment, useDeleteReviewLinkMutation, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useGetPlaylistQuery, useLinkReviewsMutation, useProfileAndReviewsQuery } from "graphql/generated/schema"
import { useEffect, useMemo, useState } from "react"
import { useSetAtom, useAtomValue, atom, PrimitiveAtom } from "jotai"
import { focusAtom } from 'jotai/optics'
import { currentUserIdAtom, selectedTrackAtom } from "state/Atoms"
import { ShareReview } from "./ShareReview"
import { Alert, AlertSeverity } from "component/Alert"
import { HeroLoading } from "component/HeroLoading"
import { CommentFormModalWrapper } from "./commentForm/CommentFormModalWrapper"
import { EditReview } from "./editReview/EditReview"
import { ArrowRightLeftIcon, ArrowTopRightIcon, CommentIcon, EllipsisIcon, HazardIcon, MusicIcon, ReplyIcon, SkipBackwardIcon, TrashIcon } from "component/Icons"
import { useNavigate } from "react-router-dom"
import useStateWithSyncedDefault from "hook/useStateWithSyncedDefault"
import { PlaybackTimeWrapper } from "./playback/PlaybackTimeWrapper"
import Split from "react-split"
import { nonNullable, findFirstImage, groupBy, zip } from "util/Utils"
import CreateReview from "component/createReview/CreateReview"
import { ThemeSetter } from "component/ThemeSetter"
import { useQueries, useQueryClient, UseQueryResult } from "@tanstack/react-query"
import React from "react"
import DetailedComment from "./DetailedComment"
import toast from 'react-hot-toast'
import { GroupedTrackTable } from "./GroupedTrackTable"
import { LinkReviewButton } from "./LinkReview"
import ReviewCommentSection from "./CommentSection"

export interface DetailedReviewProps {
  reviewId: string
  isSm: boolean
}

export enum RenderOptions {
  Tracks,
  Comments,
  Both
}

export function DetailedReview({ reviewId, isSm }: DetailedReviewProps) {

  // Queries.
  // const comments = useLatestReviewComments(reviewId)
  // This only needs to happen so that playlist tracks are refreshed.
  const { data, isLoading, error, refetch } = useDetailedReviewQuery({ reviewId })

  const setSelectedTrack = useSetAtom(selectedTrackAtom)

  // On unmount reset selected track. Avoids scroll to track on review mount.
  useEffect(
    () => () => setSelectedTrack(undefined)
  , [])

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
  const parentReviewIdAtom = atom<string | undefined>(undefined)
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
    ?.filter(nonNullable)
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
    return () => {
      setParentReviewId(undefined)
    }
  })

  const tabStyle = 'tab tab-xs md:tab-md lg:tab-lg tab-boxed'

  return (
    < div className="w-full h-screen flex flex-col relative">
      <div className="grid grid-cols-5 lg:grid-cols-4 items-center bg-base-100">
        <div className="col-span-3 lg:col-span-2 flex flex-row justify-start items-center p-1 space-x-1">
          <button className='btn btn-info btn-circle sm:w-6 sm:h-6 md:w-10 md:h-10 lg:w-16 lg:h-16' onClick={() => nav(-1)}>
            <SkipBackwardIcon />
          </button>
          <div className="card flex flex-row items-center bg-base-200 px-1 md:mx-1 md:space-x-2">
            <img className="object-scale-down object-center h-24 w-24" src={reviewEntityImage} />
            <div className="flex flex-col">
              <div className="stat-value text-sm lg:text-base text-clip">{title}</div>
              <div className="stat-title text-sm lg:text-base text-clip">{entityName}</div>
              <div className="flex flex-row justify-start w-full">
                <div className="badge badge-secondary truncate overflow-hidden whitespace-nowrap">{creator}</div>
              </div>
            </div>
          </div>
          {
            isReviewOwner ?
              <div className="grid grid-cols-2 lg:grid-cols-4">
                <ShareReview reviewId={reviewId} collaborators={collaborators} onChange={() => reload()} />
                <div>
                  <button className="btn btn-primary btn-xs lg:btn-md" onClick={() => setOpenEditReview(true)}>
                    <EllipsisIcon />
                  </button>
                </div>
                <LinkReviewButton reviewId={reviewId} alreadyLinkedIds={children.map(c => c.reviewId)} />
                <CreateReview
                  parentReviewIdAtom={parentReviewIdAtom}
                  title="create linked review"
                  className="btn btn-secondary btn-xs lg:btn-md" />
              </div>
              : null
          }
        </div>
        <div className="col-span-2 lg:col-span-1 tabs flex flex-row justify-center">
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
        <div className='hidden lg:flex justify-end px-1'>
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
      <div className="grow min-h-0 w-full bg-base-300">
        <DetailedReviewBody rootReview={reviewId} reviews={allReviews} options={renderOption} />
      </div>
      <div className='w-full'>
        <PlaybackTimeWrapper
          reviewId={reviewId}
          disabled={false}
        />
      </div>
    </div >
  )
}

interface DetailedReviewBodyProps {
  rootReview: string
  reviews: ReviewOverview[]
  options?: RenderOptions
}

const DetailedReviewBody = ({ rootReview, reviews, options = RenderOptions.Both }: DetailedReviewBodyProps) => {
  const trackSection = useMemo(() => (<TrackSectionTable rootReview={rootReview} all={reviews} />), [reviews])
  const commentSection = useMemo(() => (<ReviewCommentSection reviews={reviews} />), [reviews])
  return (
    <div className="h-full px-1">
      {(options == RenderOptions.Both) ?
        <Split
          className="flex h-full"
          sizes={[40, 60]}
          direction="horizontal"
        >
          <TrackSectionTable rootReview={rootReview} all={reviews} />
          {commentSection}
        </Split>
        :
        <div className="flex h-full w-full">
          {(options == RenderOptions.Tracks)
            ?
            trackSection :
            commentSection}
        </div>
      }
    </div>
  )
}

export interface ReviewOverview {
  reviewName: string
  reviewId: string
  entityId: string
  entityType: EntityType
}

const TrackSectionTable = ({ all, rootReview }: { all: ReviewOverview[], rootReview: string }) => {
  const entityIds = all.map(r => r.entityId)
  const results = useQueries({
    queries: entityIds.map(id => ({
      queryKey: useGetPlaylistQuery.getKey({ id }),
      queryFn: useGetPlaylistQuery.fetcher({ id })
    }))
  })

  // Ensure that indicies line up.
  const validZipped: [UseQueryResult<GetPlaylistQuery, unknown>, ReviewOverview][] = useMemo(() =>
    zip(results, all)
      // Success from API.
      .filter(([res, _rev]) => res.isSuccess)
      // Non Null Entity.
      .filter(([res, _rev]) => nonNullable(res.data?.getPlaylist)),
    [results])

  return (
    <GroupedTrackTable results={validZipped} rootReview={rootReview} />
  )
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