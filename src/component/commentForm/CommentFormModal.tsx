import { atom, useAtomValue, useSetAtom } from 'jotai'

import { UserAvatar } from '@/component/avatar/UserAvatar'
import { Dialog, DialogContent } from '@/lib/component/Dialog'
import { useCurrentUserDisplayName, useCurrentUserImage } from '@/state/CurrentUser'

import { CommentForm } from './CommentForm'

interface CommentModalData {
   trackId: string
   title: string
   initialValue?: string

   onSubmit: (comment: string) => Promise<void>
   onCancel: () => void
}

const defaultModalValue = {
   trackId: '',
   title: '',
   onSubmit: async () => {},
   onCancel: () => {},
} as const

const commentModalValues = atom<CommentModalData>(defaultModalValue)
const isOpenModalAtom = atom(false)

const openModalAtom = atom(null, (_get, set, value: CommentModalData) => {
   set(commentModalValues, value)
   set(isOpenModalAtom, true)
})
const closeModalAtom = atom(null, (_get, set) => {
   set(isOpenModalAtom, false)
   setTimeout(() => set(commentModalValues, defaultModalValue), 500)
})

export const useCommentModal = () => {
   const openCommentModal = useSetAtom(openModalAtom)
   const closeCommentModal = useSetAtom(closeModalAtom)
   return {
      openCommentModal,
      closeCommentModal,
   }
}

export const CommentFormModal = () => {
   const { onSubmit, onCancel, trackId, initialValue } = useAtomValue(commentModalValues)
   const open = useAtomValue(isOpenModalAtom)

   const userImage = useCurrentUserImage()
   const userDisplayName = useCurrentUserDisplayName()

   return (
      <Dialog
         open={open}
         onOpenChange={open => {
            if (!open) {
               onCancel()
            }
         }}
      >
         <DialogContent className='rounded-md p-2 sm:max-w-3xl md:p-6'>
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
