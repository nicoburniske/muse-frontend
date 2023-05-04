import { ChatBubbleLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { useCommentModalTrack } from './useCommentModalTrack'
import { useIsCurrentUserCollaborator } from 'state/useDetailedReviewCacheQuery'
import { Button } from 'lib/component/Button'
import { useSetTrackContextMenu } from './TrackContextMenu'
import { RefObject, useRef } from 'react'

type CommentAndOptionsProps = {
   onMenuClick: (ref: RefObject<Element>) => void
   trackId: string
   reviewId: string
   playlistId?: string
}

export const CommentAndOptions = ({ trackId, reviewId, playlistId, onMenuClick }: CommentAndOptionsProps) => {
   const showCommentModal = useCommentModalTrack(reviewId, trackId)
   const canComment = useIsCurrentUserCollaborator(reviewId)
   const setContextMenu = useSetTrackContextMenu()

   const ref = useRef<SVGElement>(null)
   const showContextMenu = () => {
      setContextMenu({ trackId, playlistId })
      onMenuClick(ref)
   }

   return (
      <div className='mx-1 flex items-center justify-between gap-5 md:mx-3 lg:mx-4'>
         {canComment && (
            <Button variant='ghost' size='square' onClick={showCommentModal}>
               <ChatBubbleLeftIcon className='h-5 w-5' />
            </Button>
         )}
         <EllipsisVerticalIcon
            className='h-5 w-5 cursor-pointer'
            onClick={showContextMenu}
            ref={ref as RefObject<SVGSVGElement>}
         />
      </div>
   )
}
