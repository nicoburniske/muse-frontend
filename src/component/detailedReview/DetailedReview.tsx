import { EntityType, ReviewDetailsFragment, useDetailedReviewQuery, useGetPlaylistQuery, useGetAlbumQuery, DetailedPlaylistFragment, DetailedAlbumFragment } from 'graphql/generated/schema'
import { useEffect, useMemo } from 'react'
import { useSetAtom, useAtomValue, atom, useAtom } from 'jotai'
import { currentUserIdAtom, selectedTrackAtom } from 'state/Atoms'
import { ShareReview } from './ShareReview'
import { CommentFormModalWrapper } from './commentForm/CommentFormModalWrapper'
import { EditReviewButton } from './editReview/EditReview'
import { ArrowRightLeftIcon, CommentIcon, MusicIcon } from 'component/Icons'
import Split from 'react-split'
import { nonNullable, findFirstImage, groupBy, classNames } from 'util/Utils'
import CreateReview from 'component/createReview/CreateReview'
import { useQueries, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { GroupedTrackTableWrapper } from './table/GroupedTrackTable'
import { LinkReviewButton } from './LinkReview'
import ReviewCommentSection from './CommentSection'
import { NotFound } from 'pages/NotFound'
import { Group, ReviewOverview } from './table/Helpers'
import { useSetCurrentReview } from 'state/CurrentReviewAtom'
import { UserIcon } from '@heroicons/react/20/solid'

export interface DetailedReviewProps {
    reviewId: string
    isSm: boolean
}

export type RenderOptions = 'tracks' | 'comments' | 'both'
const renderOptionAtom = atom<RenderOptions>('both')

export function DetailedReview({ reviewId, isSm }: DetailedReviewProps) {
    const { data, isLoading } = useDetailedReviewQuery({ reviewId }, { suspense: true })

    const setSelectedTrack = useSetAtom(selectedTrackAtom)
    const setRenderOption = useSetAtom(renderOptionAtom)

    useEffect(() => {
        setRenderOption(isSm ? 'tracks' : 'both')
        // On unmount reset selected track. Avoids scroll to track on review mount.
        return () => setSelectedTrack(undefined)
    }, [])


    if (data?.review) {
        return (
            < DetailedReviewContent
                reviewId={reviewId}
                review={data.review}
            />
        )
    } else if (!isLoading) {
        return (
            <NotFound />
        )
    }
}

interface DetailedReviewContentProps {
    reviewId: string
    review: ReviewDetailsFragment
}

const DetailedReviewContent = ({ reviewId, review }: DetailedReviewContentProps) => {
    useSetCurrentReview(reviewId)

    const entityId = review.entity?.id ?? ''

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


    return (
        < div className="w-full h-full flex flex-col relative">
            <ReviewHeader review={review} />
            <div className="grow min-h-0 bg-base-300 mx-1">
                <DetailedReviewBody rootReview={reviewId} reviews={allReviews} />
            </div>
            <CommentFormModalWrapper />
        </div >
    )
}

const tabStyle = 'tab tab-xs md:tab-md lg:tab-lg tab-boxed'

const ReviewHeader = ({ review }: { review: ReviewDetailsFragment }) => {
    const queryClient = useQueryClient()
    const reload = () => queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId }))

    const reviewId = review.id
    const userId = useAtomValue(currentUserIdAtom)
    const parentReviewIdAtom = useMemo(() => atom<string>(reviewId), [])

    const isReviewOwner = userId === review?.creator?.id
    const collaborators = review?.collaborators ?? []
    const isPublic = review.isPublic
    const title = review.reviewName
    const entityName = review.entity?.name ?? 'No Entity Linked'
    const creator = review?.creator?.spotifyProfile?.displayName ?? review?.creator?.id
    const entity = review?.entity

    // Find first image!
    const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
    // Root review doesn't need an entity.
    const reviewEntityImage = findFirstImage(nonNullable(entity) ? [entity, ...childEntities] : childEntities)

    const childReviewIds = review
        ?.childReviews
        ?.filter(nonNullable)
        ?.map(c => c?.id)
        .filter(nonNullable) ?? []

    return (
        <div className="flex flex-row justify-between items-center bg-base-100 px-5 shadow-l mb-1">
            <div className="col-span-3 lg:col-span-2 flex flex-row justify-start items-center p-1 space-x-1">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                        <img className="hidden md:flex object-scale-down object-center h-20 w-20 shadow-2xl" src={reviewEntityImage} />
                        <div>
                            <div className="flex items-center">
                                <img className="sm:hidden object-scale-down object-center h-10 w-10 shadow-2xl" src={reviewEntityImage} />
                            </div>
                            <dl className="flex flex-col items-start justify-center space-y-1 ml-1">
                                <h1 className="text-2xl font-bold leading-7 sm:truncate sm:leading-9">
                                    {title}
                                </h1>
                                <dt className="sr-only">Entity Details</dt>
                                <dd className="flex items-center text-sm font-medium sm:mr-6">
                                    <div className="badge badge-secondary truncate overflow-hidden whitespace-nowrap mr-1.5">{entity?.__typename}</div>
                                    {entityName}
                                </dd>
                                <dt className="sr-only">Creator name</dt>
                                <dd className="mt-3 flex items-center text-sm font-medium capitalize text-gray-500 sm:mr-6 sm:mt-0">
                                    <UserIcon
                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-primary"
                                        aria-hidden="true"
                                    />
                                    {creator}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tabs flex flex-row justify-center">
                <RenderOptionTabs />
            </div>
            {
                isReviewOwner ?
                    <div className="grid grid-cols-2 gap-1 lg:flex lg:space-x-1">
                        <ShareReview reviewId={reviewId} collaborators={collaborators} onChange={() => reload()} />
                        <EditReviewButton
                            reviewId={reviewId}
                            reviewName={title!}
                            onSuccess={() => { reload() }}
                            isPublic={isPublic === undefined ? false : isPublic}
                        />
                        <LinkReviewButton reviewId={reviewId} alreadyLinkedIds={childReviewIds} />
                        <CreateReview
                            parentReviewIdAtom={parentReviewIdAtom}
                            title="create linked review"
                            className="btn btn-secondary btn-sm lg:btn-md" />
                    </div>
                    : null
            }
        </div >

    )
}

const RenderOptionTabs = () => {
    const [renderOption, setRenderOption] = useAtom(renderOptionAtom)
    return (
        <>
            <button className={classNames(tabStyle, renderOption === 'tracks' ? 'tab-active' : '')}
                onClick={() => setRenderOption('tracks')}
            >
                <MusicIcon />
            </button>
            <button className={classNames(tabStyle, renderOption === 'both' ? 'tab-active' : '')}
                onClick={() => setRenderOption('both')}
            >
                <ArrowRightLeftIcon />
            </button>
            <button className={classNames(tabStyle, renderOption === 'comments' ? 'tab-active' : '')}
                onClick={() => setRenderOption('comments')}
            >
                <CommentIcon />
            </button>

        </>
    )
}

interface DetailedReviewBodyProps {
    rootReview: string
    reviews: ReviewAndEntity[]
}

export type ReviewAndEntity = ReviewOverview & {
    entityId: string
    entityType: EntityType
}

const DetailedReviewBody = ({ rootReview, reviews }: DetailedReviewBodyProps) => {
    const options = useAtomValue(renderOptionAtom)
    const trackSection = <TrackSectionTable rootReview={rootReview} all={reviews} />
    const commentSection = <ReviewCommentSection reviews={reviews} />
    const setSelectedTrack = useSetAtom(selectedTrackAtom)

    // Avoid scroll to track when changing tabs.
    useEffect(() => {
        setSelectedTrack(undefined)
    }, [options])

    return (
        <div className="h-full px-1">
            {(options == 'both') ?
                <Split
                    className="flex h-full space-x-1"
                    sizes={[50, 50]}
                    direction="horizontal"
                >
                    {trackSection}
                    {commentSection}
                </Split>
                :
                <div className="flex h-full w-full">
                    {(options == 'tracks')
                        ?
                        trackSection :
                        commentSection}
                </div>
            }
        </div>
    )
}

const TrackSectionTable = ({ all, rootReview }: { all: ReviewAndEntity[], rootReview: string }) => {
    const allIds = groupBy(all, r => r.entityType, r => r.entityId)
    const playlistIds = allIds.get(EntityType.Playlist) ?? []
    const albumIds = allIds.get(EntityType.Album) ?? []
    const playlistResults = useQueries({
        queries: playlistIds.map(id => ({
            queryKey: useGetPlaylistQuery.getKey({ id }),
            queryFn: useGetPlaylistQuery.fetcher({ id }),
        }))
    })
    // Is there a better way of handling likes than this? Hypothetically we have an infinite stale time.  
    const albumResults = useQueries({
        queries: albumIds.map(id => ({
            queryKey: useGetAlbumQuery.getKey({ id }),
            queryFn: useGetAlbumQuery.fetcher({ id }),
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
                acc.push({ data, overview: { reviewName, reviewId } })
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