import { ChatBubbleLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { RefObject, useRef } from 'react'

import { Button } from '@/lib/component/Button'
import { useCurrentUserId } from '@/state/CurrentUser'
import { useReviewOverviewAtom } from '@/state/useReviewOverviewAtom'

import { useSetTrackContextMenu } from './TrackContextMenu'
import { useCommentModalTrack } from './useCommentModalTrack'

type CommentAndOptionsProps = {
   trackId: string
   reviewId: string
   playlistId?: string
   onMenuClick: (ref: RefObject<Element>) => void
}

export const CommentAndOptions = ({ trackId, reviewId, playlistId, onMenuClick }: CommentAndOptionsProps) => {
   const showCommentModal = useCommentModalTrack(reviewId, trackId)

   const data = useReviewOverviewAtom(reviewId)
   const userId = useCurrentUserId()

   const canComment =
      data?.review?.creator?.id === userId ||
      data?.review?.collaborators?.filter(c => c.accessLevel === 'Collaborator').some(c => c.user.id === userId)

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
