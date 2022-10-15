import { DetailedPlaylistTrackFragment, EntityType, useCreateCommentMutation, useStartPlaybackMutation, useAvailableDevicesSubscription, AvailableDevicesSubscription, PlaybackDeviceFragment } from "graphql/generated/schema"
import { useState } from "react"
import { CommentFormModal } from "component/detailedReview/CommentForm"
import { toast } from "react-toastify"
import { ApolloError } from "@apollo/client"
import { useAtomValue } from "jotai"
import { currentlyPlayingTrack, playbackDevices, selectedTrack } from "state/Atoms"
export interface PlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    playlistId: string
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ playlistTrack: { addedAt, addedBy, track }, reviewId, playlistId }: PlaylistTrackProps) {
    // We want to know what devices are available so we can start playback on the correct device.
    const devices = useAtomValue(playbackDevices)

    // Comment modal.
    const [showCommentModal, setShowCommentModal] = useState(false)

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(", ")
    // Sorted biggest to smallest.
    const albumImage = track.album?.images?.at(-2)
    const avatarImage = addedBy?.spotifyProfile?.images?.at(-1)

    // Get outline.
    const isSelected = useAtomValue(selectedTrack) == track.id
    const isPlaying = useAtomValue(currentlyPlayingTrack) == track.id
    const finalStyle = isPlaying?  { border: '1px dashed green' } : isSelected ? { border: '1px solid yellow' } : {}

    const resetState = () => setShowCommentModal(false)

    // On successful comment creation, clear the comment box and refetch the review.
    const [createComment, { error, loading, called }] = useCreateCommentMutation({ onCompleted: resetState })
    const onSubmit = (comment: string) =>
        createComment({ variables: { input: { comment, entityId: track.id, entityType: EntityType.Track, reviewId } } })
            .then(() => { })


    const [playTrack] = useStartPlaybackMutation({ 
        onError: () => toast.error(`Failed to start playback. Please start a playback session and try again.`), 
        onCompleted: () => toast.success(`Successfully started playback`)});

    const onPlayTrack = () => {
        // We only want to include device when one is not active.
        const device = devices?.some(d => d.isActive) ? null : devices?.at(0)?.id
        const inner = { entityId: track.id, entityType: EntityType.Track }
        const outer = { entityId: playlistId, entityType: EntityType.Playlist }
        playTrack({ variables: { input: { entityOffset: { outer, inner }, deviceId: device } } })
    }

    return (
        <div
            style={finalStyle}
            className="card card-body flex flex-row items-center justify-around p-1 bg-neutral shadow-xl"
        >
            <div className="avatar" onClick={() => onPlayTrack()}>
                <div className="w-16 rounded">
                    <img src={albumImage} />
                </div>
            </div>

            <div className="flex flex-row w-3/6 justify-evenly	">
                <div className="flex flex-col grow">
                    <div className="p-0.5"> {track.name} </div>
                    <div className="p-0.5 font-light"> {artistNames} </div>
                </div>
                <div className="p-1"> {new Date(addedAt).toLocaleDateString()} </div>
            </div>

            <div className="avatar" onClick={() => onPlayTrack()}>
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={avatarImage} />
                </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCommentModal(true)}> + </button>
            <CommentFormModal
                open={showCommentModal}
                onClose={() => setShowCommentModal(false)}
                title="Create Comment"
                onCancel={resetState}
                onSubmit={onSubmit}
            />
        </div >
    )
}
