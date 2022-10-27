import { DetailedCommentFragment, DetailedPlaylistFragment } from "graphql/generated/schema"
import PlaylistTrackTable from "component/detailedReview/PlaylistTrackTable"
import DetailedComment from "component/detailedReview/DetailedComment"
import { useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { searchLoweredAtom, selectedTrackAtom } from "state/Atoms"
import Split from "react-split"
import { groupBy } from "util/Utils"

// TODO: Figure out how to generate type definitions with pretty printing. 
export interface DetailedPlaylistProps {
    reviewId: string
    playlist: DetailedPlaylistFragment
    comments: DetailedCommentFragment[]
    options?: RenderOptions
}

enum RenderOptions {
    Tracks,
    Comments,
    Both
}

export default function DetailedPlaylist({ reviewId, playlist, comments: propComments, options = RenderOptions.Both }: DetailedPlaylistProps) {
    const search = useAtomValue(searchLoweredAtom)

    const tracks = useMemo(() =>
        playlist.tracks
            ?.filter(track => (track?.track.name?.toLowerCase().includes(search)) ||
                track?.track.artists?.flatMap(a => a.name.toLocaleLowerCase()).some(name => name.includes(search)))
        ?? []
        , [playlist, search])

    const trackIds = useMemo(() => new Set(tracks.map(track => track?.track.id)), [tracks])

    const comments = useMemo(() => {
        return [...propComments]
            .filter(comment => trackIds.has(comment?.entityId))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }, [propComments, trackIds])

    const rootComments = useMemo(() => comments.filter(comment => comment.parentCommentId === null), [comments])
    const childComments = useMemo(() => {
        const childComments = comments
            .filter(comment => comment.parentCommentId !== null)
            .filter(comment => comment.parentCommentId !== undefined)
        return groupBy(childComments, c => c.parentCommentId)
    }, [comments])

    const setSelectedTrack = useSetAtom(selectedTrackAtom)

    // We want to find the track that the comment is applied to and scroll to it.
    const onCommentClick = (commentId: number) => {
        const trackId = comments.find(c => c.id == commentId)?.entityId
        if (trackId) {
            setSelectedTrack('')
            setTimeout(() => setSelectedTrack(trackId), 1);
        }
    }

    const displayTracks = useMemo(() => (
        <div className="flex flex-row">
            <PlaylistTrackTable
                playlistId={playlist.id}
                reviewId={reviewId}
                playlistTracks={tracks}
            />
        </div>
    ), [playlist, reviewId, tracks])

    const displayComments = useMemo(() => (
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
    ), [reviewId, playlist, rootComments, childComments])

    return (
        <div className="h-full px-1">
            {(options == RenderOptions.Both) ?
                <Split
                    className="flex h-full"
                    sizes={[40, 60]}
                    direction="horizontal"
                >
                    {displayTracks}
                    {displayComments}
                </Split>
                :
                <div className="h-full">
                    {
                        (options == RenderOptions.Tracks) ?
                            displayTracks : displayComments
                    }
                </div>
            }
        </div>
    )
}
