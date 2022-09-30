import { DetailedCommentFragment, DetailedPlaylistFragment, DetailedPlaylistTrackFragment, DetailedTrackFragment, EntityType, useCreateCommentMutation, useDeleteCommentMutation, useDetailedReviewCommentsQuery, useDetailedReviewQuery, useUpdateCommentMutation } from 'graphql/generated/schema'
import { useParams, useLocation } from "react-router-dom"
import { Alert, Avatar, Box, Button, CardMedia, List, ListItem, ListItemButton, ListItemText, Stack, TextField, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from 'react'
// import { FixedSizeList as List, ListChildComponentProps } from 'react-window'

interface DetailedReviewProps {
  reviewId: string
}

export default function DetailedReviewPage() {
  const { reviewId } = useParams()

  if (reviewId) {
    return <DetailedReview reviewId={reviewId} />
  } else {
    return (
      <Alert severity="error"> Missing Review ID </Alert >
    )
  }
}

function DetailedReview({ reviewId }: DetailedReviewProps) {
  const { data, loading, error, refetch } = useDetailedReviewQuery({
    variables: { reviewId },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first"
  })
  // TODO: consider some streaming here? 
  const { data: dataComments, loading: loadingComments, error: errorComments, refetch: refetchComments } = useDetailedReviewCommentsQuery({
    variables: { reviewId },
    fetchPolicy: "no-cache",
    nextFetchPolicy: "no-cache"
  })

  const comments = dataComments?.review?.comments ?? []

  const updateComments = async () => {
    await refetchComments()
    console.log("Refreshed Comments")
  }

  if (loading) {
    return <h1>Loading...</h1>
  } else if (data) {
    // TODO: include header that's common between Detailed components
    const review = data.review
    const entity = data.review?.entity
    const usersShared = data.review?.collaborators?.map(u => u.user.id)

    switch (entity?.__typename) {
      // case "Album":
      // case "Artist":
      // case "Track":
      case "Playlist":
        return <DetailedPlaylist
          reviewId={review.id}
          playlist={entity}
          comments={comments}
          updateComments={updateComments}
        />
      default:
        return <Alert severity="warning"> Not implemented yet </Alert >
    }
  } if (error) {
    return <Alert severity="error"> Review Doesn't Exist </Alert >
  }
}

// TODO: Figure out how to generate type definitions with pretty printing. 
interface DetailedPlaylistProps {
  reviewId: string
  playlist: DetailedPlaylistFragment
  comments: DetailedCommentFragment[]
  updateComments: () => Promise<void>
}

// TODO: Tracks and Comments side by side. Clicking a comment will focus the entity that the comment is applied to.
// Consider two virutalized lists? 
// when clicking a comment, scroll to comment and allow nesting expansion.
function DetailedPlaylist({ reviewId, playlist, comments: propComments, updateComments }: DetailedPlaylistProps) {
  const tracks = playlist.tracks ?? []
  const comments = useMemo(() => propComments, [propComments])

  return (
    <Stack spacing={2} direction="row">
      <List sx={{ bgcolor: 'background.paper' }}>
        {
          tracks.map((t: DetailedPlaylistTrackFragment) =>
            <ListItem key={t.track.id}>
              <PlaylistTrack reviewId={reviewId} playlistTrack={t} updateComments={updateComments} />
            </ListItem>
          )
        }
      </List>
      <List>
        {
          comments.map((c: DetailedCommentFragment) =>
            <DetailedComment
              key={c.id}
              reviewId={reviewId}
              comment={c}
              updateComments={updateComments} />
          )
        }
      </List>
    </Stack>
  )
}

interface DetailedCommentProps {
  reviewId: string
  comment: DetailedCommentFragment
  updateComments: () => Promise<void>
}

function DetailedComment({ reviewId, comment: detailedComment, updateComments }: DetailedCommentProps) {
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

interface CommentFormProps {
  initialValue?: string
  onSubmit: (comment: string) => Promise<void>
  onCancel: () => void
}

// TODO: integrate markdown here!
function CommentForm({ onSubmit, onCancel, initialValue = "" }: CommentFormProps) {
  const [comment, setComment] = useState(initialValue)
  const isTextareaDisabled = comment.length === 0

  const submitAndReset = (event) => {
    event.preventDefault()
    onSubmit(comment)
    setComment("")
  }

  const cancel = (event) => {
    event.preventDefault()
    onCancel()
    setComment(initialValue)
  }

  return (
    <Box>
      <TextField
        sx={{ p: "20px 0" }}
        multiline
        fullWidth
        minRows={8}
        id="outlined-multilined"
        placeholder="create a comment"
        value={comment}
        onChange={(e) => setComment(e.target.value as string)}
      />
      <Button
        sx={{
          float: "right",
          bgcolor: "custom.moderateBlue",
          color: "neutral.white",
          p: "8px 25px",
          "&:hover": {
            bgcolor: "custom.lightGrayishBlue",
          },
        }}
        onClick={submitAndReset}
      >
        {initialValue.length === 0 ? "create" : "update"}
      </Button>

      <Button
        sx={{
          float: "right",
          bgcolor: "custom.moderateBlue",
          color: "neutral.white",
          p: "8px 25px",
          "&:hover": {
            bgcolor: "custom.lightGrayishBlue",
          },
        }}
        onClick={cancel}
      >
        cancel
      </Button>


    </Box >
  )


}

function groupCommentsWithTracks(comments: DetailedCommentFragment[], tracks: DetailedPlaylistTrackFragment[]): [DetailedPlaylistFragment, DetailedCommentFragment[]][] {
  return []
}

interface PlaylistTrackProps {
  playlistTrack: DetailedPlaylistTrackFragment
  reviewId: string
  updateComments: () => Promise<void>
}

// TODO: Consider making image optional for conciseness.
function PlaylistTrack({ playlistTrack: { addedAt, addedBy, track }, reviewId, updateComments }: PlaylistTrackProps) {
  const [showCommentButton, setShowCommentButton] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState("")

  const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(", ")
  // Sorted biggest to smallest.
  const image = track.album?.images?.at(-2)

  const resetStateAndUpdateComments = () => {
    setComment("")
    setShowCommentButton(false)
    setShowComment(false)
    updateComments()
  }

  // On successful comment creation, clear the comment box and refetch the review.
  const input = { comment, entityId: track.id, entityType: EntityType.Track, reviewId }
  const [createComment, { data, error, loading, called }] = useCreateCommentMutation({ variables: { input }, onCompleted: resetStateAndUpdateComments })


  useKeyPress({
    targetKey: 'Enter', onKeyPress: async () => {
      console.log("Something!!", loading, comment)
      if ((comment.length > 0) && !loading) {
        console.log("in dis bit")
        await createComment()
      }
    }
  })

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 2, md: 4 }}
      gridRow={5}
      onMouseEnter={() => setShowCommentButton(true)}
      onMouseLeave={() => setShowCommentButton(false)}
    >
      <CardMedia component="img" image={image} sx={{ width: 1 / 8, height: 1 / 8 }} />
      <ListItemText primary={track.name} secondary={artistNames} />
      {
        (showCommentButton && !showComment) &&
        <Button variant="contained" onClick={() => setShowComment(true)}> + </Button>
      }
      {showComment &&
        <Stack direction="row" >
          <TextField label="comment" value={comment} onChange={e => setComment(e.target.value as string)} />
          <Button
            disabled={!comment && !loading}
            onClick={() => createComment()}
          > create </Button>
        </Stack>
      }
    </Stack>
  )
}

interface UseKeyPressProps {
  targetKey: String
  onKeyPress: () => void
}

// Hook
function useKeyPress({ targetKey, onKeyPress }: UseKeyPressProps) {
  // State for keeping track of whether key is pressed.
  const [keyPressed, setKeyPressed] = useState(false);
  // If pressed key is our target key then set to true
  function downHandler({ key }: KeyboardEvent) {
    if (key === targetKey) {
      onKeyPress();
      setKeyPressed(true);
    }
  }
  // If released key is our target key then set to false.
  const upHandler = ({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };
  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount.
  return keyPressed;
}