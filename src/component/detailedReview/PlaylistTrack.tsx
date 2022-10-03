import { Box, Button, CardMedia, ListItemText, Modal, Stack, TextField, Typography } from "@mui/material"
import { DetailedPlaylistTrackFragment, EntityType, useCreateCommentMutation } from "graphql/generated/schema"
import { useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { CommentForm } from "component/detailedReview/CommentForm"

export interface PlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    updateComments: () => Promise<void>
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ playlistTrack: { addedAt, addedBy, track }, reviewId, updateComments }: PlaylistTrackProps) {
    // Only want to show comment button on hover.
    const [showCommentButton, setShowCommentButton] = useState(false)
    // Comment modal.
    const [showComment, setShowComment] = useState(false)
    const [comment, setComment] = useState("")

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(", ")
    // Sorted biggest to smallest.
    const image = track.album?.images?.at(-2)

    const resetStateAndUpdateComments = () => {
        setComment("")
        setShowComment(false)
        updateComments()
    }

    // On successful comment creation, clear the comment box and refetch the review.
    const [createComment, { data, error, loading, called }] = useCreateCommentMutation({ onCompleted: resetStateAndUpdateComments })
    const onSubmit = (comment: string) =>
        createComment({ variables: { input: { comment, entityId: track.id, entityType: EntityType.Track, reviewId } } })
            .then(() => { })


    // TODO: fix this it's terrible.
    useHotkeys('enter+command', () => {
        console.log("outside dis bih")
        if ((comment.length > 0) && !loading) {
            console.log("in dis bit")
            createComment()
        }
    }, [comment, loading])

    return (
        <Stack
            direction="row"
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            onMouseEnter={() => setShowCommentButton(true)}
            onMouseLeave={() => setShowCommentButton(false)}
        >
            <CardMedia component="img" image={image} width={1/3} sx={{ width: 1 / 8, height: 1 / 8 }} />
            <Box width={1/3}>
                <Typography
                    variant="body2"
                    color="text.primary"
                    display="block"
                >
                    {track.name}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    display="block"
                >
                    {artistNames}
                </Typography>
            </Box>
            <Button variant="contained" size="medium" onClick={() => setShowComment(true)}> + </Button> 
            <Modal
                open={showComment}
                onClose={() => setShowComment(false)}>
                <div>
                    <CommentForm onSubmit={onSubmit} onCancel={resetStateAndUpdateComments} />
                </div>
            </Modal>
        </Stack>
    )
}
