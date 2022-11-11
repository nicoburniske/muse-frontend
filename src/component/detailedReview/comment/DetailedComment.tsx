import { DetailedCommentFragment, EntityType, useCreateCommentMutation, useDeleteCommentMutation, useDetailedReviewCommentsQuery, usePlayTracksMutation, useUpdateCommentMutation } from 'graphql/generated/schema'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { CommentFormModal } from '../commentForm/CommentFormModal'
import { currentUserIdAtom } from 'state/Atoms'
import { useAtomValue } from 'jotai'
import UserAvatar, { TooltipPos } from 'component/UserAvatar'
import { ArrowDownIcon, ArrowUpIcon, EditIcon, HazardIcon, PlayIcon, ReplyIcon, SearchIcon, TrashIcon } from 'component/Icons'
import { useQueryClient } from '@tanstack/react-query'
import { ReviewOverview } from '../DetailedReview'
import CommentMarkdown from './CommentMarkdown'

export interface DetailedCommentProps {
    review: ReviewOverview
    comment: DetailedCommentFragment
    children: DetailedCommentFragment[]
    onClick: () => void
}

// TODO: CHANGE STYLING BASED ON NOW PLAYING!
export default function DetailedComment({ review, comment: detailedComment, children, onClick }: DetailedCommentProps) {
    const reviewId = review.reviewId
    const queryClient = useQueryClient()
    const currentUserId = useAtomValue(currentUserIdAtom)
    const isEditable = useMemo(() => detailedComment.commenter?.id === currentUserId, [detailedComment, currentUserId])

    const [isEditing, setIsEditing] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const { mutateAsync: deleteCommentMutation, isLoading: loadingDelete } = useDeleteCommentMutation()
    const deleteComment = async () => deleteCommentMutation({ input: { reviewId, commentId: detailedComment.id } })
    const { mutateAsync: updateComment, isLoading: loadingUpdate } = useUpdateCommentMutation()
    const { mutateAsync: replyComment, isLoading: loadingReply } = useCreateCommentMutation()

    const isChild = detailedComment.parentCommentId != null
    const avatar = detailedComment?.commenter?.spotifyProfile?.images?.at(-1)
    const comment = detailedComment?.comment ?? 'Failed to retrieve comment'
    const commenterName = detailedComment.commenter?.spotifyProfile?.displayName ?? detailedComment.commenter?.id
    const createdAt = (() => {
        const date = new Date(detailedComment?.updatedAt)
        return `${date.toLocaleDateString()}  ${date.getHours()}:${date.getMinutes()}`
    })()

    const reloadComments = () => queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })

    const onDelete = async () => {
        await deleteComment()
        reloadComments()
    }

    const onUpdate = async (content: string) => {
        const input = { reviewId, commentId: detailedComment.id, comment: content }
        await updateComment({ input })
        resetState()
        reloadComments()
    }

    const tracks = (detailedComment.entities ?? []).map(e => e.id)
    const { mutate: playTrack, isLoading } = usePlayTracksMutation({
        onError: () => toast.error('Failed to start playback. Please start a playback session and try again.'),
        onSuccess: () => { }
    })

    const onPlayTrack = () => {
        if (tracks.length > 0 && !isLoading) {
            playTrack({ input: { trackIds: tracks } })
        }
    }

    const onReply = async (content: string) => {
        const input = {
            reviewId,
            comment: content,
            parentCommentId: detailedComment.id,
            entities: detailedComment?.entities?.map(e => ({ entityId: e.id, entityType: EntityType[e.__typename!] })) ?? []
        }
        await replyComment({ input })
        resetState()
        reloadComments()
    }

    const resetState = () => {
        setIsEditing(false)
        setIsReplying(false)
    }


    const expanded = (isExpanded && children.length > 0) ? 'collapse-open' : 'collapse-close'
    const childrenBg = (isExpanded) ? 'bg-primary card p-2' : ''
    const buttonClass = 'btn btn-ghost btn-xs p-0 lg:btn-s'
    return (
        <div tabIndex={0} className={`collapse group rounded-box ${expanded} py-1`}>
            <div className="collapse-title card card-body w-full text-base-content flex flex-col items-center justify-around bg-base-200 space-y-px py-0.5 md:py-1 px-0 relative">
                {/* Delete confirmation */}
                {isDeleting ?
                    <div className="absolute inset-0 z-10 bg-base-300/60">
                        <div className="w-full h-full grid place-items-center">
                            <div className="flex flex-col items-center" >
                                <p>are you sure?</p>
                                <div className="btn-group btn-group-horizontal " >
                                    <button className={`btn btn-error tooltip tooltip-bottom tooltip-error ${loadingDelete ?? 'loading'}`} data-tip="delete comment" onClick={onDelete}>
                                        <HazardIcon />
                                    </button>
                                    <button className="btn btn-info tooltip tooltip-bottom tooltip-info" data-tip="cancel delete" onClick={() => setIsDeleting(false)}>
                                        <ReplyIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    : null
                }

                <div className="flex flex-row w-full ">
                    <div className="self-start flex items-center justify-around flex-col space-y-2 justify-self-start py-1">
                        <UserAvatar displayName={commenterName as string} image={avatar as string} tooltipPos={TooltipPos.Down} />
                        <div className="text-base-content text-wrap text-xs text-center lg:w-full md:text-base"> {createdAt} </div>
                    </div>
                    <div className="grid place-items-center w-full mx-1" >
                        <article className="card card-body p-0.5 lg:p-2 min-w-full min-h-full prose text-base-content bg-base-100 text-sm md:text-base">
                            <CommentMarkdown comment={comment} trackId={detailedComment?.entities?.at(0)?.id!} />
                        </article>
                    </div>
                </div>
                <div className="flex-grow-1 flex flex-row justify-around w-full">
                    <button className={`${buttonClass} btn-success`} onClick={onClick}>
                        <SearchIcon />
                    </button>
                    <button className={`${buttonClass} btn-success`} onClick={onPlayTrack}>
                        <PlayIcon />
                    </button>
                    {/* For now we don't want to permit infinite nesting */}
                    <button className={`${buttonClass} ${loadingReply ?? 'loading'}`} disabled={isChild || loadingReply} onClick={() => setIsReplying(true)}>
                        <ReplyIcon />
                    </button>
                    {isEditable ? (
                        <>
                            <button className={`${buttonClass} btn-error ${loadingDelete ?? 'loading'}`} disabled={loadingDelete} onClick={() => setIsDeleting(true)}>
                                <TrashIcon />
                            </button>
                            <button className={`${buttonClass} btn-primary ${loadingUpdate ?? 'loading'}`} disabled={loadingUpdate} onClick={() => setIsEditing(true)}>
                                <EditIcon />
                            </button>
                        </>)
                        : null
                    }
                    {(children.length > 0) ?
                        (
                            <button className={`${buttonClass} btn-info`} onClick={() => setIsExpanded(!isExpanded)}>
                                {
                                    isExpanded ?
                                        <ArrowUpIcon /> :
                                        <ArrowDownIcon />
                                }
                            </button>
                        ) :
                        null
                    }
                </div >
            </div>
            {
                (children.length > 0) ?
                    (<div tabIndex={0} className={`collapse-content ${childrenBg} space-y-0.5 px-1`}>
                        {
                            children.map(child =>
                                <DetailedComment key={child.id} review={review} comment={child} children={[]} onClick={onClick} />
                            )
                        }
                    </div>
                    ) : null
            }

            {/* TODO: move this to an inline editor! */}
            <CommentFormModal
                title={'edit comment'}
                open={isEditing}
                onSubmit={onUpdate}
                onCancel={resetState}
                trackId={detailedComment?.entities?.at(0)?.id!}
                initialValue={comment}
            />
            <CommentFormModal
                title={'reply to comment'}
                open={isReplying}
                onSubmit={onReply}
                trackId={detailedComment?.entities?.at(0)?.id!}
                onCancel={resetState}
            />
        </div >
    )
}
