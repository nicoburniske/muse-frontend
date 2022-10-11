import { DetailedPlaylistTrackFragment, EntityType, useCreateCommentMutation, useStartPlaybackMutation, useAvailableDevicesSubscription, AvailableDevicesSubscription, PlaybackDeviceFragment } from "graphql/generated/schema"
import { useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { CommentFormModal } from "component/detailedReview/CommentForm"
import { toast } from "react-toastify"
import { ApolloError } from "@apollo/client"
import { useAtomValue } from "jotai"
import { selectedTrack } from "state/Atoms"
export interface PlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    playlistId: string
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ playlistTrack: { addedAt, addedBy, track }, reviewId, playlistId }: PlaylistTrackProps) {
    // We want to know what devices are available so we can start playback on the correct device.
    const { data } = useAvailableDevicesSubscription()
    const devices = data?.availableDevices

    // Only want to show comment button on hover.
    const [showCommentButton, setShowCommentButton] = useState(false)
    // Comment modal.
    const [showCommentModal, setShowComment] = useState(false)
    const [comment, setComment] = useState("")

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(", ")
    // Sorted biggest to smallest.
    const albumImage = track.album?.images?.at(-2)
    const avatarImage = addedBy?.spotifyProfile?.images?.at(-1)
    const isSelected = useAtomValue(selectedTrack) == track.id
    const selectedStyle = isSelected ? { border: '1px dashed green' } : {}

    const resetState = () => {
        setComment("")
        setShowComment(false)
    }

    // On successful comment creation, clear the comment box and refetch the review.
    const [createComment, { error, loading, called }] = useCreateCommentMutation({ onCompleted: resetState })
    const onSubmit = (comment: string) =>
        createComment({ variables: { input: { comment, entityId: track.id, entityType: EntityType.Track, reviewId } } })
            .then(() => { })

    const onPlayError = (error: ApolloError) => {
        toast.error(`Failed to start playback. Please start a playback session and try again.`)
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

    return (
        <div
            style={selectedStyle}
            className="card card-body flex flex-row items-center justify-around p-1 bg-neutral shadow-xl"
            onMouseEnter={() => setShowCommentButton(true)}
            onMouseLeave={() => setShowCommentButton(false)}
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
            <button className="btn btn-primary" onClick={() => setShowComment(true)}> + </button>
            <CommentFormModal
                open={showCommentModal}
                onClose={() => setShowComment(false)}
                title="Create Comment"
                onCancel={resetState}
                onSubmit={onSubmit}
            />
        </div >
    )
}
