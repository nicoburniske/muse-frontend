import { DetailedCommentFragment, DetailedPlaylistTrackFragment, DetailedTrackFragment, EntityType, GetPlaylistQuery, ReviewDetailsFragment, useDeleteReviewLinkMutation, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useGetPlaylistQuery, useLinkReviewsMutation, useProfileAndReviewsQuery } from "graphql/generated/schema"
import { SetStateAction, useEffect, useMemo, useRef, useState } from "react"
import { useSetAtom, useAtomValue, useAtom, atom, PrimitiveAtom, WritableAtom } from "jotai"
import { selectAtom, splitAtom } from "jotai/utils";
import { focusAtom } from 'jotai/optics'
import { currentUserIdAtom, selectedTrackAtom } from "state/Atoms"
import { ShareReview } from "./ShareReview"
import { Alert, AlertSeverity } from "component/Alert"
import { HeroLoading } from "component/HeroLoading"
import { CommentFormModalWrapper } from "./commentForm/CommentFormModalWrapper"
import { EditReview } from "./editReview/EditReview"
import { ArrowRightLeftIcon, ArrowTopRightIcon, CheckIcon, CommentIcon, CrossIcon, EllipsisIcon, HazardIcon, LinkIcon, MusicIcon, ReplyIcon, SkipBackwardIcon, TrashIcon } from "component/Icons"
import { useNavigate } from "react-router-dom"
import useStateWithSyncedDefault from "hook/useStateWithSyncedDefault"
import { PlaybackTimeWrapper } from "./playback/PlaybackTimeWrapper"
import Split from "react-split"
import { GroupedVirtuoso, Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { nonNullable, findFirstImage, groupBy, getReviewOverviewImage, uniqueByProperty } from "util/Utils"
import CreateReview from "component/createReview/CreateReview"
import { ThemeSetter } from "component/ThemeSetter"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import PlaylistTrack, { PlaylistTrackProps } from "./PlaylistTrack"
import React from "react"
import DetailedComment from "./DetailedComment"
import toast from 'react-hot-toast'
import { Dialog } from "@headlessui/react"
import { ThemeModal } from "component/ThemeModal"

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
export enum RenderOptions {
  Tracks,
  Comments,
  Both
}

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
    return () => setParentReviewId(undefined)
  })

  const tabStyle = 'tab tab-xs md:tab-md lg:tab-lg tab-boxed'

  return (
    < div className="w-full h-full flex flex-col relative">
      <div className="grid grid-cols-4 items-center bg-base-100 z-50 h-[10%]">
        <div className="col-span-2 flex flex-row items-center px-1 space-x-1">
          <button className='btn btn-info btn-circle sm:w-6 sm:h-6 md:w-10 md:h-10 lg:w-16 lg:h-16' onClick={() => nav(-1)}>
            <SkipBackwardIcon />
          </button>
          <div className="card flex flex-row items-center bg-base-200 px-1 md:mx-1 md:space-x-2">
            <div className="h-10 hidden md:avatar md:h-20" >
              <div className="rounded">
                <img loading='lazy' src={reviewEntityImage} />
              </div>
            </div>
            <div className="stat ">
              <div className="stat-value text-sm lg:text-base text-clip">{title}</div>
              <div className="stat-title text-sm lg:text-base text-clip">{entityName}</div>
              <div className="flex flex-row justify-around w-full">
                <div className="badge badge-primary overflow-hidden whitespace-nowrap">playlist</div>
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
      <div className="w-full h-[80%] bg-base-300">
        <DetailedReviewBody rootReview={reviewId} reviews={allReviews} options={renderOption} />
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
  rootReview: string
  reviews: ReviewOverview[]
  options?: RenderOptions
}

const DetailedReviewBody = ({ rootReview, reviews, options = RenderOptions.Both }: DetailedReviewBodyProps) => {
  const trackSection = useMemo(() => (<TrackSectionTable rootReview={rootReview} all={reviews} />), [reviews])
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

function useTrackAtIndexAtom(tracksAtom: PrimitiveAtom<DetailedTrackFragment[]>, trackId: string) {
  return useMemo(() => {
    return focusAtom(tracksAtom, (optic) => optic.find(t => t.id === trackId))
  }, [tracksAtom, trackId])
}

// Need to filter out errors.
const TrackSectionTable = ({ all, rootReview }: { all: ReviewOverview[], rootReview: string }) => {
  const entityIds = all.map(r => r.entityId)
  const results = useQueries({
    queries: entityIds.map(id => ({
      queryKey: useGetPlaylistQuery.getKey({ id }),
      queryFn: useGetPlaylistQuery.fetcher({ id })
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
  const validCount = validZipped.length
  const validReviews = validZipped.map(([_, rev]) => rev)
  const validResults = validZipped.map(([res, _rev]) => res)

  const loadingNoData = results.some(r => r.isLoading) && results.every(r => r.data === undefined)

  const virtuoso = useRef<VirtuosoHandle>(null);
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  // After initial load
  useEffect(() => {
    if (!loadingNoData) {
      // Open all indicies after initial load.
      setOpenIndexes([...Array(validZipped.length).keys()])
    }
  }, [loadingNoData])

  // Ensures that on single review page, the review is always open. 
  useEffect(() => {
    if (validCount === 1) {
      setOpenIndexes([0])
    }
  }, [validCount])

  // Group info.
  const entityTypes = validReviews.map(r => r.entityType)
  const reviewIds = validReviews.map(r => r.reviewId)
  const groupHeader = validResults.map(r => r.data!.getPlaylist!.name)

  // Content info.
  const groupCounts = loadingNoData ? [] : validResults.flatMap((r, index) => openIndexes.includes(index)
    ? r.data!.getPlaylist?.tracks?.length ?? [] : [0])
  const tracks: DetailedPlaylistTrackFragment[] = validResults
    .filter((_r, index) => openIndexes.includes(index))
    .flatMap(r => r.data!.getPlaylist?.tracks ?? []) ?? []

  // Want one atom PER TRACK.
  const tracksAtom = atom(uniqueByProperty(tracks.map(t => t.track), t => t.id))

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
      const maybeTrack = tracks.map((track, index) => ({ track, index })).find(({ track, index }) => {
        return track.track.id === selectedTrack.trackId && indexToReviewId[index] === selectedTrack.reviewId
      });
      if (maybeTrack !== undefined) {
        // TODO: need to expand section containing track.
        virtuoso.current?.scrollToIndex({ index: maybeTrack.index, behavior: 'smooth', align: 'center' })
      }
    }
  }, [selectedTrack])


  // Do empty state!
  return (
    <GroupedVirtuoso
      className="w-full"
      ref={virtuoso}
      groupCounts={groupCounts}
      groupContent={(index) => (
        <ReviewGroupHeader
          reviewId={reviewIds[index]}
          parentReviewId={rootReview}
          name={groupHeader[index]}
          entityType={entityTypes[index]}
          onClick={() => handleAccordionClick(index)} />
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
        const playlistTrack = tracks[index]
        if (playlistTrack === undefined) {
          return null
        }
        return trackContent(indexToPlaylistId[index]!, indexToReviewId[index]!, playlistTrack, tracksAtom)
      }}
      overscan={500}
    />)
}

interface ReviewGroupHeaderProps {
  reviewId: string,
  parentReviewId: string,
  name: string,
  entityType: EntityType
  onClick: () => void
}


const ReviewGroupHeader = ({ reviewId, parentReviewId, name, entityType, onClick }: ReviewGroupHeaderProps) => {
  const isChild = reviewId !== parentReviewId
  const [isDeleting, setIsDeletingRaw] = useState(false)
  const nav = useNavigate()
  const queryClient = useQueryClient()
  const linkToReviewPage = () => nav(`/reviews/${reviewId}`)
  const { mutateAsync: deleteReviewLink } = useDeleteReviewLinkMutation({
    onError: () => toast.error('Failed to delete review link'),
  })

  const handleDeleteReviewLink = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    await deleteReviewLink({ input: { childReviewId: reviewId, parentReviewId } })
    e.stopPropagation()
    queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId: parentReviewId }))
  }

  const setIsDeleting = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => (isDeleting: boolean) => {
    setIsDeletingRaw(isDeleting)
    e.stopPropagation()
  }

  const gridStyle = isChild ? 'grid-cols-4' : 'grid-cols-2'

  return (
    <div className="card py-0 w-full bg-secondary shadow-xl"
      onClick={onClick}>
      <div className={`grid ${gridStyle} card-body p-1 justify-around w-full items-center`}>
        <h2 className="card-title text-secondary-content w-full">{name}</h2>
        <div className="m-auto">
          <div className="badge badge-primary text-primary-content text-center">{entityType}</div>
        </div>
        {isChild ?
          <>
            <button className="btn btn-sm btn-ghost" onClick={() => linkToReviewPage()} >
              <ArrowTopRightIcon />
            </button>
            {isDeleting ?
              <div className="btn-group justify-center" >
                <button className="btn btn-sm btn-error tooltip tooltip-error tooltip-left" data-tip="remove review link" onClick={e => handleDeleteReviewLink(e)}>
                  <HazardIcon />
                </button>
                <button className="btn btn-sm btn-info" onClick={(e) => setIsDeleting(e)(false)}>
                  <ReplyIcon />
                </button>
              </div>
              :
              <button className="btn btn-sm btn-ghost" onClick={(e) => setIsDeleting(e)(true)}>
                <TrashIcon />
              </button>
            }
          </>
          : null
        }
      </div>
    </div>)
}

const trackContent = (playlistId: string, reviewId: string, playlistTrack: DetailedPlaylistTrackFragment, atom: PrimitiveAtom<DetailedTrackFragment[]>) =>
  <MemoizedTrack playlistId={playlistId} reviewId={reviewId} playlistTrack={playlistTrack} atom={atom} />

export interface MemoPlaylistTrackProps {
  playlistTrack: DetailedPlaylistTrackFragment
  reviewId: string
  playlistId: string
  atom: PrimitiveAtom<DetailedTrackFragment[]>
}

const MemoizedTrack = React.memo(({ playlistId, reviewId, playlistTrack, atom }: MemoPlaylistTrackProps) => {
  const trackAtom = useTrackAtIndexAtom(atom, playlistTrack.track.id)
  return (
    <div className="py-0.5 m-0">
      <PlaylistTrack
        playlistId={playlistId}
        reviewId={reviewId}
        playlistTrack={playlistTrack}
        atom={trackAtom}
      />
    </div>
  )
}, (a, b) =>
  a.playlistId === b.playlistId &&
  a.reviewId === b.reviewId &&
  a.playlistTrack.track.id === b.playlistTrack.track.id)

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
      queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }),
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

const searchTextResult = "select-none truncate text-sm lg:text-base p-0.5"

const LinkReviewButton = ({ reviewId, alreadyLinkedIds }: { reviewId: string, alreadyLinkedIds: string[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data, isLoading } = useProfileAndReviewsQuery({}, { onError: () => toast.error("Failed to load user reviews.") })
  const { mutateAsync: createReviewLink } = useLinkReviewsMutation({ onError: () => toast.error("Failed to link review.") })
  // We don't want to include any unlinkable reviews.
  const reviews = (data?.user?.reviews ?? [])
    .filter(r => !alreadyLinkedIds.includes(r.id))
    .filter(r => r.id !== reviewId)
  const [selectedReview, setSelectedReview] = useState<undefined | string>(undefined)

  const handleLinkReview = async () => {
    if (selectedReview) {
      await createReviewLink({ input: { parentReviewId: reviewId, childReviewId: selectedReview } })
      queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId }))
      onCancel()
    }
  }

  const canSubmit = selectedReview !== undefined

  const onCancel = () => {
    setIsModalOpen(false)
    setSelectedReview(undefined)
  }

  return (
    <div>
      <button className="btn btn-secondary btn-xs lg:btn-md" onClick={() => setIsModalOpen(true)} >
        <LinkIcon />
      </button>
      <ThemeModal open={isModalOpen} className="max-w-2xl h-[80%]">
        <div className="flex flex-col w-full h-full items-center justify-between space-y-5 p-3 " >
          <Dialog.Title>
            <h3 className="font-bold text-lg text-base-content flex-1"> link review </h3>
          </Dialog.Title>

          <Virtuoso
            className="w-full overflow-y-auto space-y-1"
            data={reviews}
            overscan={200}
            itemContent={(i, review) => {
              const image = getReviewOverviewImage(review)
              const [bgStyle, textStyle, hoverStyle] =
                review.id === selectedReview ? ["bg-success", "text-success-content", ''] : ["bg-base-200", "text-base-content", 'hover:bg-base-focus']
              return (
                <div
                  className={`w-full max-w-full h-24 card card-body flex flex-row justify-around items-center p-0.5 m-1 ${bgStyle} ${hoverStyle}`}
                  key={i}
                  onClick={() => setSelectedReview(review.id)}>
                  <div className="avatar flex-none">
                    <div className="w-8 md:w-16 rounded">
                      <img src={image} />
                    </div>
                  </div>
                  <div className="grow grid grid-cols-3 max-w-[75%] text-center">
                    <div className={`${searchTextResult} ${textStyle}`}> {review.reviewName} </div>
                    <div className={`${searchTextResult} ${textStyle}`}> {review.entity?.name} </div>
                    <div className={`${searchTextResult} ${textStyle}`}> {review.creator.id} </div>
                  </div>
                </div>)
            }} />
          <div className="flex flex-row items-center justify-around w-full m-0" >
            <button
              className={`btn btn-success disabled:btn-outline ${isLoading ? 'loading' : ''}`}
              disabled={!canSubmit}
              onClick={handleLinkReview}
            >
              <CheckIcon />
            </button>
            <button className="btn btn-info" onClick={onCancel}>
              <CrossIcon />
            </button>
          </div>
        </div>
      </ThemeModal>
    </div>
  )
}