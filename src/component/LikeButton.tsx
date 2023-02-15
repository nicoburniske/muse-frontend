import toast from 'react-hot-toast'
import { useRemoveSavedTracksMutation, useSaveTracksMutation } from './sdk/ClientHooks'
import { cn } from 'util/Utils'
import { useTrackLikeQuery } from '../state/useTrackLikeQuery'
import { UseQueryOptions } from '@tanstack/react-query'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/20/solid'

interface LikeButtonProps {
   trackId: string
   svgStyle: (isLiked: boolean | undefined) => string
   className?: string
   options?: UseQueryOptions<boolean, unknown, boolean, string[]>
}

export default function LikeButton({ trackId, className = '', svgStyle, options }: LikeButtonProps) {
   const {
      query: { data: isLiked },
      updateLike,
   } = useTrackLikeQuery(trackId, options)

   const { mutate: likeTrack } = useSaveTracksMutation({
      onError: () => toast.error('Failed to add track to Liked Songs.'),
      onSuccess: () => {
         toast.success('Added to Liked Songs.')
         updateLike(true)
      },
   })

   const { mutate: unlikeTrack } = useRemoveSavedTracksMutation({
      onError: () => toast.error('Failed to remove track from Liked Songs.'),
      onSuccess: () => {
         toast.success('Removed from Liked Songs.')
         updateLike(false)
      },
   })

   const input: [string] = [trackId]
   const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation()
      isLiked ? unlikeTrack(input) : likeTrack(input)
   }

   const svgClassName = svgStyle(isLiked)
   const disabled = isLiked === undefined

   return (
      <button className={cn(className)} disabled={disabled} onClick={e => handleClick(e)}>
         {isLiked ? (
            <HeartIconSolid className={cn('h-6 w-6', svgClassName)} />
         ) : (
            <HeartIcon className={cn('h-6 w-6', svgClassName)} />
         )}
      </button>
   )
}
