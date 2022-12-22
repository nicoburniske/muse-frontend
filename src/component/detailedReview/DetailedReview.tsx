import { EntityType, ReviewDetailsFragment, useDetailedReviewQuery, useGetPlaylistQuery, useGetAlbumQuery, DetailedPlaylistFragment, DetailedAlbumFragment } from 'graphql/generated/schema'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSetAtom, useAtomValue, atom } from 'jotai'
import { currentUserIdAtom, selectedTrackAtom } from 'state/Atoms'
import { ShareReview } from './ShareReview'
import { Alert, AlertSeverity } from 'component/Alert'
import { CommentFormModalWrapper } from './commentForm/CommentFormModalWrapper'
import { EditReviewButton } from './editReview/EditReview'
import { ArrowRightLeftIcon, CommentIcon, MusicIcon } from 'component/Icons'
import Split from 'react-split'
import { nonNullable, findFirstImage, groupBy } from 'util/Utils'
import CreateReview from 'component/createReview/CreateReview'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { GroupedTrackTableWrapper } from './table/GroupedTrackTable'
import { LinkReviewButton } from './LinkReview'
import ReviewCommentSection from './CommentSection'
import { SpotifyPlayerWrapper } from './playback/SpotifyPlayerWrapper'
import { ErrorBoundary } from 'react-error-boundary'
import { NotFound } from 'pages/NotFound'
import { UserPreferencesButton } from 'component/preferences/UserPreferencesForm'
import { Group, ReviewOverview } from './table/Helpers'

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
    const { data, isLoading, refetch } = useDetailedReviewQuery({ reviewId }, { suspense: true })

    const setSelectedTrack = useSetAtom(selectedTrackAtom)

    // On unmount reset selected track. Avoids scroll to track on review mount.
    useEffect(
        () => () => setSelectedTrack(undefined)
        , [])


    if (data?.review) {
        return (
            < DetailedReviewContent
                renderOption={isSm ? RenderOptions.Tracks : RenderOptions.Both}
                reviewId={reviewId}
                review={data.review}
                reload={() => refetch()
                } />
        )
    } else if (!isLoading) {
        return (
            <NotFound />
        )
    }
}

interface DetailedReviewContentProps {
    renderOption: RenderOptions
    reviewId: string
    review: ReviewDetailsFragment
    reload: () => void
}

const DetailedReviewContent = ({ renderOption: renderOptionProp, reviewId, review, reload }: DetailedReviewContentProps) => {
    const [renderOption, setRenderOption] = useState(renderOptionProp)
    const userId = useAtomValue(currentUserIdAtom)
    const parentReviewIdAtom = useMemo(() => atom<string>(reviewId), [])

    const isReviewOwner = userId === review?.creator?.id
    const collaborators = review?.collaborators ?? []
    const isPublic = review.isPublic
    const title = review.reviewName
    const entityName = review.entity?.name
    const entityId = review.entity?.id ?? ''
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
            reviewName: child?.reviewName as string
        })) ?? []
    const parent = nonNullable(review?.entity) ?
        {
            reviewId,
            entityId,
            entityType: review.entity.__typename as EntityType,
            reviewName: review?.reviewName as string
        }
        : undefined
    const allReviews = [parent, ...children].filter(nonNullable)

    const tabStyle = 'tab tab-xs md:tab-md lg:tab-lg tab-boxed'

    return (
        < div className="w-full h-screen flex flex-col relative">
            <div className="grid grid-cols-5 lg:grid-cols-4 items-center bg-base-100">
                <div className="col-span-3 lg:col-span-2 flex flex-row justify-start items-center p-1 space-x-1">
                    <div className="card flex flex-row items-center bg-base-200 px-1 md:mx-1 md:space-x-2">
                        <img className="hidden md:flex object-scale-down object-center h-24 w-24" src={reviewEntityImage} />
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
                                <EditReviewButton
                                    reviewId={reviewId}
                                    reviewName={title!}
                                    onSuccess={() => { reload() }}
                                    isPublic={isPublic === undefined ? false : isPublic}
                                />
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
                    <UserPreferencesButton />
                </div>

                {/* <div className="flex flex-row items-center h-full">
          <div className="stats shadow">
            <div className="stat h-full">
            </div>
          </div>
          {collaboratorImages}
        </div> */}
            </div>
            <CommentFormModalWrapper />
            <div className="grow min-h-0 w-full bg-base-300">
                <DetailedReviewBody rootReview={reviewId} reviews={allReviews} options={renderOption} />
            </div>
            <div className='w-full bg-neutral'>
                <ErrorBoundary fallback={
                    <Alert severity={AlertSeverity.Error}>
                        <span> Error Starting Playback </span>
                    </Alert >
                }>
                    <Suspense fallback={<progress className="progress progress-primary" />}>
                        <SpotifyPlayerWrapper reviewId={reviewId} />
                    </Suspense>
                </ErrorBoundary>
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
    const trackSection = () => (<TrackSectionTable rootReview={rootReview} all={reviews} />)
    const commentSection = () => (<ReviewCommentSection reviews={reviews} />)
    return (
        <div className="h-full px-1">
            {(options == RenderOptions.Both) ?
                <Split
                    className="flex h-full"
                    sizes={[50, 50]}
                    direction="horizontal"
                >
                    {trackSection()}
                    {commentSection()}
                </Split>
                :
                <div className="flex h-full w-full">
                    {(options == RenderOptions.Tracks)
                        ?
                        trackSection() :
                        commentSection()}
                </div>
            }
        </div>
    )
}

export type ReviewAndEntity = ReviewOverview & {
    entityId: string
    entityType: EntityType
}

const TrackSectionTable = ({ all, rootReview }: { all: ReviewAndEntity[], rootReview: string }) => {
    const allIds = groupBy(all, r => r.entityType, r => r.entityId)
    const playlistIds = allIds.get(EntityType.Playlist) ?? []
    const albumIds = allIds.get(EntityType.Album) ?? []
    const playlistResults = useQueries({
        queries: playlistIds.map(id => ({
            queryKey: useGetPlaylistQuery.getKey({ id }),
            queryFn: useGetPlaylistQuery.fetcher({ id })
        }))
    })
    const albumResults = useQueries({
        queries: albumIds.map(id => ({
            queryKey: useGetAlbumQuery.getKey({ id }),
            queryFn: useGetAlbumQuery.fetcher({ id }),
            // Never have to refetch albums because they don't update.
            // staleTime: Infinity
        })),
    })

    // Ensure that indicies line up.
    const matchedReviews = useMemo(() => {
        const allReviews = all.filter(r => r.entityType === EntityType.Album || r.entityType === EntityType.Playlist)
        // get all reviews that are not nullable
        const results: (DetailedAlbumFragment | DetailedPlaylistFragment)[] =
            [...albumResults, ...playlistResults]
                .map(r => r.data?.getAlbum ?? r.data?.getPlaylist)
                .filter(nonNullable)
        return allReviews.reduce((acc, { entityId, reviewName, reviewId }) => {
            const data = results.find(r => r.id === entityId)
            if (data) {
                acc.push({ data, overview: { reviewName, reviewId }})
            }
            return acc
        }, new Array<Group>())
    }, [all, albumResults, playlistResults])

    const isLoading = areAllLoadingNoData([...playlistResults, ...albumResults])

    return (
        <div className="w-full flex" >
            {
                isLoading ?
                    (
                        <div className="w-full grid place-items-center">
                            <div className="border-t-transparent border-solid animate-spin rounded-full border-primary border-8 h-56 w-56" />
                        </div>
                    ) :
                    <GroupedTrackTableWrapper results={matchedReviews} rootReview={rootReview} />
            }
        </div >
    )

}

const areAllLoadingNoData = (results: UseQueryResult<any, unknown>[]) => {
    return results.some(r => r.isLoading) && results.every(r => r.data === undefined)
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