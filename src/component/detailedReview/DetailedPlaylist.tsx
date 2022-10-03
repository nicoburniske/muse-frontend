import { Box, List, ListItem, Stack } from "@mui/material"
import { DetailedCommentFragment, DetailedPlaylistFragment, DetailedPlaylistTrackFragment } from "graphql/generated/schema"
import PlaylistTrack from "component/detailedReview/PlaylistTrack"
import DetailedComment from "component/detailedReview/DetailedComment"
import { Children, useEffect, useMemo, useRef, useState } from "react"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"

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
    const commentVirtuoso = useRef<VirtuosoHandle>(null);
    const trackVirtuoso = useRef<VirtuosoHandle>(null);

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

    const onCommentClick = (commentId: number) => {
        const trackId = comments.find(c => c.id == commentId)?.entityId
        const trackIndex = tracks.findIndex(t => t.track.id == trackId)
        if (trackIndex) {
            commentVirtuoso?.current?.scrollToIndex({
                index: trackIndex,
            })
        }
    }

    const onTrackClick = (trackId: string) => {
        const commentId = comments.find(c => c.entityId == trackId)?.id
        const commentIndex = comments.findIndex(c => c.id == commentId)
        if (commentIndex) {
            trackVirtuoso?.current?.scrollToIndex({
                index: commentIndex,
            })
        }
    }


    return (
        <Stack
            spacing={2}
            direction="row"
            justifyContent="space-around"
            maxWidth={"90%"}
        >
            <Box width={"40%"}>
                {/* to use non-document scrolling we will need to use material ui compatible list*/}
                <Virtuoso
                    useWindowScroll
                    data={tracks}
                    ref={commentVirtuoso}
                    overscan={40}
                    totalCount={tracks.length}
                    itemContent={(index, t) =>
                        <ListItem key={t.track.id}>
                            <PlaylistTrack reviewId={reviewId} playlistTrack={t} updateComments={updateComments} />
                        </ListItem>
                    }>
                </Virtuoso>
            </Box>
            <Box width={"60%"}>
                <List>
                    {
                        rootComments.map((c: DetailedCommentFragment) =>
                            <DetailedComment
                                key={c.id}
                                reviewId={reviewId}
                                comment={c}
                                updateComments={updateComments}
                                children={childComments.get(c.id) ?? []}
                                onClick={() => onCommentClick(c.id)}
                            />
                        )
                    }
                </List>
            </Box>
        </Stack>
    )
}
