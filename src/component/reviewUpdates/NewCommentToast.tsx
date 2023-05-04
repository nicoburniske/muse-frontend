import { Transition } from '@headlessui/react'
import { useOpenNewComment } from 'component/commentForm/useOpenNewComment'
import { DetailedCommentFragment } from 'graphql/generated/schema'
import { Fragment } from 'react'
import toast, { Toast } from 'react-hot-toast'
import { useThemeValue } from 'state/UserPreferences'

export const newCommentToast = (c: DetailedCommentFragment) =>
   toast.custom((t: Toast) => <NewCommentToast comment={c} t={t} />, { duration: 5000 })

const NewCommentToast = ({ comment, t }: { comment: DetailedCommentFragment; t: Toast }) => {
   const displayName = comment.commenter?.spotifyProfile?.displayName ?? comment.commenter?.id
   const theme = useThemeValue()
   const images = comment.commenter.spotifyProfile?.images
   const image = images?.at(1) ?? images?.at(0)

   const replyComment = useOpenNewComment({
      reviewId: comment.reviewId,
      trackId: comment.entities?.at(0)?.id!,
      parentCommentId: comment.id,
      title: 'Reply',
   })

   return (
      <div className='flex w-full flex-col items-center space-y-4 sm:items-end'>
         <Transition
            appear={true}
            show={t.visible}
            as={Fragment}
            data-theme={theme}
            enter='transform ease-out duration-300 transition'
            enterFrom='translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2'
            enterTo='translate-y-0 opacity-100 sm:translate-x-0'
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
         >
            <div className='bg-base-300 pointer-events-auto flex w-full max-w-md rounded-lg shadow-lg ring-1 ring-primary ring-opacity-5'>
               <div className='w-0 flex-1 p-4'>
                  <div className='flex items-start'>
                     <div className='flex-shrink-0 pt-0.5'>
                        <img className='h-10 w-10 rounded-full' src={image} alt='Commenter Profile Picture' />
                     </div>
                     <div className='ml-3 w-0 flex-1'>
                        <p className='text-sm font-medium text-foreground'>{displayName}</p>
                        <p className='mt-1 text-sm text-foreground/50'>{comment.comment}</p>
                     </div>
                  </div>
               </div>
               <div className='flex border-l border-foreground/50'>
                  <div className='mr-2 flex flex-col divide-y divide-foreground/50 px-1'>
                     <div className='flex h-0 flex-1'>
                        <button
                           type='button'
                           className='w-full text-foreground/50 hover:text-foreground'
                           onClick={() => {
                              toast.dismiss(t.id)
                              replyComment()
                           }}
                        >
                           <span className='text-sm font-medium'>Reply</span>
                        </button>
                     </div>
                     <div className='flex h-0 flex-1'>
                        <button
                           type='button'
                           className='w-full text-foreground/50 hover:text-foreground'
                           onClick={() => {
                              toast.dismiss(t.id)
                           }}
                        >
                           <span className='text-sm font-medium'>Dismiss</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </Transition>
      </div>
   )
}
