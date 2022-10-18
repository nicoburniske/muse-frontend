import { DetailedCommentFragment, EntityType, useCreateCommentMutation, useDeleteCommentMutation, useStartPlaybackMutation, useUpdateCommentMutation } from "graphql/generated/schema"
import { useMemo, useState } from "react"
import { toast } from "react-toastify"
import { ApolloError } from "@apollo/client"
import Markdown from "markdown-to-jsx"
import { CommentFormModal } from "./commentForm/CommentFormModal"

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

function ConvertToTimestamp({ time, trackId, playlistId, comment}: ConvertToTimestampProps) {
  // Timestamp converted to millis if valid
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

  const handleError = (error: ApolloError) => {
    toast.error(`Failed to start playback. Please start a playback session and try again.`)
  }
  const onSuccess = () => {
    if (timestamp) {
      toast.success(`Successfully started playback at ${time}`)
    } else {
      toast.success("Successfully started playback. Invalid timestamp.")
    }
  }

  const [playTrack] = useStartPlaybackMutation({ onError: handleError, onCompleted: onSuccess });

  const onClick = () => {
    const inner = { entityId: trackId, entityType: EntityType.Track }
    const outer = { entityId: playlistId, entityType: EntityType.Playlist }
    playTrack({ variables: { input: { entityOffset: { outer, inner }, positionMs: timestamp } } })
  }

  return (
    <a
      className="link link-base-content link-hover"
      onClick={onClick}
    >
      {comment ? comment : timestamp ? `@${time}` : time}
    </a>)
}

export default function DetailedComment({ reviewId, playlistId, comment: detailedComment, children, onClick }: DetailedCommentProps) {
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
    const date = new Date(detailedComment?.createdAt)
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
    ({ at, comment}: TrackTimestampProps) => ConvertToTimestamp({ time: at, comment, trackId: detailedComment.entityId, playlistId })

  const expanded = (isExpanded && children.length > 0) ? "collapse-open" : "collapse-close"
  // TODO: need to consider which comments are owned by user.
  return (
    <div tabIndex={0} className={`collapse rounded-box ${expanded}`}>
      <div className="collapse-title card card-body w-200 text-base-content py-1 bg-base-200 flex flex-row justify-around px-0">
        <div className="flex flex-col items-center space-y-2 justify-self-start">
          <div className="card-title text-base-content"> {commenterName} </div>
          <div className="avatar">
            <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img loading="lazy" src={avatar}></img>
            </div>
          </div>
          <div className="text-secondar-content text-base-content"> {createdAt} </div>
        </div>

        <div className="flex flex-col w-3/4 justify-between" >
          <article className="card card-body min-h-[75%] p-2 min-w-full prose text-base-content bg-base-100" onClick={() => { setIsExpanded(!isExpanded) }}>
            <Markdown
              children={comment}
              options={{
                overrides: {
                  Stamp,
                },
              }}
            />
          </article>
          <div className="flex-grow-1 btn-group mx-auto">
            <button className="btn btn-sm btn-primary " disabled={loadingUpdate} onClick={() => setIsEditing(true)}> update </button>
            <button className="btn btn-sm btn-error" disabled={loadingDelete} onClick={onDelete}> delete </button>
            {/* For now we don't want to permit infinite nesting */}
            {<button className="btn btn-sm btn-primary" disabled={isChild || loadingReply} onClick={() => setIsReplying(true)}> reply </button>}
          </div>
        </div>
        <button className="position: absolute; top: 0; right: 0; width: 100px;text-primary" onClick={onClick}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </div>

      {
        children.map(child =>
          <div tabIndex={0} className="collapse-content py-1" key={child.id}>
            <DetailedComment playlistId={playlistId} reviewId={reviewId} comment={child} children={[]} onClick={onClick} />
          </div>
        )
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