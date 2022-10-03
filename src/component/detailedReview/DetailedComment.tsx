import { Avatar, Box, Button, ListItemText, Modal, Stack, Typography } from "@mui/material"
import { DetailedCommentFragment, useCreateCommentMutation, useDeleteCommentMutation, useUpdateCommentMutation } from "graphql/generated/schema"
import { useState } from "react"
import { CommentForm } from "component/detailedReview/CommentForm"

export interface DetailedCommentProps {
  reviewId: string
  comment: DetailedCommentFragment
  children: DetailedCommentFragment[]
  updateComments: () => Promise<void>
  onClick: () => void
}

export default function DetailedComment({ reviewId, comment: detailedComment, children, updateComments, onClick}: DetailedCommentProps) {
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

  const finalStyle = {
    width: "100%",
    padding: "0.5rem",
    marginLeft: isChild ? "1rem" : "0"
  }

  // TODO: need to consider which comments are owned by user.
  return (
    <Box sx={finalStyle} onClick={onClick}>
      <Stack
        spacing={5}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack spacing={2} direction="row" alignItems="center">
          <Avatar src={avatar}></Avatar>
          <Typography
            fontWeight="bold"
            sx={{ color: "neutral.darkBlue" }}
          >
            {commenterName}
          </Typography>
          <Typography sx={{ color: "neutral.grayishBlue" }}>
            {createdAt}
          </Typography>
        </Stack>
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
            <ListItemText primary={comment} />
            <Button disabled={loadingUpdate} onClick={() => setIsEditing(true)}> update </Button>
            <Button disabled={loadingDelete} onClick={onDelete}> delete </Button>
            {/* For now we don't want to permit infinite nesting */}
            {isChild ? <div /> : <Button disabled={loadingReply} onClick={() => setIsReplying(true)}> reply </Button>}
          </Stack>
        </Stack>
      </Stack>
      {children.map(child =>
        <DetailedComment key={child.id} reviewId={reviewId} comment={child} children={[]} updateComments={updateComments} onClick={onClick} />)}
    </Box>
  )
}