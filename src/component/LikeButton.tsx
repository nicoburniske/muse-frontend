import { useRemoveSavedTracksMutation, useSaveTracksMutation } from "graphql/generated/schema";
import { useBoolToggle, useBoolToggleSynced } from "hook/useToggle";
import { HeartOutlineIcon, HeartSolidIcon } from "./Icons";
import toast from 'react-hot-toast';

interface LikeButtonProps {
    trackId: string,
    isLiked: boolean,
    className: string,
    getSvgClassName: (isLiked: boolean) => string
}
export default function LikeButton({ trackId, isLiked: isLikedProp, className, getSvgClassName }: LikeButtonProps) {
    const [isLiked, , toggleLiked] = useBoolToggleSynced(isLikedProp)

    const { mutate: likeTrack, isLoading: loadingLike } = useSaveTracksMutation({
        onSuccess: () => toggleLiked(),
        onError: () => toast.error('Failed to toggle like.'),
    });

    const { mutate: unlikeTrack, isLoading: loadingUnlike } = useRemoveSavedTracksMutation({
        onSuccess: () => toggleLiked(),
        onError: () => toast.error('Failed to toggle like.'),
    });
    const input = { trackIds: [trackId] }
    const handleClick = () => isLiked ? unlikeTrack(input) : likeTrack(input)

    const svgClassName = getSvgClassName(isLiked)
    return (
        <button className={className} onClick={() => handleClick()}>
            {isLiked ? <HeartSolidIcon className={svgClassName} /> : <HeartOutlineIcon className={svgClassName} />}
        </button>
    )
}