import { DetailedCommentFragment, useAvailableDevicesSubscription, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useNowPlayingOffsetSubscription, useReviewUpdatesSubscription, useSeekPlaybackMutation } from "graphql/generated/schema"
import DetailedPlaylist, { RenderOptions } from "component/detailedReview/DetailedPlaylist"
import { useEffect, useMemo, useState } from "react"
import { useSetAtom, useAtomValue } from "jotai"
import { playbackDevicesAtom, currentlyPlayingTrackAtom, currentUserIdAtom } from "state/Atoms"
import { ShareReview } from "./ShareReview"
import { Alert, AlertSeverity } from "component/Alert"
import { HeroLoading } from "component/HeroLoading"
import { CommentFormModalWrapper } from "./commentForm/CommentFormModalWrapper"
import { PlaybackTime } from "./PlaybackTime"
import UserAvatar from "component/UserAvatar"
import { EditReview } from "./editReview/EditReview"
import { ArrowRightLeftIcon, CommentIcon, EllipsisIcon, MusicIcon, SkipBackwardIcon } from "component/Icons"
import NavbarRhs from "component/NavbarRhs"
import { useNavigate } from "react-router-dom"
import useWindowSize from "hook/useWindowSize"
import useStateWithSyncedDefault from "hook/useStateWithSyncedDefault"
export interface DetailedReviewProps {
  reviewId: string
}

export function DetailedReview({ reviewId }: DetailedReviewProps) {
  // State.
  const { isSm } = useWindowSize()
  const [renderOption, setRenderOption,] = useStateWithSyncedDefault(isSm ? RenderOptions.Tracks : RenderOptions.Both)

  const [comments, setComments] = useState<DetailedCommentFragment[]>([])
  const [openEditReview, setOpenEditReview] = useState(false)
  const userId = useAtomValue(currentUserIdAtom)

  // Subscriptions.
  // Update jotai atom with playback devices.
  const setDevices = useSetAtom(playbackDevicesAtom)
  useAvailableDevicesSubscription({
    onSubscriptionData: (data) => {
      if (data.subscriptionData.data?.availableDevices) {
        setDevices(data.subscriptionData.data.availableDevices)
      } else {
        setDevices([])
      }
    }
  })

  const { data: nowPlayingTime, error: subErrorsTime } = useNowPlayingOffsetSubscription({ variables: { input: 1 } })
  const { error: commentErrors } = useReviewUpdatesSubscription({
    variables: { reviewId }, onSubscriptionData: (data) => {
      const commentEvent = data.subscriptionData.data?.reviewUpdates
      if (commentEvent?.__typename) {
        switch (commentEvent.__typename) {
          case "CreatedComment":
            setComments([...comments, commentEvent.comment])
            break;
          case "UpdatedComment":
            const updatedCommentId = commentEvent.comment.id
            const filtered = comments.filter(comment => comment.id !== updatedCommentId)
            filtered.push(commentEvent.comment)
            setComments(filtered)
            break;
          case "DeletedComment":
            const deletedCommentId = commentEvent.commentId
            const removeDeleted = comments.filter(comment => comment.id !== deletedCommentId)
            setComments(removeDeleted)
            break;
          default:
            console.error("Unhandled review update event", commentEvent)
        }
      }
    }
  })

  // Queries.
  useDetailedReviewCommentsQuery({
    variables: { reviewId },
    fetchPolicy: "cache-first",
    pollInterval: 5 * 60 * 1000,
    onCompleted: (data) => data.review?.comments && setComments(data.review.comments)
  })
  // This only needs to happen so that playlist tracks are refreshed.
  const { data, loading, error, refetch } = useDetailedReviewQuery({
    variables: { reviewId },
    pollInterval: 5 * 60 * 1000
  })

  const isReviewOwner = useMemo(() => userId === data?.review?.creator?.id, [data, userId])

  if (commentErrors) {
    console.error("Errors in comment event", commentErrors)
  }
  if (subErrorsTime) {
    console.error("Play errors", subErrorsTime)
  }

  const getReviewContent = useMemo(() => {
    const review = data?.review
    const entity = data?.review?.entity
    switch (entity?.__typename) {
      // case "Album":
      // case "Artist":
      // case "Track":
      case "Playlist":
        return <DetailedPlaylist
          reviewId={review?.id as string}
          playlist={entity}
          comments={comments}
          options={renderOption}
        />
      default:
        return (
          <Alert severity={AlertSeverity.Warning}>
            <span> Not Implemented Yet. </span>
          </Alert >)
    }
  }, [data, comments, renderOption])

  const title = data?.review?.reviewName
  const entityName = data?.review?.entity?.name
  const eType = data?.review?.entity?.__typename
  const creator = data?.review?.creator?.spotifyProfile?.displayName ?? data?.review?.creator?.id
  const reviewEntityImage = (() => {
    const entity = data?.review?.entity
    switch (entity?.__typename) {
      case "Artist":
        return entity?.artistImages?.at(0)
      case "Playlist":
      case "Album":
        return entity?.images.at(0)
      case "Track":
        return entity?.album?.images.at(0)
    }
  })()

  const progressMs = nowPlayingTime?.nowPlaying?.progressMs ?? 0
  const totalDuration = nowPlayingTime?.nowPlaying?.item?.durationMs ?? Number.MAX_SAFE_INTEGER
  const isPlaying = nowPlayingTime?.nowPlaying?.isPlaying ?? false
  const isShuffled = nowPlayingTime?.nowPlaying?.shuffleState ?? false
  const nowPlayingImage = nowPlayingTime?.nowPlaying?.item?.album?.images?.at(1) ?? ""
  const nowPlayingArtist = nowPlayingTime?.nowPlaying?.item?.artists?.map(a => a.name).join(", ") ?? ""
  const nowPlayingAlbum = nowPlayingTime?.nowPlaying?.item?.album?.name
  const nowPlayingTrackName = nowPlayingTime?.nowPlaying?.item?.name ?? ""

  const setNowPlaying = useSetAtom(currentlyPlayingTrackAtom)
  const nowPlaying = nowPlayingTime?.nowPlaying?.item?.id
  useEffect(() => {
    setNowPlaying(nowPlaying)
  }, [nowPlayingTime])

  const isPlayingPartOfEntity: boolean = useMemo(() => {
    const entity = data?.review?.entity
    switch (entity?.__typename) {
      case "Artist":
        return false
      case "Playlist":
        const isPlaying = entity?.tracks?.some(t => t.track.id === nowPlaying)
        return isPlaying === undefined ? false : isPlaying
      case "Album":
        return false
      case "Track":
        return entity?.id === nowPlaying
      default:
        return false
    }
  }, [data, nowPlaying])


  const collaborators = useMemo(() => (data?.review?.collaborators ?? []), [data])
  const collaboratorImages = useMemo(() => {
    const numToShow = 1
    const collaboratorsToShow = collaborators.slice(0, numToShow)
    const leftOver = Math.min(collaborators.length - numToShow, 0)
    return (
      <div className="avatar-group space-x-6">
        {
          collaboratorsToShow
            .map(u => u?.user?.spotifyProfile?.images?.at(0))
            .filter(i => i)
            .map(image =>
              <UserAvatar image={image} />
            )
        }
        {
          (leftOver > 0) ?
            <div className="avatar placeholder">
              <div className="w-12 bg-neutral-focus text-neutral-content">
                <span>+{leftOver}</span>
              </div>
            </div>
            : null
        }
      </div>)
  }, [data])

  const isPublic = data?.review?.isPublic
  const tabStyle = 'tab tab-xs md:tab-md lg:tab-lg tab-boxed'

  const nav = useNavigate()
  if (loading) {
    return <HeroLoading />
  } else if (data) {
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
                  <ShareReview reviewId={reviewId} collaborators={collaborators} onChange={() => refetch()} />
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
          onSuccess={() => { setOpenEditReview(false); refetch(); }}
          isOpen={openEditReview}
          onCancel={() => setOpenEditReview(false)} />
        <CommentFormModalWrapper />
        <div className="w-full h-[80%] bg-base-300">
          {getReviewContent}
        </div>
        <div className='w-full h-[10%]'>
          <PlaybackTime
            isPlaying={isPlaying}
            isShuffled={isShuffled}
            progressMs={progressMs}
            durationMs={totalDuration}
            trackId={nowPlaying ?? ""}
            reviewId={reviewId}
            disabled={!isPlayingPartOfEntity}
            trackImage={nowPlayingImage}
            trackName={nowPlayingTrackName}
            trackArtist={nowPlayingArtist}
          />
        </div>
      </div >
    )
  }
  if (error) {
    return (
      <Alert severity={AlertSeverity.Error}>
        <span> Error Loading Review </span>
      </Alert >)
  }
}
