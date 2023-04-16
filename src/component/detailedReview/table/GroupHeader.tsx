import { useQueryClient } from '@tanstack/react-query'
import { ArrowTopRightIcon, HazardIcon, ReplyIcon, TrashIcon } from 'component/Icons'
import {
   useDeleteReviewLinkMutation,
   useDetailedReviewQuery,
   useUpdateReviewLinkMutation,
} from 'graphql/generated/schema'
import { Fragment, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { HeaderData, ReviewOverview } from './Helpers'
import { useDrag, useDrop } from 'react-dnd'
import { reviewOrderAtom, swapReviewsAtom } from './TableAtoms'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { cn } from 'util/Utils'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { useThemeValue } from 'state/UserPreferences'
import { flip, useFloating } from '@floating-ui/react'
import Portal from 'platform/component/Portal'
import { ThemeModal } from 'platform/component/ThemeModal'

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

   const dragClass = isDragging ? 'opacity-20' : isOver ? 'card-bordered border-primary' : ''

   const entityImage = entity.images.at(-1)

   return (
      <div
         className={cn('card w-full bg-secondary py-0', dragClass)}
         ref={el => {
            drop(el)
            drag(el)
         }}
         onClick={onClick}
      >
         <div className={cn('flex w-full items-center p-1')}>
            <div className='grid grow grid-cols-2 items-center'>
               <h2 className={'text-md truncate text-secondary-content md:text-xl'}>{reviewName}</h2>
               <div className={'flex flex-row items-center justify-start'}>
                  {
                     <div className='avatar hidden md:inline-flex'>
                        <div className='w-12 rounded'>
                           <img src={entityImage} />
                        </div>
                     </div>
                  }
                  <div className='flex flex-col'>
                     <div className='badge badge-primary truncate text-center text-primary-content'>{entityName}</div>
                     <div className='badge badge-accent text-center text-accent-content'>{entityType}</div>
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
   const theme = useThemeValue()
   const { x, y, strategy, refs } = useFloating({
      placement: 'right-start',
      strategy: 'absolute',
      middleware: [flip()],
   })

   const nav = useNavigate()

   const [modalOpen, setModalOpen] = useState(false)

   return (
      <>
         <Menu>
            {({ open }) => (
               <>
                  <Menu.Button
                     ref={refs.setReference}
                     // Stop handler on header from collapsing/opening.
                     onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => e.stopPropagation()}
                     className={cn('btn btn-square btn-ghost btn-sm place-items-center')}
                  >
                     <EllipsisHorizontalIcon className='h-5 w-5' aria-hidden='true' />
                  </Menu.Button>
                  <Portal>
                     <Transition
                        data-theme={theme}
                        as={Fragment}
                        show={open}
                        enter='transition ease-out duration-100'
                        enterFrom='transform opacity-0 scale-95'
                        enterTo='transform opacity-100 scale-100'
                        leave='transition ease-in duration-75'
                        leaveFrom='transform opacity-100 scale-100'
                        leaveTo='transform opacity-0 scale-95'
                     >
                        <Menu.Items
                           ref={refs.setFloating}
                           style={{
                              position: strategy,
                              top: y ?? 0,
                              left: x ?? 0,
                              zIndex: 100,
                              width: 'max-content',
                           }}
                           className='menu rounded-md bg-neutral text-neutral-content shadow-lg '
                        >
                           <Menu.Item>
                              {({ active }) => (
                                 <li>
                                    <a
                                       className={cn(active ? 'active' : '', 'text-sm')}
                                       onClick={() => nav(`/app/reviews/${reviewId}`)}
                                    >
                                       Open Review
                                    </a>
                                 </li>
                              )}
                           </Menu.Item>

                           <Menu.Item>
                              {({ active }) => (
                                 <li>
                                    <a
                                       className={cn(active ? 'active' : '', 'text-sm')}
                                       onClick={() => setModalOpen(true)}
                                    >
                                       Delete Review Link
                                    </a>
                                 </li>
                              )}
                           </Menu.Item>
                        </Menu.Items>
                     </Transition>
                  </Portal>
               </>
            )}
         </Menu>

         <DeleteReviewLinkModal
            reviewId={reviewId}
            parentReviewId={parentReviewId}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
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
      <Portal>
         <ThemeModal open={modalOpen} className='max-w-md'>
            <div className='bg-base-100 text-base-content shadow sm:rounded-lg'>
               <div className='px-4 py-5 sm:p-6'>
                  <h3 className='text-lg font-medium leading-6 '>Delete Review Link</h3>
                  <div className='mt-2 max-w-xl text-sm'>
                     <p> Your reviews will still exist, they'll just be disconnected.</p>
                  </div>
                  <div className='mt-5 flex w-full flex-row items-center justify-around'>
                     <button
                        type='button'
                        disabled={isLoading}
                        onClick={() => setModalOpen(false)}
                        className={cn('btn btn-primary btn-md', isLoading && 'btn-loading')}
                     >
                        Cancel
                     </button>

                     <button
                        type='button'
                        disabled={isLoading}
                        onClick={deleteReviewLink}
                        className={cn('btn btn-error btn-md', isLoading && 'btn-loading')}
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
