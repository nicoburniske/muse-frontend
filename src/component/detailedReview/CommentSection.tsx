import { DetailedCommentFragment, DetailedReviewCommentsQuery, ReviewUpdatesSubscription, useDetailedReviewCommentsQuery } from 'graphql/generated/schema'
import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { groupBy, nonNullable } from 'util/Utils'
import DetailedComment from './comment/DetailedComment'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { ReviewOverview } from './table/Helpers'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'
import { useReviewUpdatesSubscription } from 'graphql/generated/urqlSchema'


export default function ReviewCommentSection({ reviews }: { reviews: ReviewOverview[] }) {
    const reviewIds = reviews.map(r => r.reviewId)
    subscribeToReviews(reviewIds)

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

    const reviewOverviews = groupBy(reviews, r => r.reviewId, r => r)

    const comments = useMemo(() => {
        return [...validComments]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }, [validComments])

    const childComments = useMemo(() => {
        const childComments = comments
            .filter(comment => comment.parentCommentId !== null)
            .filter(comment => comment.parentCommentId !== undefined)
        return groupBy(childComments, c => c.parentCommentId, c => c)
    }, [comments])

    const rootComments = useMemo(() => comments.filter(comment => comment.parentCommentId === null), [comments])

    const setSelectedTrack = useSetAtom(selectedTrackAtom)

    // We want to find the track that the comment is applied to and scroll to it.
    const onCommentClick = (commentId: number, reviewId: string) => {
        const trackId = comments.find(c => c.id == commentId)?.entities?.at(0)?.id
        if (trackId) {
            setSelectedTrack(undefined)
            setTimeout(() => setSelectedTrack({ trackId, reviewId }), 1)
        }
    }

    return (
        <div className="flex flex-col space-y-0.5 lg:space-y-1 h-full w-full overflow-auto">
            {rootComments.map((c: DetailedCommentFragment) =>
                <div key={c.id}>
                    <DetailedComment
                        review={reviewOverviews.get(c.reviewId)?.at(0)!}
                        comment={c}
                        childComments={childComments.get(c.id) ?? []}
                        onClick={() => onCommentClick(c.id, c.reviewId)}
                    />
                </div>
            )}
        </div>
    )
}

const subscribeToReviews = (reviewIds: string[]) => {
    const queryClient = useQueryClient()

    const handleReviewUpdate = useCallback((_previous: ReviewUpdatesSubscription | undefined, newEvent: ReviewUpdatesSubscription) => {
        const event = newEvent?.reviewUpdates

        if (event?.__typename) {
            switch (event.__typename) {
            case 'CreatedComment':
                queryClient.setQueryData< DetailedReviewCommentsQuery>(useDetailedReviewCommentsQuery.getKey({ reviewId: event.comment.reviewId }), data => {
                    if (data === undefined) {
                        return undefined
                    }
                    const comments = data?.review?.comments ?? []
                    const updatedCommentId = event.comment.id
                    const newComments = comments.filter(comment => comment.id !== updatedCommentId)
                    newComments.push(event.comment)
                    return {
                        review: {
                            ...data?.review,
                            comments: newComments 
                        }
                    } 
                })
                break
            case 'UpdatedComment':
                queryClient.setQueryData<DetailedReviewCommentsQuery>(useDetailedReviewCommentsQuery.getKey({ reviewId: event.comment.reviewId }), (data) => {
                    if(data === undefined) {
                        return undefined
                    }
                    const comments = data?.review?.comments ?? []
                    const updatedCommentId = event.comment.id
                    const filtered = comments.filter(comment => comment.id !== updatedCommentId)
                    filtered.push(event.comment)
                    return {
                        review: {
                            ...data?.review,
                            comments: filtered
                        }
                    } 
                })
                break
            case 'DeletedComment': {
                const cacheKey = useDetailedReviewCommentsQuery.getKey({ reviewId: event.reviewId })
                queryClient.setQueryData<DetailedReviewCommentsQuery>(cacheKey, (data) => {
                    const comments = data?.review?.comments ?? []
                    const deletedCommentId = event.commentId
                    const removeDeleted = comments.filter(comment => comment.id !== deletedCommentId)
                    return {
                        review: {
                            ...data?.review,
                            comments: removeDeleted
                        }
                    }
                })
                queryClient.invalidateQueries(cacheKey)
                break
            }
            default:
                console.error('Unhandled review update event', event)
            }
        }
        return newEvent
    }, [queryClient])

    useReviewUpdatesSubscription({
        variables: { reviewIds },
    },
    handleReviewUpdate
    )
}