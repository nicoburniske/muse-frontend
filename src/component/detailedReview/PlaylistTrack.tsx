import { Button, CardMedia, ListItemText, Stack, TextField } from "@mui/material"
import { DetailedPlaylistTrackFragment, EntityType, useCreateCommentMutation } from "graphql/generated/schema"
import { useEffect, useState } from "react"

export interface PlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    updateComments: () => Promise<void>
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ playlistTrack: { addedAt, addedBy, track }, reviewId, updateComments }: PlaylistTrackProps) {
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

    // TODO: fix this it's terrible.
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