import { useRemoveSavedTracksMutation, useSaveTracksMutation, useTrackLikeQuery } from 'graphql/generated/schema'
import { HeartOutlineIcon, HeartSolidIcon } from './Icons'
import toast from 'react-hot-toast'
import { PrimitiveAtom, useAtom, useAtomValue } from 'jotai'
import { nowPlayingTrackAtom } from 'state/Atoms'
import { useEffect } from 'react'
import { nonNullable } from 'util/Utils'
import { useQueryClient } from '@tanstack/react-query'


interface LikeButtonProps {
    trackId: string
    likeAtom: PrimitiveAtom<boolean>
    className: string,
    getSvgClassName: (isLiked: boolean) => string
}

export default function LikeButton({ trackId, likeAtom, className, getSvgClassName }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useAtom(likeAtom)
    const queryClient = useQueryClient()

    // Sychronizing state with now playing track.
    const nowPlaying = useAtomValue(nowPlayingTrackAtom)
    const isPlaying = nonNullable(nowPlaying) && nowPlaying.trackId == trackId
    useEffect(() => {
        if (isPlaying) {
            setIsLiked(nowPlaying.isLiked)
        }
    }, [nowPlaying])

    const toggleLiked = () => {if (!isPlaying) {setIsLiked(!isLiked)}}

    const invalidateLikeQuery = () => queryClient.invalidateQueries(useTrackLikeQuery.getKey({ id: trackId }))

    const { mutate: likeTrack } = useSaveTracksMutation({
        onError: () => toast.error('Failed to toggle like.'),
        onSuccess: () => {
            toggleLiked()
            invalidateLikeQuery()
        },
    })

    const { mutate: unlikeTrack } = useRemoveSavedTracksMutation({
        onError: () => toast.error('Failed to toggle like.'),
        onSuccess: () => {
            toggleLiked()
            invalidateLikeQuery()
        }
    })

    const input = { trackIds: [trackId] }
    const handleClick = () => isLiked ? unlikeTrack(input) : likeTrack(input)

    const svgClassName = getSvgClassName(isLiked)
    return (
        <button className={className} onClick={() => handleClick()}>
            {isLiked ? <HeartSolidIcon className={svgClassName} /> : <HeartOutlineIcon className={svgClassName} />}
        </button>
    )
}