import { DetailedCommentFragment, useDetailedReviewCommentsQuery } from 'graphql/generated/schema'
import { useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { groupBy, nonNullable } from 'util/Utils'
import DetailedComment from './comment/DetailedComment'
import { useQueries } from '@tanstack/react-query'
import { ReviewOverview } from './table/Helpers'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'


export default function ReviewCommentSection({ reviews }: { reviews: ReviewOverview[] }) {
    const reviewIds = reviews.map(r => r.reviewId)
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

// const subscribeToReview = (reviewIds: string[]) => {

//     useReviewUpdatesSubscription({
//         variables: { reviewId }, onSubscriptionData: (data) => {
//             const commentEvent = data.subscriptionData.data?.reviewUpdates
//             if (commentEvent?.__typename) {
//                 switch (commentEvent.__typename) {
//                     case "CreatedComment":
//                         setComments([...comments, commentEvent.comment])
//                         break;
//                     case "UpdatedComment":
//                         const updatedCommentId = commentEvent.comment.id
//                         const filtered = comments.filter(comment => comment.id !== updatedCommentId)
//                         filtered.push(commentEvent.comment)
//                         setComments(filtered)
//                         break;
//                     case "DeletedComment":
//                         const deletedCommentId = commentEvent.commentId
//                         const removeDeleted = comments.filter(comment => comment.id !== deletedCommentId)
//                         setComments(removeDeleted)
//                         break;
//                     default:
//                         console.error("Unhandled review update event", commentEvent)
//                 }
//             }
//         }
//     })
//     return comments
// }
// }