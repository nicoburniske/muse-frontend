import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCurrentDisplayName, useCurrentUserImage } from 'state/CurrentUser'
import { UserAvatar } from 'component/UserAvatar'
import { CommentForm } from './CommentForm'
import { Sheet, SheetContent } from 'platform/component/Sheet'

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
   const { onSubmit, onCancel, title, trackId, initialValue } = useAtomValue(commentModalValues)
   const open = useAtomValue(isOpenModalAtom)

   const userImage = useCurrentUserImage()
   const userDisplayName = useCurrentDisplayName()

   return (
      <Sheet
         open={open}
         onOpenChange={open => {
            if (!open) {
               onCancel()
            }
         }}
      >
         <SheetContent position='center' size='xl' className='h-fit-content rounded-md'>
            <div className='items-start justify-between p-3'>
               <div className='hidden flex-shrink-0 sm:inline-block'>
                  <UserAvatar name={userDisplayName} image={userImage} className='h-10 w-10 lg:h-12 lg:w-12' />
               </div>

               <CommentForm onSubmit={onSubmit} onCancel={onCancel} initialValue={initialValue} trackId={trackId} />
            </div>
         </SheetContent>
      </Sheet>
   )
}
