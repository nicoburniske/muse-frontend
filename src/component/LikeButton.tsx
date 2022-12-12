import { HeartOutlineIcon, HeartSolidIcon } from './Icons'
import toast from 'react-hot-toast'
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { nowPlayingTrackAtom } from 'state/Atoms'
import { useEffect } from 'react'
import { nonNullable } from 'util/Utils'
import { useQueryClient } from '@tanstack/react-query'
import { useRemoveSavedTracksMutation, useSaveTracksMutation, useTrackLikeQuery } from './playbackSDK/hooks'


interface LikeButtonProps {
    trackId: string
    likeAtom: PrimitiveAtom<boolean>
    className: string,
    syncNowPlaying: boolean
    getSvgClassName: (isLiked: boolean) => string
}

export default function LikeButton({ trackId, likeAtom, className, syncNowPlaying, getSvgClassName }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useAtom(likeAtom)
    const queryClient = useQueryClient()

    useSyncLikedState(syncNowPlaying, trackId, likeAtom)

    const invalidateLikeQuery = () => queryClient.invalidateQueries(useTrackLikeQuery.getKey(trackId))

    const { mutate: likeTrack } = useSaveTracksMutation({
        onError: () => toast.error('Failed to save track.'),
        onSuccess: () => {
            setIsLiked(true)
            invalidateLikeQuery()
        },
    })

    const { mutate: unlikeTrack } = useRemoveSavedTracksMutation({
        onError: () => toast.error('Failed to unsave track.'),
        onSuccess: () => {
            setIsLiked(false)
            invalidateLikeQuery()
        }
    })

    const input: [string] = [trackId]
    const handleClick = () => isLiked ? unlikeTrack(input) : likeTrack(input)

    const svgClassName = getSvgClassName(isLiked)
    const outerClassName = `${className} swap swap-flip ${isLiked ? 'swap-active' : ''}`

    return (
        <label className={outerClassName} onClick={() => handleClick()}>
            <HeartSolidIcon className={svgClassName + ' swap-on'} />
            <HeartOutlineIcon className={svgClassName + ' swap-off'} />
        </label>
    )
}

const useSyncLikedState = (shouldSync: boolean, trackId: string, likeAtom: PrimitiveAtom<boolean>) => {
    const setIsLiked = useSetAtom(likeAtom)
    // Sychronizing state with now playing track.
    const nowPlaying = useAtomValue(nowPlayingTrackAtom)
    const isPlaying = nonNullable(nowPlaying) && nowPlaying.trackId == trackId
    useEffect(() => {
        if (shouldSync && isPlaying) {
            console.log('Doing the big litty')
            setIsLiked(nowPlaying.isLiked)
        }
    }, [shouldSync, nowPlaying])
}