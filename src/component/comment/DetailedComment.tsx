import {
   ChatBubbleLeftEllipsisIcon,
   ChatBubbleOvalLeftEllipsisIcon,
   EllipsisVerticalIcon,
   MagnifyingGlassCircleIcon,
   PencilIcon,
   TrashIcon,
} from '@heroicons/react/24/outline'
import { useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { RefObject, useCallback, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { UserAvatar } from '@/component/avatar/UserAvatar'
import { useOpenNewComment } from '@/component/commentForm/useOpenNewComment'
import { useOpenUpdateComment } from '@/component/commentForm/useOpenUpdateComment'
import { getLink, useSpotifyIcon } from '@/component/ListenOnSpotify'
import { usePlayMutation } from '@/component/sdk/ClientHooks'
import { ReviewOverview } from '@/component/trackTable/Helpers'
import {
   DetailedCommentFragment,
   EntityType,
   useDetailedReviewCommentsQuery,
   useUpdateCommentIndexMutation,
} from '@/graphql/generated/schema'
import { Button } from '@/lib/component/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/lib/component/DropdownMenu'
import useDoubleClick from '@/lib/hook/useDoubleClick'
import { useCurrentUserId } from '@/state/CurrentUser'
import { selectedTrackAtom } from '@/state/SelectedTrackAtom'
import { useIsCurrentUserCollaborator } from '@/state/useDetailedReviewCacheQuery'
import { cn, findFirstImage } from '@/util/Utils'

import CommentMarkdown from './CommentMarkdown'
import { useOpenDeleteConfirmation } from './DeleteCommentConfirmation'

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
   const reply = useOpenNewComment()
   const replyComment = () =>
      reply({
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
               isDragging ? 'opacity-50' : '',
               isOver && canDrop ? 'border-foreground' : '',
               'rounded-md border bg-card p-2 text-foreground shadow md:p-4'
            )}
         >
            <div>
               <div className='grid grid-cols-2'>
                  <div className='flex items-center space-x-1 '>
                     <div className='flex-shrink-0'>
                        <UserAvatar name={commenterName ?? commenterId} image={avatar} className='h-10 w-10' />
                     </div>
                     <div className='min-w-0 flex-1'>
                        <p className='space-x-1 text-sm font-medium text-foreground'>
                           <a className=''>{commenterName}</a>
                           <a className='hidden text-xs text-muted-foreground md:inline'>
                              <time dateTime={detailedComment?.updatedAt}>{createdAt}</time>
                           </a>
                        </p>
                        <p className='text-xs text-muted-foreground'>
                           <Link to={`/app/user/${commenterId}`} className='hover:underline'>
                              @{commenterId}
                           </Link>
                        </p>
                     </div>
                  </div>

                  <div className='flex items-center justify-between space-x-1'>
                     <div className='flex min-w-0 items-center space-x-1' ref={playOnDoubleClickRef}>
                        <div className='h-10 w-10 flex-none'>
                           <img src={image} />
                        </div>
                        <p className='min-w-0 select-none truncate p-0.5 text-sm'> {name} </p>
                     </div>
                     <div className='flex flex-shrink-0 self-center'>
                        <CommentMenu reviewId={reviewId} comment={detailedComment} />
                     </div>
                  </div>
               </div>
            </div>

            <article className='prose p-1 py-2 text-sm text-card-foreground md:text-base lg:p-2'>
               <CommentMarkdown comment={comment} trackId={detailedComment?.entities?.at(0)?.id!} />
            </article>
            <div className='mt-6 flex justify-between'>
               <div className='flex gap-x-6'>
                  <Button
                     variant='svg'
                     size='empty'
                     onClick={selectTrack}
                     className='hidden space-x-2 text-sm md:inline-flex'
                  >
                     <MagnifyingGlassCircleIcon className='h-5 w-5' aria-hidden='true' />
                     <span className='font-medium'>Find</span>
                     <span className='sr-only'>Find Track</span>
                  </Button>
                  <Button
                     variant='svg'
                     size='empty'
                     onClick={() => setIsExpanded(!isExpanded)}
                     className='space-x-2 text-sm'
                  >
                     <ChatBubbleLeftEllipsisIcon className='h-5 w-5' aria-hidden='true' />
                     <span className='font-medium'>{childComments.length}</span>
                     <span className='sr-only'>replies</span>
                  </Button>
               </div>
               {isCollaborator && (
                  <Button variant='svg' size='empty' onClick={replyComment} className='space-x-2 text-sm'>
                     <ChatBubbleOvalLeftEllipsisIcon className='h-5 w-5' aria-hidden='true' />
                     <span className='font-medium'>Reply</span>
                  </Button>
               )}
            </div>
         </div>

         {childComments.length > 0 && isExpanded ? (
            <div className='ml-2 mt-1 space-y-1 lg:ml-4'>
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

   const entityId = comment.entities?.at(0)?.id
   const entityType = comment.entities?.at(0)?.__typename as EntityType | undefined

   const spotifyLink = getLink(entityId, entityType)
   const spotifyIcon = useSpotifyIcon()

   const openEdit = useOpenUpdateComment({
      reviewId,
      commentId: comment.id,
      comment: comment.comment ?? '',
      trackId: entityId ?? '',
   })

   const [open, setOpen] = useState(false)
   const editComment = () => {
      setOpen(false)
      openEdit()
   }

   const openDelete = useOpenDeleteConfirmation()
   const openDeleteComment = () => openDelete({ reviewId, commentId: comment.id })

   const deleteComment = () => {
      setOpen(false)
      openDeleteComment()
   }

   return (
      <DropdownMenu open={open} onOpenChange={open => setOpen(open)}>
         <DropdownMenuTrigger asChild>
            <Button size='square' variant='svg' className='p-1'>
               <span className='sr-only'>Open comment menu</span>
               <EllipsisVerticalIcon className='h-5 w-5' aria-hidden='true' />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent>
            <DropdownMenuItem>
               <img src={spotifyIcon} className={'mr-3 h-5 w-5'} />
               <a href={spotifyLink} rel='noreferrer' target='_blank' className={cn('')}>
                  Listen on Spotify
               </a>
            </DropdownMenuItem>
            {isEditable && (
               <>
                  <DropdownMenuItem onClick={editComment}>
                     <PencilIcon className='mr-3 h-5 w-5 ' aria-hidden='true' />
                     <span>Edit comment</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={deleteComment}>
                     <TrashIcon className='mr-3 h-5 w-5 ' aria-hidden='true' />
                     <span>Delete comment</span>
                  </DropdownMenuItem>
               </>
            )}
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
