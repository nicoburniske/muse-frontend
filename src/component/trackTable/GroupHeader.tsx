import { ArrowTopRightOnSquareIcon, EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useQueryClient } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Fragment, useMemo, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'

import {
   useDeleteReviewLinkMutation,
   useDetailedReviewQuery,
   useUpdateReviewLinkMutation,
} from '@/graphql/generated/schema'
import { Badge } from '@/lib/component/Badge'
import { Button } from '@/lib/component/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/lib/component/Dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/lib/component/DropdownMenu'
import { cn } from '@/util/Utils'

import { HeaderData, ReviewOverview } from './Helpers'
import { reviewOrderAtom, swapReviewsAtom } from './TableAtoms'

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

   const dragClass = isDragging ? 'opacity-20' : isOver ? 'border-primary' : ''

   const entityImage = entity.images.at(-1)

   return (
      <div
         className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', dragClass)}
         ref={el => {
            drop(el)
            drag(el)
         }}
         onClick={onClick}
         onContextMenu={e => e.preventDefault()}
      >
         <div className={cn('flex w-full items-center p-1')}>
            <div className='grid grow grid-cols-2 items-center'>
               <h2 className={'text-md runcate md:text-xl'}>{reviewName}</h2>
               <div className={'flex flex-row items-center justify-start'}>
                  {
                     <div className='avatar hidden md:inline-flex'>
                        <div className='w-12 rounded'>
                           <img src={entityImage} />
                        </div>
                     </div>
                  }
                  <div className='ml-1 flex min-w-0 flex-col items-start gap-0.5 overflow-hidden'>
                     <Badge className='flex min-w-0 truncate'>{entityName}</Badge>
                     <Badge variant='secondary'>{entityType}</Badge>
                  </div>
               </div>
            </div>
            <HeaderMenu reviewId={reviewId} parentReviewId={parentReviewId} />
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

const HeaderMenu = ({ reviewId, parentReviewId }: { reviewId: string; parentReviewId: string }) => {
   const nav = useNavigate()

   const [modalOpen, setModalOpen] = useState(false)

   const [menuOpen, setMenuOpen] = useState(false)

   const setModalOpenSync = (open: boolean) => {
      if (open) {
         setMenuOpen(false)
      }
      setModalOpen(open)
   }

   return (
      <>
         <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger>
               <Button variant='svg' size='empty' className='mr-4'>
                  <EllipsisVerticalIcon className='h-5 w-5' />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={e => e.stopPropagation()}>
               <DropdownMenuItem onClick={() => nav(`/app/reviews/${reviewId}`)}>
                  <ArrowTopRightOnSquareIcon className='mr-3 h-5 w-5' aria-hidden='true' />
                  <span> Open Review </span>
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => setModalOpenSync(true)}>
                  <TrashIcon className='mr-3 h-5 w-5' aria-hidden='true' />
                  <span>Delete Review Link </span>
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
         <DeleteReviewLinkModal
            reviewId={reviewId}
            parentReviewId={parentReviewId}
            modalOpen={modalOpen}
            setModalOpen={setModalOpenSync}
         />
      </>
   )
}

const DeleteReviewLinkModal = ({
   reviewId,
   parentReviewId,
   modalOpen,
   setModalOpen,
}: {
   reviewId: string
   parentReviewId: string
   modalOpen: boolean
   setModalOpen: (open: boolean) => void
}) => {
   const queryClient = useQueryClient()
   const { mutate, isLoading } = useDeleteReviewLinkMutation({
      onSuccess: () => {
         queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId: parentReviewId }))
         toast.success('Deleted review link.')
      },
      onError: () => toast.error('Failed to delete review link'),
   })

   const deleteReviewLink = () => {
      mutate({ input: { childReviewId: reviewId, parentReviewId } })
   }
   return (
      <Dialog open={modalOpen} onOpenChange={open => setModalOpen(open)}>
         <DialogContent onClick={e => e.stopPropagation()}>
            <DialogTitle>Delete Review Link</DialogTitle>
            <DialogDescription>Your reviews will still exist. They'll just be disconnected</DialogDescription>
            <DialogFooter>
               <Button disabled={isLoading} onClick={() => setModalOpen(false)}>
                  Cancel
               </Button>

               <Button disabled={isLoading} onClick={deleteReviewLink} variant={'destructive'}>
                  Delete Link
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}
