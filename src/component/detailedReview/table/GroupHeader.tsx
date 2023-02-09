import { useQueryClient } from '@tanstack/react-query'
import { ArrowTopRightIcon, HazardIcon, ReplyIcon, TrashIcon } from 'component/Icons'
import {
   useDeleteReviewLinkMutation,
   useDetailedReviewQuery,
   useUpdateReviewLinkMutation,
} from 'graphql/generated/schema'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { HeaderData, ReviewOverview } from './Helpers'
import { useDrag, useDrop } from 'react-dnd'
import { reviewOrderAtom, swapReviewsAtom } from './TableAtoms'
import { atom, useAtomValue, useSetAtom } from 'jotai'

/**
 * REVIEW HEADER
 */
export type ReviewGroupHeaderProps = {
   parentReviewId: string
   onClick: () => void
   entity: HeaderData
} & ReviewOverview

export const ReviewGroupHeader = ({
   reviewId,
   parentReviewId,
   reviewName,
   entity,
   onClick,
}: ReviewGroupHeaderProps) => {
   const { name: entityName, __typename: entityType } = entity

   const isChild = reviewId !== parentReviewId
   const [isDeleting, setIsDeletingRaw] = useState(false)
   const nav = useNavigate()
   const queryClient = useQueryClient()
   const linkToReviewPage = () => nav(`/app/reviews/${reviewId}`)
   const { mutateAsync: deleteReviewLink } = useDeleteReviewLinkMutation({
      onSuccess: () => {
         setIsDeletingRaw(false)
         queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId: parentReviewId }))
         toast.success('Deleted review link.')
      },
      onError: () => toast.error('Failed to delete review link'),
   })

   const handleDeleteReviewLink = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation()
      deleteReviewLink({ input: { childReviewId: reviewId, parentReviewId } })
   }

   const setIsDeleting = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => (isDeleting: boolean) => {
      e.stopPropagation()
      setIsDeletingRaw(isDeleting)
   }

   const isPlaylist = entityType === 'Playlist'

   const gridStyle = isChild ? (isPlaylist ? 'grid-cols-5' : 'grid-cols-5') : isPlaylist ? 'grid-cols-3' : 'grid-cols-4'
   const nameStyle = isChild ? 'col-span-2' : 'col-span-1'

   const [{ isDragging }, drag] = useDrag(
      () => ({
         type: 'ReviewId',
         item: { reviewId },
         canDrag: isChild,
         collect: monitor => ({
            isDragging: !!monitor.isDragging(),
         }),
      }),
      [isChild, reviewId]
   )

   const swapReviews = useSwapReviews(parentReviewId, reviewId)
   const [{ isOver }, drop] = useDrop(
      () => ({
         accept: 'ReviewId',
         canDrop: (item: { reviewId: string }) => isChild && item.reviewId !== reviewId,
         drop: (item: { reviewId: string }) => {
            swapReviews(item.reviewId)
         },
         collect: monitor => ({
            isOver: !!monitor.isOver(),
         }),
      }),
      [isChild, reviewId]
   )

   const dragClass = isDragging ? 'opacity-20' : isOver ? 'card-bordered border-primary' : ''

   const albumImage = entity.images.at(-1)

   return (
      <div
         className={`card w-full bg-secondary py-0 ${dragClass}`}
         ref={el => {
            drop(el)
            drag(el)
         }}
         onClick={onClick}
      >
         <div className={`grid ${gridStyle} card-body w-full items-center justify-around p-1`}>
            <div className={`${nameStyle}`}>
               <h2 className={'text-md truncate text-secondary-content md:text-xl'}>{reviewName}</h2>
            </div>
            <div className={`${nameStyle} m-auto flex flex-row items-center justify-start`}>
               <div className='badge badge-accent text-center text-accent-content'>{entityType}</div>
               <div className='divider divider-horizontal m-0' />
               {isPlaylist ? null : (
                  <div className='avatar hidden md:inline-flex'>
                     <div className='w-12 rounded'>
                        <img src={albumImage} />
                     </div>
                  </div>
               )}
               <div className='badge badge-primary truncate text-center text-primary-content'>{entityName}</div>
            </div>
            {isChild ? (
               <div className='flex flex-row justify-self-center md:space-x-5'>
                  <button className='btn btn-secondary btn-square btn-sm' onClick={() => linkToReviewPage()}>
                     <ArrowTopRightIcon />
                  </button>
                  {isDeleting ? (
                     <div className='btn-group justify-center'>
                        <button
                           className='btn tooltip tooltip-left btn-error tooltip-error btn-sm'
                           data-tip='remove review link'
                           onClick={e => handleDeleteReviewLink(e)}
                        >
                           <HazardIcon />
                        </button>
                        <button className='btn btn-info btn-sm' onClick={e => setIsDeleting(e)(false)}>
                           <ReplyIcon />
                        </button>
                     </div>
                  ) : (
                     <button className='btn btn-secondary btn-square btn-sm' onClick={e => setIsDeleting(e)(true)}>
                        <TrashIcon />
                     </button>
                  )}
               </div>
            ) : null}
         </div>
      </div>
   )
}

const useSwapReviews = (parentReviewId: string, dropReviewId: string) => {
   const swap = useSetAtom(swapReviewsAtom)
   const dropIndex = useAtomValue(
      useMemo(() => atom(get => get(reviewOrderAtom).indexOf(dropReviewId)), [dropReviewId])
   )

   const queryClient = useQueryClient()
   const { mutateAsync } = useUpdateReviewLinkMutation({
      onSuccess: () => queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId: parentReviewId })),
      onError: () => toast.error('Failed to update review link'),
   })

   return async (dragReviewId: string) => {
      await mutateAsync({ input: { parentReviewId, childReviewId: dragReviewId, linkIndex: dropIndex } })
      swap({ dragReviewId, dropReviewId })
   }
}
