import {
   DetailedCommentFragment,
   EntityType,
   useDetailedReviewCommentsQuery,
   useUpdateCommentIndexMutation,
} from 'graphql/generated/schema'
import { Fragment, RefObject, useCallback, useRef, useState } from 'react'
import CommentMarkdown from './CommentMarkdown'
import { findFirstImage, cn } from 'util/Utils'
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
import { useDrag, useDrop } from 'react-dnd'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { UserAvatar } from 'component/UserAvatar'
import { Link } from 'react-router-dom'
import { useIsCurrentUserCollaborator } from 'state/useDetailedReviewCacheQuery'
import { ListenOnSpotifyIcon, getLink, useSpotifyIcon } from 'component/ListenOnSpotify'
import { usePlayMutation } from 'component/sdk/ClientHooks'
import useDoubleClick from 'platform/hook/useDoubleClick'

export interface DetailedCommentProps {
   review: ReviewOverview
   comment: DetailedCommentFragment
}

export default function DetailedComment({ review, comment: detailedComment }: DetailedCommentProps) {
   const reviewId = review.reviewId

   const avatar = detailedComment?.commenter?.spotifyProfile?.images?.at(-1) ?? ''
   const comment = detailedComment.deleted ? '** deleted **' : detailedComment?.comment ?? ''
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
   const entityId = detailedComment?.entities?.at(0)?.id
   const entityType = detailedComment.entities?.at(0)?.__typename as EntityType | undefined
   const selectTrack = () => {
      if (entityId && entityType === 'Track') {
         setSelectedTrack(undefined)
         setTimeout(() => setSelectedTrack({ trackId: entityId!, reviewId }), 1)
      }
   }
   const replyComment = useOpenNewComment({
      reviewId,
      trackId: detailedComment?.entities?.at(0)?.id!,
      parentCommentId: detailedComment.id,
      title: 'Reply',
   })

   const [isExpanded, setIsExpanded] = useState(false)

   const currentUserId = useCurrentUserId()
   const isEditable = detailedComment.commenter?.id === currentUserId

   const queryClient = useQueryClient()
   const { mutate } = useUpdateCommentIndexMutation({
      onError: useCallback(() => toast.error('Failed to update comment index'), []),
      onSettled: () => queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) }),
   })

   type DndEvent = { reviewId: string; commentId: number; parentCommentId: number; commentIndex: number }
   const [{ isDragging }, drag] = useDrag(
      () => ({
         type: 'ReorderComment',
         item: {
            reviewId,
            commentId: detailedComment.id,
            parentCommentId: detailedComment.parentCommentId,
            commentIndex: detailedComment.commentIndex,
         },
         canDrag: isEditable,
         collect: monitor => ({
            isDragging: !!monitor.isDragging(),
         }),
      }),
      [isEditable, reviewId, detailedComment.id, detailedComment.parentCommentId]
   )

   const [{ isOver, canDrop }, drop] = useDrop(
      () => ({
         accept: 'ReorderComment',
         canDrop: (item: DndEvent) =>
            item.parentCommentId === detailedComment.parentCommentId &&
            item.commentId !== detailedComment.id &&
            item.reviewId === reviewId,
         drop: (item: DndEvent) => {
            mutate({ input: { reviewId, commentId: item.commentId, index: detailedComment.commentIndex } })
         },
         collect: monitor => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
         }),
      }),
      [reviewId, detailedComment.parentCommentId, detailedComment.id, detailedComment.commentIndex]
   )

   const childComments = useChildCommentsQuery(reviewId, detailedComment.id)

   const isCollaborator = useIsCurrentUserCollaborator(reviewId)

   const { playTrackOffset, playArtist, playPlaylistIndexOffset, playAlbumIndexOffset } = usePlayMutation({
      onError: () => toast.error(`Failed to play ${name}.`),
   })

   const playDoubleClick = () => {
      if (!entityId || !entityType) return
      if (entityType === 'Track') {
         playTrackOffset(entityId, 0)
      } else if (entityType === 'Artist') {
         playArtist(entityId)
      } else if (entityType === 'Playlist') {
         playPlaylistIndexOffset(entityId, 0)
      } else if (entityType === 'Album') {
         playAlbumIndexOffset(entityId, 0)
      }
   }

   const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>
   useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: playDoubleClick })

   return (
      <>
         <div
            ref={el => {
               drop(el)
               drag(el)
            }}
            className={cn(
               isDragging ?? 'opacity-50',
               isOver && canDrop ? 'bg-base-300' : 'bg-base-200',
               'rounded-lg p-2 text-base-content shadow md:p-4 '
            )}
         >
            <div>
               <div className='grid grid-cols-2'>
                  <div className='flex items-center space-x-1 '>
                     <div className='flex-shrink-0'>
                        <UserAvatar name={commenterName ?? commenterId} image={avatar} className='h-10 w-10' />
                     </div>
                     <div className='min-w-0 flex-1'>
                        <p className='space-x-1 text-sm font-medium text-base-content'>
                           <a className=''>{commenterName}</a>
                           <a className='hidden text-xs text-base-content/50 md:inline'>
                              <time dateTime={detailedComment?.updatedAt}>{createdAt}</time>
                           </a>
                        </p>
                        <p className='text-sm text-base-content/50'>
                           <Link
                              to={`/app/user/${commenterId}`}
                              className='text-xs text-base-content/50 hover:underline'
                           >
                              @{commenterId}
                           </Link>
                        </p>
                     </div>
                  </div>

                  <div className='flex items-center justify-between space-x-1'>
                     <div className='flex items-center space-x-1' ref={playOnDoubleClickRef}>
                        <div className='avatar ml-1'>
                           <div className='h-10 w-10'>
                              <img src={image} />
                           </div>
                        </div>
                        <div className='min-w-0 flex-1 overflow-hidden'>
                           <p className='select-none truncate p-0.5 text-sm'> {name} </p>
                        </div>
                        <ListenOnSpotifyIcon entityId={entityId} entityType={entityType} />
                     </div>
                     <div className='flex flex-shrink-0 self-center'>
                        <CommentMenu reviewId={reviewId} comment={detailedComment} />
                     </div>
                  </div>
               </div>
            </div>

            <article className='prose p-1 py-2 text-sm md:text-base lg:p-2'>
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
                        <span className='hidden font-medium text-base-content/50 md:inline'>Find</span>
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
                        <span className='hidden font-medium text-base-content/50 md:inline'>
                           {childComments.length}
                        </span>
                        <span className='sr-only'>replies</span>
                     </button>
                  </span>
               </div>
               {isCollaborator && (
                  <div className='flex text-sm'>
                     <span className='inline-flex items-center text-sm'>
                        <button
                           type='button'
                           className='inline-flex space-x-2 text-base-content/50 hover:text-base-content'
                           onClick={replyComment}
                        >
                           <ChatBubbleOvalLeftEllipsisIcon className='h-5 w-5' aria-hidden='true' />
                           <span className='hidden font-medium text-base-content/50 md:inline'>Reply</span>
                        </button>
                     </span>
                  </div>
               )}
            </div>
         </div>

         {childComments.length > 0 && isExpanded ? (
            <div className='mt-1 ml-2 space-y-1 lg:ml-4'>
               {childComments.map(child => (
                  <DetailedComment key={child.id} review={review} comment={child} />
               ))}
            </div>
         ) : null}
      </>
   )
}

const useChildCommentsQuery = (reviewId: string, commentId: number) => {
   const { data } = useDetailedReviewCommentsQuery(
      { reviewId },
      {
         select: data =>
            (data?.review?.comments?.filter(c => c.parentCommentId === commentId) ?? []).sort(
               (a, b) => a.commentIndex - b.commentIndex
            ),
      }
   )
   return data ?? []
}

const CommentMenu = ({ reviewId, comment }: { reviewId: string; comment: DetailedCommentFragment }) => {
   const currentUserId = useCurrentUserId()
   const isEditable = comment.commenter?.id === currentUserId

   const openDelete = useOpenDeleteConfirmation({ reviewId, commentId: comment.id })

   const entityId = comment.entities?.at(0)?.id
   const entityType = comment.entities?.at(0)?.__typename as EntityType | undefined

   const openEdit = useOpenUpdateComment({
      reviewId,
      commentId: comment.id,
      comment: comment.comment ?? '',
      trackId: entityId ?? '',
   })

   const spotifyLink = getLink(entityId, entityType)
   const spotifyIcon = useSpotifyIcon()

   return (
      <>
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
                     <Menu.Item>
                        {({ active }) => (
                           <a
                              href={spotifyLink}
                              rel='noreferrer'
                              target='_blank'
                              className={cn(active ? 'bg-neutral-focus' : '', 'flex px-4 py-2 text-sm')}
                           >
                              <img src={spotifyIcon} className={'mr-3 h-5 w-5'} />
                              <span>Listen on Spotify </span>
                           </a>
                        )}
                     </Menu.Item>
                     {isEditable && (
                        <>
                           <Menu.Item>
                              {({ active }) => (
                                 <div
                                    className={cn(active ? 'bg-neutral-focus' : '', 'flex px-4 py-2 text-sm')}
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
                                    className={cn(active ? 'bg-neutral-focus' : '', 'flex px-4 py-2 text-sm')}
                                    onClick={openDelete}
                                 >
                                    <TrashIcon className='mr-3 h-5 w-5' aria-hidden='true' />
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
      </>
   )
}
