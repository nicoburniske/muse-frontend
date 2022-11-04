import { DetailedCommentFragment, DetailedPlaylistTrackFragment, DetailedPlaylistTrackFragmentDoc, EntityType, GetPlaylistDocument, GetPlaylistQuery, GetPlaylistQueryVariables, ReviewDetailsFragment, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useGetPlaylistQuery } from "graphql/generated/schema"
import { RenderOptions } from "component/detailedReview/DetailedPlaylist"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSetAtom, useAtomValue, useAtom } from "jotai"
import { playbackDevicesAtom, currentlyPlayingTrackAtom, currentUserIdAtom, selectedTrackAtom } from "state/Atoms"
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
import { Components, GroupedVirtuoso, Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { parentReviewIdAtom } from "component/createReview/createReviewAtoms"
import { nonNullable, findFirstImage, groupBy } from "util/Utils"
import CreateReview from "component/createReview/CreateReview"
import { ThemeSetter } from "component/ThemeSetter"
import { useQueries } from "@tanstack/react-query"
import PlaylistTrack, { PlaylistTrackProps } from "./PlaylistTrack"
import React from "react"
import DetailedComment from "./DetailedComment"

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
        <DetailedReviewBody reviews={allReviews} options={renderOption} />
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

const DetailedReviewBody = ({ reviews, options = RenderOptions.Both }: DetailedReviewBodyProps) => {
  const trackSection = useMemo(() => (<TrackSectionTable all={reviews} />), [reviews])
  const commentSection = useMemo(() => (<ReviewCommentSection reviewIds={reviews.map(r => r.reviewId)} />), [reviews])
  return (
    <div className="h-full px-1">
      {(options == RenderOptions.Both) ?
        <Split
          className="flex h-full"
          sizes={[40, 60]}
          direction="horizontal"
        >
          {trackSection}
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

interface ReviewOverview {
  reviewName: string
  reviewId: string
  entityId: string
  entityType: EntityType
}

function zip<A, B>(i: A[], j: B[]): [A, B][] {
  return i.map((a, index) => [a, j[index]])
}

// Need to filter out errors.
const TrackSectionTable = ({ all }: { all: ReviewOverview[] }) => {
  const entityIds = all.map(r => r.entityId)
  const results = useQueries({
    queries: entityIds.map(id => ({
      queryKey: ['entity', id],
      queryFn: useGetPlaylistQuery.fetcher({ id }),
    }))
  })

  // Ensure that indicies line up.
  const validZipped = useMemo(() =>
    zip(results, all)
      // Success from API.
      .filter(([res, _rev]) => res.isSuccess)
      // Non Null Entity.
      .filter(([res, _rev]) => nonNullable(res.data?.getPlaylist)),
    [results])
  const validReviews = validZipped.map(([_, rev]) => rev)
  const validResults = validZipped.map(([res, _rev]) => res)

  const loadingNoData = results.some(r => r.isLoading) && results.every(r => r.data === undefined)

  const virtuoso = useRef<VirtuosoHandle>(null);
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  useEffect(() => {
    if (!loadingNoData) {
      // Open all indicies after initial load.
      setOpenIndexes([...Array(validZipped.length).keys()])
    }
  }, [loadingNoData])

  // Group info.
  const entityTypes = validReviews.map(r => r.entityType)
  const groupHeader = validResults.map(r => r.data!.getPlaylist!.name)

  // Content info.
  const groupCounts = loadingNoData ? [] : validResults.flatMap((r, index) => openIndexes.includes(index)
    ? r.data!.getPlaylist?.tracks?.length ?? [] : [0])
  const tracks: DetailedPlaylistTrackFragment[] = validResults.filter((_r, index) => openIndexes.includes(index)).flatMap(r => r.data!.getPlaylist?.tracks ?? []) ?? []

  const indexToPlaylistId = validResults.flatMap((review) => {
    const playlist = review.data?.getPlaylist
    const playlistId = playlist?.id
    return playlist?.tracks?.map(_t => playlistId) ?? []
  })

  const indexToReviewId = validResults.flatMap((review, index) => {
    const reviewId = validReviews[index].reviewId
    return review.data?.getPlaylist?.tracks?.map(_t => reviewId) ?? []
  })

  const handleAccordionClick = (index: number) => {
    if (validResults.length == 1) {
      return;
    }
    const exists = openIndexes.includes(index);
    if (exists) {
      setOpenIndexes(
        openIndexes.filter((c) => {
          return c !== index;
        })
      );
    } else {
      setOpenIndexes([...openIndexes, index]);
      const scrollIndex = groupCounts.slice(0, index).reduce((a, b) => a + b, 0);
      if (scrollIndex !== undefined && scrollIndex !== 0) {
        // Need timeout to wait for render of list elements.
        setTimeout(() =>
          virtuoso.current?.scrollToIndex({ index: scrollIndex, behavior: 'smooth', align: 'start' })
          , 100)
      }
    }
  };

  const selectedTrack = useAtomValue(selectedTrackAtom)
  useEffect(() => {
    if (selectedTrack !== undefined && !loadingNoData && tracks.length > 0) {
      // @ts-ignore
      const [track, index] = tracks.map((t, index) => [t, index]).find((trackAndIndex) => {
        // @ts-ignore
        const [track, index]: [DetailedPlaylistTrackFragment, number] = trackAndIndex
        return track.track.id === selectedTrack.trackId && indexToReviewId[index] === selectedTrack.reviewId
      });
      if (index !== undefined) {
        // TODO: need to expand section containing track.
        virtuoso.current?.scrollToIndex({ index, behavior: 'smooth', align: 'center' })
      }
    }
  }, [selectedTrack])

  // Do loading state. !
  return (
    <GroupedVirtuoso
      className="w-full"
      ref={virtuoso}
      groupCounts={groupCounts}
      groupContent={(index) => (
        <div className="card py-0 w-full bg-primary shadow-xl"
          onClick={() => handleAccordionClick(index)}>
          <div className="card-body p-1 flex flex-row justify-around items-center">
            <h2 className="card-title text-primary-content">{groupHeader[index]}</h2>
            <div className="badge badge-secondary">{entityTypes[index]}</div>
          </div>
        </div>
      )}
      components={{
        // Scroller,
        ScrollSeekPlaceholder,
        EmptyPlaceholder: () => (<HeroLoading />)
      }}
      scrollSeekConfiguration={{
        enter: (velocity) => Math.abs(velocity) > 1500,
        exit: (velocity) => Math.abs(velocity) < 100,
      }}
      itemContent={(index) => {
        const track = tracks[index]
        return track === undefined ?
          null :
          trackContent(indexToPlaylistId[index]!, indexToReviewId[index]!, track)
      }}
      overscan={800}
    />)
}

const trackContent = (playlistId: string, reviewId: string, playlistTrack: DetailedPlaylistTrackFragment) =>
  <MemoizedTrack playlistId={playlistId} reviewId={reviewId} playlistTrack={playlistTrack} />

const MemoizedTrack = React.memo(({ playlistId, reviewId, playlistTrack }: PlaylistTrackProps) => {
  return (
    <div className="py-0.5 m-0">
      <PlaylistTrack
        playlistId={playlistId}
        reviewId={reviewId}
        playlistTrack={playlistTrack} />
    </div>
  )
})

const ScrollSeekPlaceholder = ({ height }: { height: number }) => (
  <div className="py-0.5">
    <div
      // className="card card-body bg-neutral/30 hover:bg-neutral-focus"
      className="card card-body bg-neutral/30"
      style={{
        height
      }}
    />
  </div>
)

function ReviewCommentSection({ reviewIds }: { reviewIds: string[] }) {
  const results = useQueries({
    queries: reviewIds.map(reviewId => ({
      queryKey: ['ReviewComments', reviewId],
      queryFn: useDetailedReviewCommentsQuery.fetcher({ reviewId }),
    }))
  })

  const validComments = results
    .map(r => r.data?.review?.comments)
    .filter(nonNullable)
    .flatMap(c => c)

  const comments = useMemo(() => {
    return [...validComments]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [validComments])

  const rootComments = useMemo(() => comments.filter(comment => comment.parentCommentId === null), [comments])
  const childComments = useMemo(() => {
    const childComments = comments
      .filter(comment => comment.parentCommentId !== null)
      .filter(comment => comment.parentCommentId !== undefined)
    return groupBy(childComments, c => c.parentCommentId)
  }, [comments])

  const setSelectedTrack = useSetAtom(selectedTrackAtom)

  // We want to find the track that the comment is applied to and scroll to it.
  const onCommentClick = (commentId: number, reviewId: string) => {
    const trackId = comments.find(c => c.id == commentId)?.entities?.at(0)?.id
    if (trackId) {
      setSelectedTrack(undefined)
      setTimeout(() => setSelectedTrack({ trackId, reviewId }), 1);
    }
  }

  return (
    <div className="flex flex-col space-y-0.5 lg:space-y-1 h-full w-full overflow-auto">
      {rootComments.map((c: DetailedCommentFragment, index: number) =>
        <div key={c.id}>
          <DetailedComment
            reviewId={c.reviewId}
            playlistId={""}
            comment={c}
            children={childComments.get(c.id) ?? []}
            onClick={() => onCommentClick(c.id, c.reviewId)}
          />
        </div>
      )}
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