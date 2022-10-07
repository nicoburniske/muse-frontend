import { Avatar, Box, Button, ListItemText, Modal, Stack, Typography } from "@mui/material"
import { DetailedCommentFragment, EntityType, useCreateCommentMutation, useDeleteCommentMutation, useStartPlaybackMutation, useUpdateCommentMutation } from "graphql/generated/schema"
import { useState } from "react"
import { CommentForm } from "component/detailedReview/CommentForm"
import { toast } from "react-toastify"
import { ApolloError } from "@apollo/client"
import Markdown from "markdown-to-jsx"

export interface DetailedCommentProps {
  reviewId: string
  playlistId: string
  comment: DetailedCommentFragment
  children: DetailedCommentFragment[]
  updateComments: () => Promise<void>
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
    <Typography
      onClick={onClick}
      fontWeight="bold"
      sx={{ color: "neutral.darkBlue" }}
    >
      {timestamp ? `@${time}` : time}
    </Typography>)
}

export default function DetailedComment({ reviewId, playlistId, comment: detailedComment, children, updateComments, onClick }: DetailedCommentProps) {
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
    await updateComments()
  }

  const onUpdate = async (content: string) => {
    const input = { reviewId, commentId: detailedComment.id, comment: content }
    await updateComment({ variables: { input } })
    await updateComments()
    resetState()
  }

  const onReply = async (content: string) => {
    const input = {
      reviewId, comment: content, parentCommentId: detailedComment.id,
      entityType: detailedComment.entityType, entityId: detailedComment.entityId
    }
    await replyComment({ variables: { input } })
    await updateComments()
    resetState()
  }

  const resetState = () => {
    setIsEditing(false)
    setIsReplying(false)
  }

  const commentStyle = {
    width: "100%",
    padding: "0.5rem",
    // If child comment, indent.
    marginLeft: isChild ? "1rem" : "0"
  }

  const Stamp =
    ({ at }: TrackTimestampProps) => ConvertToTimestamp({ time: at, trackId: detailedComment.entityId, playlistId })
  // <p>If a dog chews shoes whose shoes does he choose?</p>
  // <div className="card-actions justify-end">
  //   <button className="btn">Buy Now</button>
  // </div>

  // TODO: need to consider which comments are owned by user.
  return (
    // <div className="collapse">
    // <input type="checkbox" className="peer" />
    // <div className="collapse-title bg-primary text-primary-content peer-checked:text-secondary-content"> 
    <div className="card w-200  bg-primary text-primary-content" onClick={onClick}>
      <div className="card-body">

        <h2 className="card-title"> {commenterName}</h2>
        <div className="avatar">
          <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img loading="lazy" src={avatar}></img>
          </div>
        </div>

        <h2 className=""> {createdAt}</h2>

        <Stack
          spacing={5}
          direction="row"
          alignItems="center"
        >
          <Stack direction="row" >
            <Modal
              open={isEditing}
              onClose={() => setIsEditing(false)}>
              <div>
                <CommentForm
                  onSubmit={onUpdate}
                  onCancel={resetState}
                  initialValue={comment}
                />
              </div>
            </Modal>
            <Modal
              open={isReplying}
              onClose={() => setIsReplying(false)}>
              <div>
                <CommentForm
                  onSubmit={onReply}
                  onCancel={resetState}
                  initialValue={""}
                />
              </div>
            </Modal>
            <Stack
              spacing={2}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* <ListItemText primary={comment} /> */}
              <Typography>
                <Markdown
                  children={comment}
                  options={{
                    overrides: {
                      Stamp,
                    },
                  }}
                />
              </Typography>
              <Button disabled={loadingUpdate} onClick={() => setIsEditing(true)}> update </Button>
              <Button disabled={loadingDelete} onClick={onDelete}> delete </Button>
              {/* For now we don't want to permit infinite nesting */}
              {isChild ? <div /> : <Button disabled={loadingReply} onClick={() => setIsReplying(true)}> reply </Button>}
            </Stack>
          </Stack>
        </Stack>
        {children.map(child =>
          <div className="">
            <DetailedComment key={child.id} playlistId={playlistId} reviewId={reviewId} comment={child} children={[]} updateComments={updateComments} onClick={onClick} />
          </div>
        )}

      </div>
    </div>
  )
}