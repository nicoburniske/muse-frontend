import { DetailedPlaylistTrackFragment, DetailedTrackFragment, EntityType, useCreateCommentMutation, useDetailedReviewCommentsQuery } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { PrimitiveAtom, useAtomValue, atom } from 'jotai'
import { nowPlayingTrackIdAtom, selectedTrackAtom } from 'state/Atoms'
import { RefObject, SetStateAction, useMemo, useRef } from 'react'
import UserAvatar, { TooltipPos } from 'component/UserAvatar'
import useDoubleClick from 'hook/useDoubleClick'
import { useQueryClient } from '@tanstack/react-query'
import LikeButton from 'component/LikeButton'
import { focusAtom } from 'jotai/optics'
import { useLongPress } from 'use-long-press'
import { usePlay } from 'component/playbackSDK/hooks'
import { useCommentModal } from './commentForm/CommentFormModalWrapper'

export interface PlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    playlistId: string
    trackAtom: PrimitiveAtom<DetailedTrackFragment>
}

function valueOrDefault<T>(atomParam: PrimitiveAtom<T | null>, defaultValue: T) {
    return atom<T, SetStateAction<T>>(
        (get) => {
            const value = get(atomParam)
            return value === null ? defaultValue : value
        },
        (_get, set, num) => set(atomParam, num as SetStateAction<T | null>)
    )
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ playlistTrack: { addedAt, addedBy }, reviewId, playlistId, trackAtom }: PlaylistTrackProps) {
    const queryClient = useQueryClient()
    const track = useAtomValue(trackAtom)
    const { openCommentModal, closeCommentModal } = useCommentModal()

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(', ')
    // Sorted biggest to smallest.
    const albumImage = track.album?.images?.at(-1)
    const avatarImage = addedBy?.spotifyProfile?.images?.at(-1)
    const displayName = addedBy?.spotifyProfile?.displayName ?? addedBy?.id

    // Get track styles.
    const [bgStyle, textStyle, hoverStyle] = useTrackColor(track.id)

    // On successful comment creation, clear the comment box 
    const { mutateAsync: createComment, isLoading: isLoadingComment } = useCreateCommentMutation({
        onSuccess: () => closeCommentModal(),
        onError: () => toast.error('Failed to create comment.')
    })
    const onSubmit = async (comment: string) => {
        if (!isLoadingComment) {
            // TODO: insert into cache? 
            await createComment({ input: { comment, entities: [{ entityId: track.id, entityType: EntityType.Track }], reviewId } })
            queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
        }
    }

    const showModal = () => {
        const values = { title: 'create comment', onCancel: () => closeCommentModal(), onSubmit, trackId: track.id }
        openCommentModal(values)
    }

    const isLikedAtom = useMemo(() => valueOrDefault(
        focusAtom(trackAtom, atom => atom.prop('isLiked').valueOr(false)),
        false),
    [])

    const svgClass = useMemo(() => atom(get => {
        const isPlaying = get(nowPlayingTrackIdAtom) === track.id
        const isLiked = get(isLikedAtom)

        if (isLiked && isPlaying) {
            return 'fill-success-content'
        } else if (isLiked) {
            return 'fill-success'
        } else if (isPlaying) {
            return 'stroke-success-content'
        } else {
            return 'stroke-base-content'
        }
    }), [track.id])

    const { playlistOffset, isLoading } = usePlay()

    const onPlayTrack = () => {
        if (!isLoading) {
            playlistOffset(playlistId, track.id)
        }
    }

    // Play on div double click.
    const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>
    useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: onPlayTrack })
    const bind = useLongPress(() => {
        showModal()
    }, { threshold: 500 })

    return (
        <div
            {...bind()}
            ref={playOnDoubleClickRef}
            className={`card card-body grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 items-center p-0.5 m-0 ${bgStyle} ${hoverStyle}`} >

            <div className="hidden sm:flex avatar ml-1">
                <div className="w-8 md:w-12 rounded" onClick={showModal}>
                    <img src={albumImage} />
                </div>
            </div>

            <div className={`col-span-2 flex flex-col grow ${textStyle}`}>
                <div className="select-none	truncate text-sm lg:text-base p-0.5"> {track.name} </div>
                <div className="select-none	truncate text-xs lg:text-sm p-0.5 font-light"> {artistNames ?? ''} </div>
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
                    svgClass={svgClass}
                    className={'btn btn-sm btn-ghost p-0'}
                />
            </div>
        </div >
    )
}

// Seperating these out is better for performance. 
// Single derived atom is an array therefore it will be recomputed every time the list changes.
// Only change styling if derived values are different.
const useTrackColor = (trackId: string) => {
    const isSelected = useAtomValue(useMemo(() => atom(get =>
        get(selectedTrackAtom)?.trackId === trackId), [trackId]))

    const isPlaying = useAtomValue(useMemo(() => atom(get =>
        get(nowPlayingTrackIdAtom) === trackId), [trackId]))

    return useMemo(() =>
        isPlaying ? ['bg-success', 'text-success-content', ''] :
            isSelected ? ['bg-info', 'text-info-content', ''] :
                ['bg-base-100', 'text-base-content', 'active:bg-accent active:text-accent-content'],
    [isSelected, isPlaying])
}