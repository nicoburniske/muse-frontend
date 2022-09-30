import { DetailedCommentFragment, DetailedPlaylistFragment, DetailedPlaylistTrackFragment, DetailedTrackFragment, EntityType, useCreateCommentMutation, useDeleteCommentMutation, useDetailedReviewCommentsLazyQuery, useDetailedReviewQuery } from 'graphql/generated/schema'
import { useParams, useLocation } from "react-router-dom"
import { Alert, Box, Button, CardMedia, List, ListItem, ListItemButton, ListItemText, Stack, TextField } from "@mui/material"
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

function DetailedReview({ reviewId}: DetailedReviewProps) {
  const { data, loading, error, refetch } = useDetailedReviewQuery({
    variables: { reviewId },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first"
  })
  const [callFirstTime, { data: dataComments, loading: loadingComments, error: errorComments, called, refetch: refetchComments }] =
    useDetailedReviewCommentsLazyQuery({ variables: { reviewId } })

  // If comments have been refreshed explicity, use those, otherwise use the ones from the review.
  const comments = useMemo(() => {
    const commentsDirect = dataComments?.review?.comments
    const commentsReview = data?.review?.comments
    return commentsDirect ?? commentsReview ?? []
  }, [dataComments, data, called])

  const updateComments = async () => {
    await refetchComments()
    console.log("Refreshed Comments")
  }

  if (loading) {
    return <h1>Loading...</h1>
  } else if (data) {
    // TODO: include header that's common between Detailed components
    // TODO: Create Comment Button? 
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
  console.log("DETAILED COMMENT", comments.length)

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

function DetailedComment({ reviewId, comment, updateComments }: DetailedCommentProps) {
  const [deleteComment, { data, error, loading }] = useDeleteCommentMutation({ variables: { input: { reviewId, commentId: comment.id } } })

  const onDelete = async () => {
    console.log("Deleting comment", typeof updateComments)
    await deleteComment()
    await updateComments()
  }

  return (
    <Stack direction="row" >
      <ListItemText
        key={comment.id}
        primary={comment.comment}
        secondary={comment.commenter?.spotifyProfile?.displayName ?? comment.commenter?.id} />
      <Button
        disabled={loading}
        onClick={() => onDelete()}
      > delete </Button>
    </Stack>
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
  const enterPress = useKeyPress({ targetKey: "Enter" })


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
  const [createComment, { data, error, loading, called }] = useCreateCommentMutation({ variables: { input }, onCompleted: resetStateAndUpdateComments})

  useEffect(() => {
    if (enterPress && !loading) {
      console.log("ENTER PRESSED")
      createComment()
    }
  }, [enterPress])


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
          <TextField label="comment" onChange={e => setComment(e.target.value as string)} />
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
}
// Hook
function useKeyPress({ targetKey }: UseKeyPressProps) {
  // State for keeping track of whether key is pressed.
  const [keyPressed, setKeyPressed] = useState(false);
  // If pressed key is our target key then set to true
  function downHandler({ key }: KeyboardEvent) {
    if (key === targetKey) {
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