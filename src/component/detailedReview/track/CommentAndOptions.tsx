import { ChatBubbleLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { useCommentModalTrack } from './useCommentModalTrack'
import { useIsCurrentUserCollaborator } from 'state/useDetailedReviewCacheQuery'
import { Button } from 'platform/component/Button'
import { useSetTrackContextMenu } from './TrackContextMenu'

type CommentAndOptionsProps = {
   onMenuClick: () => void
   trackId: string
   reviewId: string
   playlistId?: string
}

export const CommentAndOptions = ({ trackId, reviewId, playlistId, onMenuClick }: CommentAndOptionsProps) => {
   const showCommentModal = useCommentModalTrack(reviewId, trackId)
   const canComment = useIsCurrentUserCollaborator(reviewId)
   const setContextMenu = useSetTrackContextMenu()
   const showContextMenu = () => {
      setContextMenu({ trackId, playlistId })
      onMenuClick()
   }

   return (
      <div className='mx-1 flex w-full items-center justify-between md:mx-3 lg:mx-4'>
         {canComment && (
            <Button variant='ghost' size='square' onClick={showCommentModal}>
               <ChatBubbleLeftIcon className='h-5 w-5' />
            </Button>
         )}
         <EllipsisVerticalIcon className='h-5 w-5 cursor-pointer' onClick={showContextMenu} />
      </div>
   )
}
