import { HeartOutlineIcon, HeartSolidIcon } from './Icons'
import toast from 'react-hot-toast'
import { atom, Atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { nowPlayingIsLikedAtom, nowPlayingTrackIdAtom } from 'state/Atoms'
import { useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRemoveSavedTracksMutation, useSaveTracksMutation, useTrackLikeQuery } from './playbackSDK/hooks'
import { useTransientAtom } from 'hook/useTransientAtom'


interface LikeButtonProps {
    trackId: string
    likeAtom: PrimitiveAtom<boolean>
    svgClass: Atom<string>
    className: string,
}

export default function LikeButton({ trackId, likeAtom, svgClass, className }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useAtom(likeAtom)
    const queryClient = useQueryClient()

    // Sychronizing state with now playing track.
    useSyncLikedState(trackId, likeAtom)

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

    const svgClassName = useAtomValue(svgClass)

    return (
        <button className={className} onClick={() => handleClick()}>
            {isLiked ? <HeartSolidIcon className={svgClassName} /> : <HeartOutlineIcon className={svgClassName} />}
        </button>
    )
}


const useSyncLikedState = (trackId: string, likeAtom: PrimitiveAtom<boolean>) => {
    const setIsLiked = useSetAtom(likeAtom)
    const [getIsLiked] = useTransientAtom(nowPlayingIsLikedAtom)

    const shouldUpdate = useAtomValue(useMemo(() => atom(get =>
        get(nowPlayingTrackIdAtom) === trackId
        && get(nowPlayingIsLikedAtom) !== get(likeAtom)
    ), [trackId]))


    useEffect(() => {
        const currentLiked = getIsLiked()
        if (shouldUpdate && currentLiked !== undefined) {
            setIsLiked(currentLiked)
        }
    }, [shouldUpdate])
}	