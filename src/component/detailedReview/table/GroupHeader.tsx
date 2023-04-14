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

   const isChild = reviewId !== parentReviewId
   const gridStyle = 'grid-cols-5'
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
            {isChild ? (
               <div className='flex flex-row justify-self-center md:space-x-5'>
                  <button className='btn btn-square btn-secondary btn-sm' onClick={() => linkToReviewPage()}>
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
                     <button className='btn btn-square btn-secondary btn-sm' onClick={e => setIsDeleting(e)(true)}>
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

const HeaderMenu = () => {
   const theme = useThemeValue()
   const { x, y, strategy, refs } = useFloating({
      placement: 'right-start',
      strategy: 'absolute',
      middleware: [flip()],
   })

   return (
      <Menu>
         {({ open }) => (
            <>
               <Menu.Button
                  ref={refs.setReference}
                  className={cn(
                     'btn btn-square btn-ghost btn-sm place-items-center',
                     open ? 'opacity-100' : 'opacity-100 group-hover:opacity-100 hover:opacity-100 sm:opacity-0'
                  )}
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
                                    rel='noreferrer'
                                    target='_blank'
                                    href={spotifyUrl}
                                 >
                                    Listen on Spotify
                                 </a>
                              </li>
                           )}
                        </Menu.Item>

                        <Menu.Item>
                           {({ active }) => (
                              <li>
                                 <a className={cn(active ? 'active' : '', 'text-sm')} onClick={addToQueue}>
                                    Add To Queue
                                 </a>
                              </li>
                           )}
                        </Menu.Item>

                        {isUserOwnedPlaylist && (
                           <Menu.Item>
                              {({ active }) => (
                                 <li>
                                    <a className={cn(active ? 'active' : '', 'text-sm')} onClick={removeFromPlaylist}>
                                       Remove From Playlist
                                    </a>
                                 </li>
                              )}
                           </Menu.Item>
                        )}
                     </Menu.Items>
                  </Transition>
               </Portal>
            </>
         )}
      </Menu>
   )
}
