import { Avatar, Box, Button, CardMedia, Modal, Stack, Typography } from "@mui/material"
import { DetailedPlaylistTrackFragment, EntityType, useCreateCommentMutation, useStartPlaybackMutation, useAvailableDevicesSubscription } from "graphql/generated/schema"
import { useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { CommentForm } from "component/detailedReview/CommentForm"
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
export default function PlaylistTrack({ playlistTrack: { addedAt, addedBy, track }, reviewId, playlistId}: PlaylistTrackProps) {
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
        <div
            style={selectedStyle}
            className="card card-body flex flex-row items-center justify-around p-1 bg-base-100 shadow-xl"
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

            <Modal2
                open={showCommentModal}
                onClose={() => setShowComment(false)}>
                <CommentForm onSubmit={onSubmit} onCancel={resetState} />
            </Modal2>

        </div >
    )
}

// components/Modal.js
import { createPortal } from 'react-dom'
interface ModalProps {
    open: boolean
    onClose: () => void
    onSubmit?: () => void
    children: JSX.Element
}
export function Modal2({ open, onClose, children }: ModalProps) {
    function escHandler({ key }) {
        if (key === 'Escape') {
            onClose()
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', escHandler);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('keydown', escHandler);
            }
        };
    }, []);


    if (typeof document !== 'undefined') {
        return createPortal((
            <div className={`fixed inset-0 ${open ? '' : 'pointer-events-none'}`}>
                {/* backdrop */}
                <div
                    className={`fixed inset-0 bg-black ${open ? 'opacity-50' : 'pointer-events-none opacity-0'} transition-opacity duration-300 ease-in-out`}
                    onClick={onClose}
                />

                {/* content */}
                <div className={`fixed right-0 h-full bg-white shadow-lg w-full max-w-screen-sm p-4 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'} transition-opacity duration-300 ease-in-out`}>
                    <div>
                        <button onClick={onClose}>Click to close modal</button>
                    </div>
                    {children}
                </div>
            </div>
        ), document.body)
    } else {
        return null
    }
}
