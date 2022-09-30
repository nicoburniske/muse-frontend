import { Avatar, Box, Button, ListItemText, Stack, Typography } from "@mui/material"
import { DetailedCommentFragment, useDeleteCommentMutation, useUpdateCommentMutation } from "graphql/generated/schema"
import { useState } from "react"
import { CommentForm } from "component/detailedReview/CommentForm"

export interface DetailedCommentProps {
  reviewId: string
  comment: DetailedCommentFragment
  updateComments: () => Promise<void>
}

export default function DetailedComment({ reviewId, comment: detailedComment, updateComments }: DetailedCommentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteComment, { data: dataDelete, error: errorError, loading: loadingDelete }] = useDeleteCommentMutation({ variables: { input: { reviewId, commentId: detailedComment.id } } })
  const [updateComment, { data: dataUpdate, error: errorUpdate, loading: loadingUpdate }] = useUpdateCommentMutation()

  const onDelete = async () => {
    await deleteComment()
    await updateComments()
  }
  const avatar = detailedComment?.commenter?.spotifyProfile?.images?.at(-1)
  const comment = detailedComment?.comment ?? "Failed to retrieve comment";
  const commenterName = detailedComment.commenter?.spotifyProfile?.displayName ?? detailedComment.commenter?.id
  const createdAt = new Date(detailedComment?.createdAt).toLocaleDateString()

  const onUpdate = async (content: string) => {
    const input = { reviewId, commentId: detailedComment.id, comment: content }
    await updateComment({ variables: { input } })
    await updateComments()
    setIsEditing(false)
  }

  // TODO: need to consider which comments are owned by user.
  return (
    <Box sx={{ width: "100%" }}>
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
          {isEditing ?
            <CommentForm initialValue={comment} onSubmit={onUpdate} onCancel={() => setIsEditing(false)} />
            :
            <Stack
              spacing={2}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <ListItemText primary={comment} />
              <Button disabled={loadingUpdate} onClick={() => setIsEditing(true)}> update </Button>
              <Button disabled={loadingDelete} onClick={() => onDelete()}> delete </Button>
            </Stack>
          }
        </Stack>
      </Stack>
    </Box>
  )
}