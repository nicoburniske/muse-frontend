import {
   DetailedCommentFragment,
   EntityType,
   useCreateCommentMutation,
   useDeleteCommentMutation,
   useDetailedReviewCommentsQuery,
   useUpdateCommentMutation,
} from 'graphql/generated/schema'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { CommentFormModal } from '../commentForm/CommentFormModal'
import UserAvatar, { TooltipPos } from 'component/UserAvatar'
import {
   ArrowDownIcon,
   ArrowUpIcon,
   EditIcon,
   HazardIcon,
   PlayIcon,
   ReplyIcon,
   SearchIcon,
   TrashIcon,
} from 'component/Icons'
import { useQueryClient } from '@tanstack/react-query'
import CommentMarkdown from './CommentMarkdown'
import { usePlayMutation } from 'component/sdk/ClientHooks'
import { nonNullable, padTime } from 'util/Utils'
import { ReviewOverview } from '../table/Helpers'
import { useCurrentUserId } from 'state/CurrentUser'

export interface DetailedCommentProps {
   review: ReviewOverview
   comment: DetailedCommentFragment
   childComments: DetailedCommentFragment[]
   onClick: () => void
}

// TODO: CHANGE STYLING BASED ON NOW PLAYING!
export default function DetailedComment({
   review,
   comment: detailedComment,
   childComments,
   onClick,
}: DetailedCommentProps) {
   const reviewId = review.reviewId
   const queryClient = useQueryClient()
   const currentUserId = useCurrentUserId()
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
   const isDeleted = !nonNullable(detailedComment?.comment)
   const avatar = detailedComment?.commenter?.spotifyProfile?.images?.at(-1)
   const comment = detailedComment?.comment ?? '**deleted**'
   const commenterName = detailedComment.commenter?.spotifyProfile?.displayName ?? detailedComment.commenter?.id
   const createdAt = (() => {
      const date = new Date(detailedComment?.updatedAt)
      return `${date.toLocaleDateString()}  ${padTime(date.getHours())}:${padTime(date.getMinutes())}`
   })()

   const reloadComments = () =>
      queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })

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
   const { playTracks, isLoading } = usePlayMutation({
      onError: () => toast.error('Failed to play track.'),
   })

   const onPlayTrack = () => {
      if (tracks.length > 0 && !isLoading) {
         playTracks(tracks)
      }
   }

   const onReply = async (content: string) => {
      const input = {
         reviewId,
         comment: content,
         parentCommentId: detailedComment.id,
         entities:
            detailedComment?.entities?.map(e => ({ entityId: e.id, entityType: EntityType[e.__typename!] })) ?? [],
      }
      await replyComment({ input })
      resetState()
      reloadComments()
   }

   const resetState = () => {
      setIsEditing(false)
      setIsReplying(false)
   }

   const expanded = isExpanded && childComments.length > 0 ? 'collapse-open' : 'collapse-close'
   const childrenBg = isExpanded ? 'bg-primary card p-2' : ''
   const buttonClass = 'btn btn-ghost btn-xs p-0 lg:btn-s'
   return (
      <div tabIndex={0} className={`group collapse rounded-box ${expanded} py-1`}>
         <div className='card card-body collapse-title relative flex w-full flex-col items-center justify-around space-y-px bg-base-200 py-0.5 px-0 text-base-content md:py-1'>
            {/* Delete confirmation */}
            {isDeleting ? (
               <div className='absolute inset-0 z-10 bg-base-300/60'>
                  <div className='grid h-full w-full place-items-center'>
                     <div className='flex flex-col items-center'>
                        <p>are you sure?</p>
                        <div className='btn-group btn-group-horizontal '>
                           <button
                              className={`btn tooltip tooltip-bottom btn-error tooltip-error ${
                                 loadingDelete ?? 'loading'
                              }`}
                              data-tip='delete comment'
                              onClick={onDelete}
                           >
                              <HazardIcon />
                           </button>
                           <button
                              className='btn tooltip tooltip-bottom btn-info tooltip-info'
                              data-tip='cancel delete'
                              onClick={() => setIsDeleting(false)}
                           >
                              <ReplyIcon />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            ) : null}

            <div className='flex w-full flex-row '>
               <div className='flex flex-col items-center justify-around space-y-2 self-start justify-self-start py-1'>
                  <UserAvatar
                     displayName={commenterName as string}
                     image={avatar as string}
                     tooltipPos={TooltipPos.Down}
                  />
                  <div className='text-wrap text-center text-xs text-base-content md:text-base lg:w-full'>
                     {' '}
                     {createdAt}{' '}
                  </div>
               </div>
               <div className='mx-1 grid w-full place-items-center'>
                  <article className='prose card card-body min-h-full min-w-full bg-base-100 p-0.5 text-sm text-base-content md:text-base lg:p-2'>
                     <CommentMarkdown comment={comment} trackId={detailedComment?.entities?.at(0)?.id!} />
                  </article>
               </div>
            </div>
            <div className='flex-grow-1 flex w-full flex-row justify-around'>
               {isDeleted ? null : (
                  <>
                     <button className={`${buttonClass} btn-success`} onClick={onClick}>
                        <SearchIcon />
                     </button>
                     <button className={`${buttonClass} btn-success`} onClick={onPlayTrack}>
                        <PlayIcon />
                     </button>
                     {/* For now we don't want to permit infinite nesting */}
                     <button
                        className={`${buttonClass} ${loadingReply ?? 'loading'}`}
                        disabled={isChild || loadingReply}
                        onClick={() => setIsReplying(true)}
                     >
                        <ReplyIcon />
                     </button>
                     {isEditable ? (
                        <>
                           <button
                              className={`${buttonClass} btn-error ${loadingDelete ?? 'loading'}`}
                              disabled={loadingDelete}
                              onClick={() => setIsDeleting(true)}
                           >
                              <TrashIcon />
                           </button>
                           <button
                              className={`${buttonClass} btn-primary ${loadingUpdate ?? 'loading'}`}
                              disabled={loadingUpdate}
                              onClick={() => setIsEditing(true)}
                           >
                              <EditIcon />
                           </button>
                        </>
                     ) : null}
                  </>
               )}

               {childComments.length > 0 ? (
                  <button className={`${buttonClass} btn-info`} onClick={() => setIsExpanded(!isExpanded)}>
                     {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </button>
               ) : null}
            </div>
         </div>
         {childComments.length > 0 ? (
            <div tabIndex={0} className={`collapse-content ${childrenBg} space-y-0.5 px-1`}>
               {childComments.map(child => (
                  <DetailedComment
                     key={child.id}
                     review={review}
                     comment={child}
                     childComments={[]}
                     onClick={onClick}
                  />
               ))}
            </div>
         ) : null}

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
      </div>
   )
}
