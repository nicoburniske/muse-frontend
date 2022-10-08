import { Box, List, ListItem, Stack } from "@mui/material"
import { DetailedCommentFragment, DetailedPlaylistFragment, DetailedPlaylistTrackFragment } from "graphql/generated/schema"
import PlaylistTrack from "component/detailedReview/PlaylistTrack"
import DetailedComment from "component/detailedReview/DetailedComment"
import { Children, useEffect, useMemo, useRef, useState } from "react"
import { useSetAtom } from "jotai"
import { selectedTrack } from "state/Atoms"

// TODO: Figure out how to generate type definitions with pretty printing. 
export interface DetailedPlaylistProps {
    reviewId: string
    playlist: DetailedPlaylistFragment
    comments: DetailedCommentFragment[]
}

// TODO: Tracks and Comments side by side. Clicking a comment will focus the entity that the comment is applied to.
// when clicking a comment, scroll to comment and allow nesting expansion.
export default function DetailedPlaylist({ reviewId, playlist, comments: propComments}: DetailedPlaylistProps) {
    const comments = useMemo(() => {
        return propComments.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }, [propComments])


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

    const setSelectedTrack = useSetAtom(selectedTrack)
    const commentRefs = useRef(new Map<number, HTMLLIElement>())
    const trackRefs = useRef(new Map<string, HTMLLIElement>())

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
        <div
            className=" flex flex-row w-full"
            style={{ height: '85vh' }}
        >
            {/*  */}
            <div className="w-2/5 overflow-auto p-1" >
                {tracks.map(t =>
                    <div key={t.track.id} ref={el => trackRefs.current.set(t.track.id, (el as HTMLLIElement))}>
                        <PlaylistTrack
                            playlistId={playlist.id} reviewId={reviewId} playlistTrack={t} />
                    </div>)
                }
            </div>
            <div className="w-3/5 h-full overflow-auto p-1">
                <div className="flex flex-col space-y-5 justify-end">
                    {rootComments.map((c: DetailedCommentFragment) =>
                        <div
                            key={c.id}
                            ref={el => commentRefs.current.set(c.id, (el as HTMLLIElement))}
                        >
                            <DetailedComment
                                reviewId={reviewId}
                                playlistId={playlist.id}
                                comment={c}
                                children={childComments.get(c.id) ?? []}
                                onClick={() => onCommentClick(c.id)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>)
}
