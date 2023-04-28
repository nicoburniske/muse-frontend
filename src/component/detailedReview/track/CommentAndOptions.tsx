import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { useCommentModalTrack } from './useCommentModalTrack'
import TrackOptions from './TrackDropdown'
import { useIsCurrentUserCollaborator } from 'state/useDetailedReviewCacheQuery'
import { Button } from 'platform/component/Button'

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
      <div className='mx-1 flex w-full items-center justify-between md:mx-3 lg:mx-4'>
         {canComment && (
            <Button variant='ghost' size='square' onClick={showCommentModal}>
               <ChatBubbleLeftIcon className='h-5 w-5' />
            </Button>
         )}
         <TrackOptions trackId={trackId} playlistId={playlistId} />
      </div>
   )
}
