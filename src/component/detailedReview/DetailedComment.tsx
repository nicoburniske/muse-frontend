import { DetailedCommentFragment, EntityType, useCreateCommentMutation, useDeleteCommentMutation, useStartPlaybackMutation, useUpdateCommentMutation } from "graphql/generated/schema"
import { useState } from "react"
import { CommentFormModal } from "component/detailedReview/CommentForm"
import { toast } from "react-toastify"
import { ApolloError } from "@apollo/client"
import Markdown from "markdown-to-jsx"

export interface DetailedCommentProps {
  reviewId: string
  playlistId: string
  comment: DetailedCommentFragment
  children: DetailedCommentFragment[]
  onClick: () => void
}

interface TrackTimestampProps {
  at: string
}
interface ConvertToTimestampProps {
  time: string
  trackId: string
  playlistId: string
}

function ConvertToTimestamp({ time, trackId, playlistId }: ConvertToTimestampProps) {
  // Timestamp converted to millis if valid
  const timestamp = (() => {
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
  })()

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
    <span
      className="font-semibold"
      onClick={onClick}
    >
      {timestamp ? `@${time}` : time}
    </span>)
}

export default function DetailedComment({ reviewId, playlistId, comment: detailedComment, children, onClick }: DetailedCommentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)


  const [deleteComment, { data: dataDelete, error: errorError, loading: loadingDelete }] = useDeleteCommentMutation({ variables: { input: { reviewId, commentId: detailedComment.id } } })
  const [updateComment, { data: dataUpdate, error: errorUpdate, loading: loadingUpdate }] = useUpdateCommentMutation()
  const [replyComment, { data: data, loading: loadingReply }] = useCreateCommentMutation()

  const isChild = detailedComment.parentCommentId != null
  const avatar = detailedComment?.commenter?.spotifyProfile?.images?.at(-1)
  const comment = detailedComment?.comment ?? "Failed to retrieve comment";
  const commenterName = detailedComment.commenter?.spotifyProfile?.displayName ?? detailedComment.commenter?.id
  const createdAt = new Date(detailedComment?.createdAt).toLocaleDateString()

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
    ({ at }: TrackTimestampProps) => ConvertToTimestamp({ time: at, trackId: detailedComment.entityId, playlistId })

  // TODO: need to consider which comments are owned by user.
  return (
    <div className="" onClick={onClick}>
      <div className=" card card-body w-200 text-primary-content py-1  bg-neutral flex flex-row justify-around space-y-5">
        <div className="flex flex-col items-center space-y-2 justify-self-start">
          <h2 className="card-title"> {commenterName} </h2>
          <div className="avatar">
            <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img loading="lazy" src={avatar}></img>
            </div>
          </div>
          <h2 className=""> {createdAt}</h2>
        </div>

        <div className="flex flex-col w-3/4">
          <div className="min-h-fit	 p-2 w-5/6">
            <Markdown
              children={comment}
              options={{
                overrides: {
                  Stamp,
                },
              }}
            />
          </div>
          <div className="btn-group">
            <button className="btn btn-sm btn-primary " disabled={loadingUpdate} onClick={() => setIsEditing(true)}> update </button>
            <button className="btn btn-sm btn-error" disabled={loadingDelete} onClick={onDelete}> delete </button>
            {/* For now we don't want to permit infinite nesting */}
            {<button className="btn btn-sm btn-primary" disabled={isChild || loadingReply} onClick={() => setIsReplying(true)}> reply </button>}
          </div>
        </div>
      </div>

      {children.map(child =>
        <div className="pl-5 py-5" key={child.id}>
          <DetailedComment key={child.id} playlistId={playlistId} reviewId={reviewId} comment={child} children={[]} onClick={onClick} />
        </div>
      )}

      <CommentFormModal
        title={"edit comment"}
        open={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={onUpdate}
        onCancel={resetState}
        initialValue={comment}
      />
      <CommentFormModal
        title={"reply to comment"}
        open={isReplying}
        onClose={() => setIsReplying(false)}
        onSubmit={onReply}
        onCancel={resetState}
      />
    </div>
  )
}