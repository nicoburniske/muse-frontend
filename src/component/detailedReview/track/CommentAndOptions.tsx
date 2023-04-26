import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { useCommentModalTrack } from './useCommentModalTrack'
import TrackOptions from './TrackDropdown'
import { useIsCurrentUserCollaborator } from 'state/useDetailedReviewCacheQuery'
import { ListenOnSpotifyIcon } from 'component/ListenOnSpotify'

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
         <ListenOnSpotifyIcon entityId={trackId} entityType={'Track'} className='flex-none p-0' />
         {canComment && (
            <button className='btn btn-ghost btn-square btn-sm' onClick={showCommentModal}>
               <ChatBubbleLeftIcon className='h-5 w-5' />
            </button>
         )}
         {/* <TrackOptions trackId={trackId} playlistId={playlistId} /> */}
      </div>
   )
}
