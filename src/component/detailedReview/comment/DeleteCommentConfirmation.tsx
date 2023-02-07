import { Portal } from '@headlessui/react'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteCommentMutation, useDetailedReviewCommentsQuery } from 'graphql/generated/schema'
import { atom, useAtom, useSetAtom } from 'jotai'
import { ThemeModal } from 'platform/component/ThemeModal'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { classNames } from 'util/Utils'

const deleteModalOpenAtom = atom(false)
const defaultValues = { reviewId: '', commentId: -1 }
type DeleteModalValues = { reviewId: string; commentId: number }
const deleteModalValues = atom<DeleteModalValues>(defaultValues)
const setModalValuesAtom = atom(null, (_get, set, values: DeleteModalValues) => {
   set(deleteModalOpenAtom, true)
   set(deleteModalValues, values)
})

export const useOpenDeleteConfirmation = (values: DeleteModalValues) => {
   const setModalValues = useSetAtom(setModalValuesAtom)
   return useCallback(() => setModalValues(values), [setModalValues, values])
}

export const DeleteCommentConfirmation = () => {
   const [isModalOpen, setIsModalOpen] = useAtom(deleteModalOpenAtom)
   const [{ reviewId, commentId }, setAtomValues] = useAtom(deleteModalValues)

   const queryClient = useQueryClient()

   const { mutateAsync: deleteCommentMutation, isLoading } = useDeleteCommentMutation({
      onSuccess: () => {
         setIsModalOpen(false)
         setAtomValues({ reviewId: '', commentId: -1 })
         queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
      },
      onError: () => toast.error('Failed to delete comment'),
   })
   const deleteComment = async () => deleteCommentMutation({ input: { reviewId, commentId } })

   return (
      <Portal>
         <ThemeModal open={isModalOpen} className='max-w-md grow'>
            <div className='bg-base-100 text-base-content shadow sm:rounded-lg'>
               <div className='px-4 py-5 sm:p-6'>
                  <h3 className='text-lg font-medium leading-6 '>Confirm comment deletion</h3>
                  <div className='mt-2 max-w-xl text-sm'>
                     <p>This can't be undone</p>
                  </div>
                  <div className='mt-5 flex w-full flex-row items-center justify-around'>
                     <button
                        type='button'
                        disabled={isLoading}
                        onClick={() => setIsModalOpen(false)}
                        className={classNames('btn btn-primary btn-md', isLoading && 'btn-loading')}
                     >
                        Cancel
                     </button>

                     <button
                        type='button'
                        disabled={isLoading}
                        onClick={deleteComment}
                        className={classNames('btn btn-error btn-md', isLoading && 'btn-loading')}
                     >
                        Delete
                     </button>
                  </div>
               </div>
            </div>
         </ThemeModal>
      </Portal>
   )
}
