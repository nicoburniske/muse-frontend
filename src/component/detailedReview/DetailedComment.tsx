import { DetailedCommentFragment, EntityType, useCreateCommentMutation, useDeleteCommentMutation, useStartPlaybackMutation, useUpdateCommentMutation } from "graphql/generated/schema"
import { useMemo, useState } from "react"
import { toast } from "react-toastify"
import Markdown from "markdown-to-jsx"
import { CommentFormModal } from "./commentForm/CommentFormModal"
import { currentUserIdAtom } from "state/Atoms"
import { useAtomValue } from "jotai"
import UserAvatar, { TooltipPos } from "component/UserAvatar"
import { ArrowDownIcon, ArrowUpIcon, CrossIcon, EditIcon, ReplyIcon, Search } from "component/Icons"

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
        <div className="flex flex-col items-center space-y-2 justify-self-start max-w-md py-1">
          <UserAvatar displayName={commenterName as string} image={avatar as string} tooltipPos={TooltipPos.Down}/>
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
              <Search />
            </button>
            {/* For now we don't want to permit infinite nesting */}
            <button className={`btn btn-sm  ${loadingReply ?? 'loading'}`} disabled={isChild || loadingReply} onClick={() => setIsReplying(true)}>
              <ReplyIcon />
            </button>
            {isEditable ? (
              <>
                <button className={`btn btn-sm btn-error ${loadingDelete ?? 'loading'}`} disabled={loadingDelete} onClick={onDelete}>
                  <CrossIcon />
                </button>
                <button className={`btn btn-sm btn-primary ${loadingUpdate ?? 'loading'}`} disabled={loadingUpdate} onClick={() => setIsEditing(true)}>
                  <EditIcon />
                </button>
              </>)
              : null
            }
            {(children.length > 0) ?
              (
                <button className='btn btn-sm btn-info' onClick={() => setIsExpanded(!isExpanded)}>
                  {
                    isExpanded ?
                      <ArrowUpIcon /> :
                      <ArrowDownIcon />
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
                <DetailedComment key={child.id} playlistId={playlistId} reviewId={reviewId} comment={child} children={[]} onClick={onClick} />
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
