import { useRemoveSavedTracksMutation, useSaveTracksMutation } from "graphql/generated/schema";
import { useBoolToggleSynced } from "hook/useToggle";
import { HeartOutlineIcon, HeartSolidIcon } from "./Icons";
import toast from 'react-hot-toast';


export default function LikeButton({ trackId, isLiked: isLikedProp, className, svgClassName }: { trackId: string, isLiked: boolean, className: string, svgClassName?: string}) {
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

    return (
        <button className={className} onClick={() => handleClick()}>
            {isLiked ? <HeartSolidIcon className={svgClassName} /> : <HeartOutlineIcon />}
        </button>
    )
}