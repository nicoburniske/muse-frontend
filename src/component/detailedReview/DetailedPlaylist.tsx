import { List, ListItem, Stack } from "@mui/material"
import { DetailedCommentFragment, DetailedPlaylistFragment, DetailedPlaylistTrackFragment } from "graphql/generated/schema"
import PlaylistTrack from "component/detailedReview/PlaylistTrack"
import DetailedComment from "component/detailedReview/DetailedComment"
import { useMemo } from "react"

// TODO: Figure out how to generate type definitions with pretty printing. 
export interface DetailedPlaylistProps {
    reviewId: string
    playlist: DetailedPlaylistFragment
    comments: DetailedCommentFragment[]
    updateComments: () => Promise<void>
}

// TODO: Tracks and Comments side by side. Clicking a comment will focus the entity that the comment is applied to.
// Consider two virutalized lists? 
// when clicking a comment, scroll to comment and allow nesting expansion.
export default function DetailedPlaylist({ reviewId, playlist, comments: propComments, updateComments }: DetailedPlaylistProps) {
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
