import { DetailedCommentFragment } from 'graphql/generated/schema'
import { Fragment, useState } from 'react'
import CommentMarkdown from './CommentMarkdown'
import { findFirstImage, classNames } from 'util/Utils'
import { ReviewOverview } from '../table/Helpers'
import { useCurrentUserId } from 'state/CurrentUser'
import { Menu, Transition } from '@headlessui/react'
import {
   ChatBubbleLeftEllipsisIcon,
   ChatBubbleOvalLeftEllipsisIcon,
   EllipsisVerticalIcon,
   MagnifyingGlassCircleIcon,
   PencilIcon,
   TrashIcon,
} from '@heroicons/react/20/solid'
import { useSetAtom } from 'jotai'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'
import { useOpenNewComment } from '../commentForm/useOpenNewComment'
import { useOpenDeleteConfirmation } from './DeleteCommentConfirmation'
import { useOpenUpdateComment } from '../commentForm/useOpenUpdateComment'

export interface DetailedCommentProps {
   review: ReviewOverview
   comment: DetailedCommentFragment
   childComments: DetailedCommentFragment[]
}

export default function DetailedComment({ review, comment: detailedComment, childComments }: DetailedCommentProps) {
   const reviewId = review.reviewId
   const isChild = detailedComment.parentCommentId != null

   const avatar = detailedComment?.commenter?.spotifyProfile?.images?.at(-1) ?? ''
   const comment = detailedComment?.comment ?? '** deleted **'
   const commenterName = detailedComment.commenter?.spotifyProfile?.displayName ?? ''
   const commenterId = detailedComment.commenter?.id ?? ''
   const createdAt = (() => {
      const date = new Date(detailedComment?.updatedAt)
      return date.toLocaleDateString()
   })()

   const image = findFirstImage(detailedComment.entities ?? [])
   const name = detailedComment.entities?.at(0)?.name ?? 'Failed to retrieve name'

   // We want to find the track that the comment is applied to and scroll to it.
   const setSelectedTrack = useSetAtom(selectedTrackAtom)
   const selectTrack = () => {
      const trackId = detailedComment.entities?.at(0)?.id
      if (trackId) {
         setSelectedTrack(undefined)
         setTimeout(() => setSelectedTrack({ trackId, reviewId }), 1)
      }
   }
   const replyComment = useOpenNewComment({
      reviewId,
      trackId: detailedComment?.entities?.at(0)?.id!,
      parentCommentId: detailedComment.id,
      title: 'Reply To Comment',
   })

   const [isExpanded, setIsExpanded] = useState(false)

   return (
      <>
         <div className='bg-base-200 px-4 py-6 text-base-content shadow sm:rounded-lg sm:p-6'>
            <article>
               <div>
                  <div className='flex space-x-3'>
                     <div className='flex-shrink-0'>
                        <img className='h-10 w-10 rounded-full' src={avatar} alt='' />
                     </div>
                     <div className='min-w-0 flex-1'>
                        <p className='space-x-1 text-sm font-medium text-base-content'>
                           <a className=''>{commenterName}</a>

                           <a className='hidden text-xs text-base-content/50 md:inline'>
                              <time dateTime={detailedComment?.updatedAt}>{createdAt}</time>
                           </a>
                        </p>
                        <p className='text-sm text-base-content/50'>
                           <a className='text-xs text-base-content/50 hover:underline'>@{commenterId}</a>
                        </p>
                     </div>

                     <div className='avatar ml-1 hidden sm:flex'>
                        <div className='h-10 w-10 rounded'>
                           <img src={image} />
                        </div>
                     </div>
                     <div className='min-w-0 flex-1'>
                        {/* <p className='text-sm font-medium text-gray-900'>
                        <a className='hover:underline'>{commenterName}</a>
                     </p> */}
                        <p className='select-none truncate p-0.5 text-base'> {name} </p>
                        {/* <div className='select-none	truncate p-0.5 text-sm font-light'> {'SECONDARY INFO'} </div> */}
                        {/* <p className='text-sm text-gray-500'>
                        <a>
                           <time dateTime={detailedComment?.updatedAt}>{createdAt}</time>
                        </a>
                     </p> */}
                     </div>
                     <div className='flex flex-shrink-0 self-center'>
                        <CommentMenu reviewId={reviewId} comment={detailedComment} />
                     </div>
                  </div>
                  {/* <h2 id={'question-title-' + detailedComment.id} className='mt-4 text-base font-medium text-gray-900'>
                  {'TRACK NAME??'}
               </h2> */}
               </div>

               <article className='prose  p-0.5 text-sm md:text-base lg:p-2'>
                  <CommentMarkdown comment={comment} trackId={detailedComment?.entities?.at(0)?.id!} />
               </article>
               <div className='mt-6 flex justify-between space-x-8'>
                  <div className='flex space-x-6'>
                     <span className='inline-flex items-center text-sm'>
                        <button
                           type='button'
                           className='inline-flex space-x-2 text-base-content/50 hover:text-base-content'
                           onClick={selectTrack}
                        >
                           <MagnifyingGlassCircleIcon className='h-5 w-5' aria-hidden='true' />
                           <span className='font-medium text-base-content/50'>Find</span>
                           <span className='sr-only'>Find Track</span>
                        </button>
                     </span>
                     <span className='inline-flex items-center text-sm'>
                        <button
                           type='button'
                           className='inline-flex space-x-2 text-base-content/50 hover:text-base-content'
                           onClick={() => setIsExpanded(!isExpanded)}
                        >
                           <ChatBubbleLeftEllipsisIcon className='h-5 w-5' aria-hidden='true' />
                           <span className='font-medium text-base-content/50'>{childComments.length}</span>
                           <span className='sr-only'>replies</span>
                        </button>
                     </span>
                  </div>
                  {!isChild && (
                     <div className='flex text-sm'>
                        <span className='inline-flex items-center text-sm'>
                           <button
                              type='button'
                              className='inline-flex space-x-2 text-base-content/50 hover:text-base-content'
                              onClick={replyComment}
                           >
                              <ChatBubbleOvalLeftEllipsisIcon className='h-5 w-5' aria-hidden='true' />
                              <span className='font-medium text-base-content/50'>Reply</span>
                           </button>
                        </span>
                     </div>
                  )}
               </div>
            </article>
         </div>

         {childComments.length > 0 && isExpanded ? (
            <div className='ml-2 py-1'>
               {childComments.map(child => (
                  <DetailedComment key={child.id} review={review} comment={child} childComments={[]} />
               ))}
            </div>
         ) : null}
      </>
   )
}

const CommentMenu = ({ reviewId, comment }: { reviewId: string; comment: DetailedCommentFragment }) => {
   const currentUserId = useCurrentUserId()
   const isEditable = comment.commenter?.id === currentUserId

   const openDelete = useOpenDeleteConfirmation({ reviewId, commentId: comment.id })
   const openEdit = useOpenUpdateComment({
      reviewId,
      commentId: comment.id,
      comment: comment.comment ?? '',
      trackId: comment.entities?.at(0)?.id || '',
   })
   return (
      <Menu as='div' className='relative inline-block text-left'>
         <div>
            <Menu.Button className='-m-2 flex items-center rounded-full p-2 text-base-content hover:text-base-content/50'>
               <span className='sr-only'>Open options</span>
               <EllipsisVerticalIcon className='h-5 w-5' aria-hidden='true' />
            </Menu.Button>
         </div>

         <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
         >
            <Menu.Items className='absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-neutral text-neutral-content shadow-lg ring-1 ring-primary ring-opacity-5 focus:outline-none'>
               <div className='py-1'>
                  {isEditable && (
                     <>
                        <Menu.Item>
                           {({ active }) => (
                              <div
                                 className={classNames(active ? 'bg-neutral-focus' : '', 'flex px-4 py-2 text-sm')}
                                 onClick={openEdit}
                              >
                                 <PencilIcon className='mr-3 h-5 w-5 ' aria-hidden='true' />
                                 <span>Edit comment</span>
                              </div>
                           )}
                        </Menu.Item>
                        <Menu.Item>
                           {({ active }) => (
                              <div
                                 className={classNames(active ? 'bg-neutral-focus' : '', 'flex px-4 py-2 text-sm')}
                                 onClick={openDelete}
                              >
                                 <TrashIcon className='mr-3 h-5 w-5 ' aria-hidden='true' />
                                 <span>Delete comment</span>
                              </div>
                           )}
                        </Menu.Item>
                     </>
                  )}
               </div>
            </Menu.Items>
         </Transition>
      </Menu>
   )
}
