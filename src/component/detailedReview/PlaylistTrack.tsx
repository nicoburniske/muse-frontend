import { DetailedPlaylistTrackFragment, DetailedTrackFragment, EntityType, useCreateCommentMutation, useDetailedReviewCommentsQuery, useStartPlaybackMutation } from "graphql/generated/schema"
import toast from 'react-hot-toast';
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom, atom } from "jotai"
import { currentlyPlayingTrackAtom, openCommentModalAtom, playbackDevicesAtom, selectedTrackAtom } from "state/Atoms"
import { RefObject, SetStateAction, useMemo, useRef } from "react"
import UserAvatar, { TooltipPos } from "component/UserAvatar"
import useDoubleClick from "hook/useDoubleClick"
import { useQueryClient } from '@tanstack/react-query'
import LikeButton from "component/LikeButton";
import { focusAtom } from "jotai/optics";
import * as O from 'optics-ts'

export interface PlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    playlistId: string
    atom: PrimitiveAtom<DetailedTrackFragment>
}

function valueOrIfNull<T>(defaultValue: T) {
    O.optic<T | null>().lens(
        (source) => (source === null ? defaultValue : source),
        (value, _source) => value
    )
}

function valueOrNullAtom<T>(atomParam: PrimitiveAtom<T | null>, defaultValue: T) {
    return atom<T, SetStateAction<T>>((get) => {
        const value = get(atomParam)
        return value === null ? defaultValue : value
    },
        (_get, set, num) => set(atomParam, num as SetStateAction<T | null>)
    )
}

const useLikeAtom = (trackAtom: PrimitiveAtom<DetailedTrackFragment>) =>
    useMemo(() => focusAtom(trackAtom, atom => atom.prop('isLiked').valueOr(false)), [trackAtom])

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ playlistTrack: { addedAt, addedBy }, reviewId, playlistId, atom }: PlaylistTrackProps) {
    const queryClient = useQueryClient()
    // We want to know what devices are available so we can start playback on the correct device.
    const devices = useAtomValue(playbackDevicesAtom)
    const track = useAtomValue(atom)
    const setCommentModal = useSetAtom(openCommentModalAtom)

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(", ")
    // Sorted biggest to smallest.
    const albumImage = track.album?.images?.at(-1)
    const avatarImage = addedBy?.spotifyProfile?.images?.at(-1)
    const displayName = addedBy?.spotifyProfile?.displayName ?? addedBy?.id

    // Get track styles.
    const isSelected = useAtomValue(selectedTrackAtom)?.trackId == track.id
    const [currentlyPlaying, setPlaying] = useAtom(currentlyPlayingTrackAtom)
    const isPlaying = useMemo(() => track.id == currentlyPlaying, [track.id, currentlyPlaying])
    const [bgStyle, textStyle, hoverStyle] =
        isPlaying ? ["bg-success", "text-success-content", ''] :
            isSelected ? ["bg-info", "text-info-content", ''] :
                ["bg-neutral/30", "text-neutral-content", `active:bg-neutral-focus`]

    const resetState = () => setCommentModal(undefined)

    // On successful comment creation, clear the comment box 
    const { mutateAsync: createComment } = useCreateCommentMutation({ onSuccess: resetState })
    const onSubmit = async (comment: string) => {
        const createdComment = await createComment({ input: { comment, entities: [{ entityId: track.id, entityType: EntityType.Track }], reviewId } })
        createdComment.createComment
        queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
    }

    const { mutate: playTrack, isLoading } = useStartPlaybackMutation({
        onError: () => toast.error(`Failed to start playback. Please start a playback session and try again.`),
        onSuccess: () => {
            setPlaying(track.id)
        }
    });

    const onPlayTrack = () => {
        if (!isLoading) {
            console.log(playlistId)
            // We only want to include device when one is not active.
            const device = devices?.some(d => d.isActive) ? null : devices?.at(0)?.id
            const inner = { entityId: track.id, entityType: EntityType.Track }
            const outer = { entityId: playlistId, entityType: EntityType.Playlist }
            const input = { input: { entityOffset: { outer, inner }, deviceId: device } }
            playTrack(input)
        }
    }

    const showModal = () => {
        const values = { title: "create comment", onCancel: resetState, onSubmit }
        setCommentModal(values)
    }

    const isLikedAtom = valueOrNullAtom(useLikeAtom(atom), false)

    function isLikedSvgClass(isLiked: boolean): string {
        if (isLiked && isPlaying) {
            return 'fill-success-content'
        } else if (isLiked) {
            return 'fill-success'
        } else if (isPlaying) {
            return 'stroke-success-content'
        } else {
            return 'stroke-neutral-content'
        }
    }

    // Play on div double click.
    const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>;
    useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: onPlayTrack })
    return (
        <div
            ref={playOnDoubleClickRef}
            className={`card card-body grid grid-cols-5 md:grid-cols-6 items-center p-0.5 m-0 ${bgStyle} ${hoverStyle}`} >

            <div className="avatar">
                <div className="w-8 md:w-12 rounded" onClick={showModal}>
                    <img src={albumImage} />
                </div>
            </div>

            <div className={`col-span-2 flex flex-col grow ${textStyle}`}>
                <div className="select-none	truncate text-sm lg:text-base p-0.5"> {track.name} </div>
                <div className="select-none	truncate text-xs lg:text-sm p-0.5 font-light"> {artistNames ?? ""} </div>
            </div>

            <div className={`hidden md:grid place-items-center select-none text-xs lg:text-sm ${textStyle}`}>
                <p> {new Date(addedAt).toLocaleDateString()} </p>
            </div>
            {/* <div className={`flex flex-row w-3/6 justify-evenly }> */}
            {/* TODO: This needs to get centered vertically */}
            <div className="grid place-items-center">
                <UserAvatar className="grid place-items-center" displayName={displayName} image={avatarImage as string} tooltipPos={TooltipPos.Left} />
            </div>
            <div className="grid place-items-center">
                <LikeButton
                    trackId={track.id}
                    likeAtom={isLikedAtom}
                    className={`btn btn-sm btn-ghost p-0`}
                    getSvgClassName={isLikedSvgClass}
                />
            </div>
        </div >
    )
}
