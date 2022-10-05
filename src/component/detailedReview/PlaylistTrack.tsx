import { Avatar, Box, Button, CardMedia, Modal, Stack, Typography } from "@mui/material"
import { DetailedPlaylistTrackFragment, EntityType, useCreateCommentMutation, useStartPlaybackMutation, useAvailableDevicesSubscription } from "graphql/generated/schema"
import { useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { CommentForm } from "component/detailedReview/CommentForm"
import { toast } from "react-toastify"
import { ApolloError } from "@apollo/client"
import { useAtom } from "jotai"
import { selectedTrack } from "state/Atoms"

export interface PlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    playlistId: string
    updateComments: () => Promise<void>
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ playlistTrack: { addedAt, addedBy, track }, reviewId, playlistId, updateComments }: PlaylistTrackProps) {
    // We want to know what devices are available so we can start playback on the correct device.
    const { data } = useAvailableDevicesSubscription()
    const devices = data?.availableDevices

    // Only want to show comment button on hover.
    const [showCommentButton, setShowCommentButton] = useState(false)
    // Comment modal.
    const [showComment, setShowComment] = useState(false)
    const [comment, setComment] = useState("")

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(", ")
    // Sorted biggest to smallest.
    const albumImage = track.album?.images?.at(-2)
    const avatarImage = addedBy?.spotifyProfile?.images?.at(-1)
    const [isSelected,] = useAtom(selectedTrack)
    const selectedStyle = (isSelected === track.id) ? { border: '1px dashed green' } : {}

    const resetStateAndUpdateComments = () => {
        setComment("")
        setShowComment(false)
        updateComments()
    }

    // On successful comment creation, clear the comment box and refetch the review.
    const [createComment, { error, loading, called }] = useCreateCommentMutation({ onCompleted: resetStateAndUpdateComments })
    const onSubmit = (comment: string) =>
        createComment({ variables: { input: { comment, entityId: track.id, entityType: EntityType.Track, reviewId } } })
            .then(() => { })

    const onPlayError = (error: ApolloError) => {
        toast.error(`Failed to start playback. Please start a playback session and try again.`)
        // refetchDevices()
    }

    const onPlaySuccess = () => {
        toast.success(`Successfully started playback`)
    }
    const [playTrack] = useStartPlaybackMutation({ onError: onPlayError, onCompleted: onPlaySuccess });

    const onPlayTrack = () => {
        // We only want to include device when one is not active.
        const device = devices?.some(d => d.isActive) ? null : devices?.at(0)?.id
        const inner = { entityId: track.id, entityType: EntityType.Track }
        const outer = { entityId: playlistId, entityType: EntityType.Playlist }
        playTrack({ variables: { input: { entityOffset: { outer, inner }, deviceId: device } } })
    }

    // TODO: fix this it's terrible.
    useHotkeys('enter+command', () => {
        console.log("outside dis bih")
        if ((comment.length > 0) && !loading) {
            console.log("in dis bit")
            createComment()
        }
    }, [comment, loading])

    return (
        <Box
            sx={selectedStyle}
        >
            <Stack
                direction="row"
                spacing={4}
                alignItems="center"
                justifyContent="space-around"
                width="100%"
                onMouseEnter={() => setShowCommentButton(true)}
                onMouseLeave={() => setShowCommentButton(false)}
            >
                <CardMedia
                    component="img"
                    onClick={() => onPlayTrack()}
                    image={albumImage}
                    width={1 / 3}
                    sx={{ width: 1 / 8, height: 1 / 8 }} />
                <Box width={1 / 3}>
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
                <Typography
                    variant="body2"
                    color="text.secondary"
                    display="block"
                >
                    {new Date(addedAt).toLocaleDateString()}
                </Typography>
                <Avatar src={avatarImage}></Avatar>
                <Button disabled={!showCommentButton} variant="contained" size="medium" onClick={() => setShowComment(true)}> + </Button>
                <Modal
                    open={showComment}
                    onClose={() => setShowComment(false)}>
                    <div>
                        <CommentForm onSubmit={onSubmit} onCancel={resetStateAndUpdateComments} />
                    </div>
                </Modal>
            </Stack>
        </Box>
    )
}
