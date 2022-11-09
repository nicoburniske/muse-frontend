import { useRemoveSavedTracksMutation, useSaveTracksMutation } from 'graphql/generated/schema'
import { HeartOutlineIcon, HeartSolidIcon } from './Icons'
import toast from 'react-hot-toast'
import { PrimitiveAtom, useAtom } from 'jotai'


interface LikeButtonProps {
    trackId: string
    likeAtom: PrimitiveAtom<boolean>
    className: string,
    getSvgClassName: (isLiked: boolean) => string
}

export default function LikeButton({ trackId, likeAtom, className, getSvgClassName }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useAtom(likeAtom)
    const toggleLiked = () => setIsLiked(!isLiked)

    const { mutate: likeTrack } = useSaveTracksMutation({
        onError: () => toast.error('Failed to toggle like.'),
        onSuccess: () => {
            toggleLiked()
        },
    })


    const { mutate: unlikeTrack } = useRemoveSavedTracksMutation({
        onError: () => toast.error('Failed to toggle like.'),
        onSuccess: () => {
            toggleLiked()
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