import { DetailedPlaylistTrackFragment, EntityType, useCreateCommentMutation, useStartPlaybackMutation } from "graphql/generated/schema"
import { toast } from "react-toastify"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { currentlyPlayingTrackAtom, openCommentModalAtom, playbackDevicesAtom, selectedTrackAtom } from "state/Atoms"
import { RefObject, useMemo, useRef } from "react"
import UserAvatar, { TooltipPos } from "component/UserAvatar"
import useDoubleClick from "hook/useDoubleClick"
export interface PlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    playlistId: string
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ playlistTrack: { addedAt, addedBy, track }, reviewId, playlistId }: PlaylistTrackProps) {
    // We want to know what devices are available so we can start playback on the correct device.
    const devices = useAtomValue(playbackDevicesAtom)
    const setCommentModal = useSetAtom(openCommentModalAtom)

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(", ")
    // Sorted biggest to smallest.
    const albumImage = track.album?.images?.at(-2)
    const avatarImage = addedBy?.spotifyProfile?.images?.at(-1)
    const displayName = addedBy?.spotifyProfile?.displayName ?? addedBy?.id

    // Get track styles.
    const isSelected = useAtomValue(selectedTrackAtom) == track.id
    const [currentlyPlaying, setPlaying] = useAtom(currentlyPlayingTrackAtom)
    const isPlaying = useMemo(() => track.id == currentlyPlaying, [track.id, currentlyPlaying])
    const [bgStyle, textStyle, hoverStyle] =
        isPlaying ? ["bg-success", "text-success-content", ''] :
            isSelected ? ["bg-info", "text-info-content", ''] :
                ["bg-neutral/30", "text-neutral-content", `hover:bg-neutral-focus`]

    const resetState = () => setCommentModal(undefined)

    // On successful comment creation, clear the comment box 
    const [createComment,] = useCreateCommentMutation({ onCompleted: resetState })
    const onSubmit = (comment: string) =>
        createComment({ variables: { input: { comment, entityId: track.id, entityType: EntityType.Track, reviewId } } })
            .then(() => { })


    const [playTrack, { loading }] = useStartPlaybackMutation({
        onError: () => toast.error(`Failed to start playback. Please start a playback session and try again.`),
        onCompleted: () => {
            setPlaying(track.id)
        }
    });

    const onPlayTrack = () => {
        if (!loading) {
            // We only want to include device when one is not active.
            const device = devices?.some(d => d.isActive) ? null : devices?.at(0)?.id
            const inner = { entityId: track.id, entityType: EntityType.Track }
            const outer = { entityId: playlistId, entityType: EntityType.Playlist }
            playTrack({ variables: { input: { entityOffset: { outer, inner }, deviceId: device } } })
        }
    }

    const showModal = () => {
        const values = { title: "create comment", onCancel: resetState, onSubmit }
        setCommentModal(values)
    }

    // Play on div double click.
    const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>;
    useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: onPlayTrack })
    return (
        <div
            ref={playOnDoubleClickRef}
            className={`card card-body grid grid-cols-4 md:grid-cols-5 items-center p-0.5 m-0 ${bgStyle} ${hoverStyle}`} >

            <div className="avatar" onClick={showModal}>
                <div className="w-8 md:w-16 rounded">
                    <img loading='lazy' src={albumImage} />
                </div>
            </div>

            <div className={`col-span-2 flex flex-col grow ${textStyle}`}>
                <div className="select-none	truncate text-sm lg:text-base p-0.5"> {track.name} </div>
                <div className="select-none	truncate text-xs lg:text-sm p-0.5 font-light"> {artistNames ?? ""} </div>
            </div>

            <div className="hidden md:grid place-items-center select-none	text-sm text-neutral-content lg:text-base">
                <p> {new Date(addedAt).toLocaleDateString()} </p>
            </div>
            {/* <div className={`flex flex-row w-3/6 justify-evenly }> */}
            {/* TODO: This needs to get centered vertically */}
            <div className="grid place-items-center">
                <UserAvatar className="grid place-items-center" displayName={displayName} image={avatarImage as string} tooltipPos={TooltipPos.Left} />
            </div>
        </div >
    )
}
