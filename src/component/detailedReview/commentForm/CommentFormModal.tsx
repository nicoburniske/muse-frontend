import { ThemeModal } from 'platform/component/ThemeModal'
import { CommentForm } from './CommentForm'
import { useCurrentDisplayName, useCurrentUserImage } from 'state/CurrentUser'
import { UserAvatar } from 'component/UserAvatar'

export interface CommentFormModalProps {
   open: boolean
   onSubmit: (comment: string) => Promise<void>
   onCancel: () => void
   trackId: string
   initialValue?: string
}

export const CommentFormModal = ({ open, onSubmit, onCancel, trackId, initialValue }: CommentFormModalProps) => {
   const userImage = useCurrentUserImage()
   const userDisplayName = useCurrentDisplayName()
   return (
      <ThemeModal open={open} className='max-w-4xl grow'>
         <div className='flex items-start justify-between p-3'>
            <div className='flex-shrink-0'>
               <UserAvatar name={userDisplayName} image={userImage} className='h-12 w-12' />
            </div>

            <CommentForm onSubmit={onSubmit} onCancel={onCancel} initialValue={initialValue} trackId={trackId} />
         </div>
      </ThemeModal>
   )
}
