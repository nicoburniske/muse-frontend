import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { useCommentModalTrack } from './useCommentModalTrack'
import TrackOptions from './TrackDropdown'
import { useIsCurrentUserCollaborator } from 'state/useDetailedReviewCacheQuery'

export const CommentAndOptions = ({
   trackId,
   reviewId,
   playlistId,
}: {
   trackId: string
   reviewId: string
   playlistId?: string
}) => {
   const showCommentModal = useCommentModalTrack(reviewId, trackId)
   const canComment = useIsCurrentUserCollaborator(reviewId)

   return (
      <>
         {canComment && (
            <button className='btn btn-ghost btn-square btn-sm' onClick={showCommentModal}>
               <ChatBubbleLeftIcon className='h-5 w-5' />
            </button>
         )}
         <TrackOptions trackId={trackId} playlistId={playlistId} />
      </>
   )
}
