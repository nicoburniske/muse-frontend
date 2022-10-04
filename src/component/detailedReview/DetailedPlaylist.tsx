import { Box, List, ListItem, Stack } from "@mui/material"
import { DetailedCommentFragment, DetailedPlaylistFragment, DetailedPlaylistTrackFragment } from "graphql/generated/schema"
import PlaylistTrack from "component/detailedReview/PlaylistTrack"
import DetailedComment from "component/detailedReview/DetailedComment"
import { Children, useEffect, useMemo, useRef, useState } from "react"
import { useAtom } from "jotai"
import { selectedTrack } from "state/Atoms"

// TODO: Figure out how to generate type definitions with pretty printing. 
export interface DetailedPlaylistProps {
    reviewId: string
    playlist: DetailedPlaylistFragment
    comments: DetailedCommentFragment[]
    updateComments: () => Promise<void>
}

// TODO: Tracks and Comments side by side. Clicking a comment will focus the entity that the comment is applied to.
// when clicking a comment, scroll to comment and allow nesting expansion.
export default function DetailedPlaylist({ reviewId, playlist, comments: propComments, updateComments }: DetailedPlaylistProps) {
    const comments = useMemo(() => propComments, [propComments])
    const rootComments = useMemo(() => comments.filter(comment => comment.parentCommentId === null), [comments])
    const childComments = useMemo(() => {
        const commentMap: Map<number, DetailedCommentFragment[]> = new Map()
        comments.filter(comment => comment.parentCommentId !== null).forEach(comment => {
            const parentCommentId = comment.parentCommentId!
            const childComments = commentMap.get(parentCommentId) ?? []
            childComments.push(comment)
            commentMap.set(parentCommentId, childComments)
        })
        return commentMap
    }, [comments])

    const [,setSelectedTrack] = useAtom(selectedTrack)
    const commentRefs = useRef<Map<number, HTMLLIElement>>(new Map())
    const trackRefs = useRef<Map<string, HTMLLIElement>>(new Map())

    // We want to find the track that the comment is applied to and scroll to it.
    const onCommentClick = (commentId: number) => {
        const trackId = comments.find(c => c.id == commentId)?.entityId
        const track = trackId ? trackRefs.current.get(trackId) : undefined
        if (track) {
            setSelectedTrack(trackId)
            track.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const tracks = playlist.tracks ?? []

    return (
        <Stack
            spacing={2}
            direction="row"
            justifyContent="space-around"
        >
            <Box width={"30%"}>
                <List style={{ overflow: 'auto', height: '85vh' }}>
                    {tracks.map(t =>
                        <ListItem
                            key={t.track.id}
                            ref={el => trackRefs.current.set(t.track.id, (el as HTMLLIElement))}
                        >
                            <PlaylistTrack playlistId={playlist.id} reviewId={reviewId} playlistTrack={t} updateComments={updateComments} />
                        </ListItem>)
                    }
                </List>
            </Box>
            <Box width={"70%"}>
                <List style={{ overflow: 'auto', height: '85vh', width: '100%' }}>
                    {
                        rootComments.map((c: DetailedCommentFragment) =>
                            <ListItem
                                key={c.id}
                                ref={el => commentRefs.current.set(c.id, (el as HTMLLIElement))}
                            >
                                <DetailedComment
                                    reviewId={reviewId}
                                    comment={c}
                                    updateComments={updateComments}
                                    children={childComments.get(c.id) ?? []}
                                    onClick={() => onCommentClick(c.id)}
                                />
                            </ListItem>
                        )
                    }
                </List>
            </Box>
        </Stack>
    )
}
