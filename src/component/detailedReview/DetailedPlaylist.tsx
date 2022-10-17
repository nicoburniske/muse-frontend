import { DetailedCommentFragment, DetailedPlaylistFragment } from "graphql/generated/schema"
import PlaylistTrackTable from "component/detailedReview/PlaylistTrackTable"
import DetailedComment from "component/detailedReview/DetailedComment"
import { useMemo, useRef } from "react"
import { useSetAtom } from "jotai"
import { selectedTrackAtom } from "state/Atoms"
import Split from "react-split"

// TODO: Figure out how to generate type definitions with pretty printing. 
export interface DetailedPlaylistProps {
    reviewId: string
    playlist: DetailedPlaylistFragment
    comments: DetailedCommentFragment[]
}

// TODO: Tracks and Comments side by side. Clicking a comment will focus the entity that the comment is applied to.
// when clicking a comment, scroll to comment and allow nesting expansion.
export default function DetailedPlaylist({ reviewId, playlist, comments: propComments }: DetailedPlaylistProps) {
    const comments = useMemo(() => {
        return [...propComments].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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

    const setSelectedTrack = useSetAtom(selectedTrackAtom)

    // We want to find the track that the comment is applied to and scroll to it.
    const onCommentClick = (commentId: number) => {
        const trackId = comments.find(c => c.id == commentId)?.entityId
        if (trackId) {
            setSelectedTrack(trackId)
        }
    }

    const tracks = playlist.tracks ?? []

    return (
        <Split
            className="flex"
            sizes={[40, 60]}
            direction="horizontal"
            minSize={300}
            style={{ height: '79.5vh' }}
        >
            <div className=" flex flex-row">
                <PlaylistTrackTable
                    playlistId={playlist.id}
                    reviewId={reviewId}
                    playlistTracks={tracks}
                />
            </div>
            <div className="overflow-auto p-1">
                <div className="flex flex-col space-y-1 justify-end">
                    {rootComments.map((c: DetailedCommentFragment) =>
                        <div key={c.id}>
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
        </Split>
    )
}
