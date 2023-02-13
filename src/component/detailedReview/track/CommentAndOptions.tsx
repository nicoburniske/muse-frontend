import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { useCommentModalTrack } from './useCommentModalTrack'
import TrackOptions from './TrackDropdown'

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

   return (
      <>
         <button className='btn btn-ghost btn-square btn-sm' onClick={showCommentModal}>
            <ChatBubbleLeftIcon className='h-5 w-5' />
         </button>
         <TrackOptions trackId={trackId} playlistId={playlistId} />
      </>
   )
}
