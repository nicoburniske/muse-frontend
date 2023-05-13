import { atom, useAtomValue, useSetAtom } from 'jotai'

import { UserAvatar } from '@/component/avatar/UserAvatar'
import atomValueOrThrow from '@/lib/atom/atomValueOrThrow'
import { makeModalAtoms } from '@/lib/atom/makeModalAtoms'
import { Dialog, DialogContent } from '@/lib/component/Dialog'
import { useCurrentUserDisplayName, useCurrentUserImage } from '@/state/CurrentUser'

import { CommentForm } from './CommentForm'

interface CommentModalData {
   title: string
   trackId: string
   initialValue?: string

   onSubmit: (comment: string) => Promise<void>
}

const { setOpen, setClose, valueAtom, openAtom } = makeModalAtoms<CommentModalData | null, CommentModalData>(null)
const commentModalValues = atomValueOrThrow(valueAtom)

export const useCommentModal = () => ({
   openCommentModal: useSetAtom(setOpen),
   closeCommentModal: useSetAtom(setClose),
})

export const CommentFormModal = () => {
   const open = useAtomValue(openAtom)
   if (open) {
      return <CommentFormModalContent />
   } else {
      return null
   }
}

const CommentFormModalContent = () => {
   const { trackId, initialValue, onSubmit } = useAtomValue(commentModalValues)
   const open = useAtomValue(openAtom)
   const close = useSetAtom(setClose)

   const userImage = useCurrentUserImage()
   const userDisplayName = useCurrentUserDisplayName()

   return (
      <Dialog
         open={open}
         onOpenChange={open => {
            if (!open) {
               close()
            }
         }}
      >
         <DialogContent
            className='rounded-md p-2 sm:max-w-3xl md:p-6'
            // This is needed to auto-focus on textarea
            onOpenAutoFocus={e => e.preventDefault()}
         >
            <div className='items-start justify-between'>
               <div className='hidden flex-shrink-0 sm:inline-block'>
                  <UserAvatar name={userDisplayName} image={userImage} className='h-10 w-10 lg:h-12 lg:w-12' />
               </div>

               <CommentForm onSubmit={onSubmit} initialValue={initialValue} trackId={trackId} />
            </div>
         </DialogContent>
      </Dialog>
   )
}
