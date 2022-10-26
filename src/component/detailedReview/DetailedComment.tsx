import { DetailedCommentFragment, EntityType, useCreateCommentMutation, useDeleteCommentMutation, useStartPlaybackMutation, useUpdateCommentMutation } from "graphql/generated/schema"
import { useMemo, useState } from "react"
import { toast } from "react-toastify"
import Markdown from "markdown-to-jsx"
import { CommentFormModal } from "./commentForm/CommentFormModal"
import { currentUserIdAtom } from "state/Atoms"
import { useAtomValue } from "jotai"
import UserAvatar from "component/UserAvatar"

export interface DetailedCommentProps {
  reviewId: string
  playlistId: string
  comment: DetailedCommentFragment
  children: DetailedCommentFragment[]
  onClick: () => void
}

interface TrackTimestampProps {
  at: string
  comment?: string
}
interface ConvertToTimestampProps {
  time: string
  trackId: string
  playlistId: string
  comment?: string
}

function ConvertToTimestamp({ time, trackId, playlistId, comment }: ConvertToTimestampProps) {
  // Timestamp converted to millis if valid.
  const timestamp = useMemo(() => {
    const timeSplit = time.split(":")
    if (timeSplit.length === 2) {
      const mins = parseInt(timeSplit[0])
      const seconds = parseInt(timeSplit[1])
      if (isNaN(mins) || mins > 60 || mins < 0 || isNaN(seconds) || seconds > 60 || seconds < 0) {
        return undefined
      }
      return (mins * 60 + seconds) * 1000
    }
    return undefined;
  }, [time])

  const handleError = () => {
    toast.error(`Failed to start playback. Please start a playback session and try again.`)
  }
  const onSuccess = () => {
    if (timestamp === undefined) {
      toast.warning("Successfully started playback from start. Invalid timestamp.")
    }
  }

  const [playTrack] = useStartPlaybackMutation({ onError: handleError, onCompleted: onSuccess });

  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const inner = { entityId: trackId, entityType: EntityType.Track }
    const outer = { entityId: playlistId, entityType: EntityType.Playlist }
    playTrack({ variables: { input: { entityOffset: { outer, inner }, positionMs: timestamp } } })
  }

  const text = comment !== undefined ? comment : timestamp ? `@${time}` : time
  const internal = (
    <a
      className="link link-base-content link-hover"
      onClick={e => onClick(e)}
    >
      {text}
    </a>)
  return comment !== undefined ?
    (<a className="tooltip tooltip-bottom link link-base-content link-hover" data-tip={`@${time}`}>
      {internal}
    </a>) :
    internal
}

export default function DetailedComment({ reviewId, playlistId, comment: detailedComment, children, onClick }: DetailedCommentProps) {
  const currentUserId = useAtomValue(currentUserIdAtom)
  const isEditable = useMemo(() => detailedComment.commenter?.id === currentUserId, [detailedComment, currentUserId])

  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const [deleteComment, { loading: loadingDelete }] = useDeleteCommentMutation({ variables: { input: { reviewId, commentId: detailedComment.id } } })
  const [updateComment, { loading: loadingUpdate }] = useUpdateCommentMutation()
  const [replyComment, { loading: loadingReply }] = useCreateCommentMutation()

  const isChild = detailedComment.parentCommentId != null
  const avatar = detailedComment?.commenter?.spotifyProfile?.images?.at(-1)
  const comment = detailedComment?.comment ?? "Failed to retrieve comment";
  const commenterName = detailedComment.commenter?.spotifyProfile?.displayName ?? detailedComment.commenter?.id
  const createdAt = (() => {
    const date = new Date(detailedComment?.updatedAt)
    return `${date.toLocaleDateString()} - ${date.getHours()}:${date.getMinutes()}`
  })()

  const onDelete = async () => {
    await deleteComment()
  }

  const onUpdate = async (content: string) => {
    const input = { reviewId, commentId: detailedComment.id, comment: content }
    await updateComment({ variables: { input } })
    resetState()
  }

  const onReply = async (content: string) => {
    const input = {
      reviewId, comment: content, parentCommentId: detailedComment.id,
      entityType: detailedComment.entityType, entityId: detailedComment.entityId
    }
    await replyComment({ variables: { input } })
    resetState()
  }

  const resetState = () => {
    setIsEditing(false)
    setIsReplying(false)
  }

  const Stamp =
    ({ at, comment }: TrackTimestampProps) => ConvertToTimestamp({ time: at, comment, trackId: detailedComment.entityId, playlistId })

  const expanded = (isExpanded && children.length > 0) ? "collapse-open" : "collapse-close"
  const childrenBg = (isExpanded) ? 'bg-primary card p-2' : ''
  // TODO: need to consider which comments are owned by user.
  return (
    <div tabIndex={0} className={`collapse group rounded-box ${expanded}`}>
      <div className="collapse-title card card-body w-200 text-base-content py-1 bg-base-200 flex flex-row justify-around px-0">
        <div className="flex flex-col items-center space-y-2 justify-self-start max-w-md">
          <div className="card-title text-base-content text-base truncate"> {commenterName} </div>
          <UserAvatar displayName={commenterName as string} image={avatar as string} />
          <div className="text-secondar-content text-base-content truncate"> {createdAt} </div>
        </div>

        <div className="flex flex-col w-3/4 justify-between" >
          <article className="card card-body min-h-[75%] p-2 min-w-full prose text-base-content bg-base-100">
            <Markdown
              children={comment}
              options={{
                overrides: {
                  Stamp,
                },
              }}
            />
          </article>
        </div>
        <div className="position: absolute; top: 0; right: 0; width: 100px;text-primary">
          <div className="flex-grow-1 btn-group btn-group-vertical mx-auto">
            <button className="btn btn-sm btn-success" onClick={onClick}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            {/* For now we don't want to permit infinite nesting */}
            <button className={`btn btn-sm  ${loadingReply ?? 'loading'}`} disabled={isChild || loadingReply} onClick={() => setIsReplying(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>
            {isEditable ? (
              <>
                <button className={`btn btn-sm btn-error ${loadingDelete ?? 'loading'}`} disabled={loadingDelete} onClick={onDelete}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button className={`btn btn-sm btn-primary ${loadingUpdate ?? 'loading'}`} disabled={loadingUpdate} onClick={() => setIsEditing(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </button>
              </>)
              : null
            }
            {(children.length > 0) ?
              (
                <button className='btn btn-sm btn-info' onClick={() => setIsExpanded(!isExpanded)}>
                  {
                    isExpanded ?
                      <ArrowUp /> :
                      <ArrowDown />
                  }
                </button>
              ) :
              null
            }
          </div>
        </div >
      </div>
      {
        (children.length > 0) ?
          (<div tabIndex={0} className={`collapse-content ${childrenBg} space-y-0.5 px-1`}>
            {
              children.map(child =>
                <DetailedComment playlistId={playlistId} reviewId={reviewId} comment={child} children={[]} onClick={onClick} />
              )
            }
          </div>
          ) : null
      }

      <CommentFormModal
        title={"edit comment"}
        open={isEditing}
        onSubmit={onUpdate}
        onCancel={resetState}
        initialValue={comment}
      />
      <CommentFormModal
        title={"reply to comment"}
        open={isReplying}
        onSubmit={onReply}
        onCancel={resetState}
      />
    </div >
  )
}

const ArrowUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
)

const ArrowDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
)