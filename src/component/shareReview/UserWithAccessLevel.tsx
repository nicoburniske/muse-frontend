import { flip, useFloating } from '@floating-ui/react'
import { Listbox, Portal, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { useInvalidateDetailedReviewCache, useIsReviewOwner } from 'state/useDetailedReviewCacheQuery'
import { AccessLevel, CollaboratorFragment, useShareReviewMutation } from 'graphql/generated/schema'
import { Fragment } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useCurrentUserId } from 'state/CurrentUser'
import { useThemeValue } from 'state/UserPreferences'
import { cn } from 'util/Utils'

type ShareOption = {
   value: AccessLevel
   description: string
}
const ShareOptions: ShareOption[] = [
   { value: 'Viewer', description: 'Can view the review, but not edit it.' },
   { value: 'Collaborator', description: 'Can view and make comments on review.' },
]

export const UserWithAccessLevel = ({ user, reviewId }: { user: CollaboratorFragment; reviewId: string }) => {
   const accessLevel = user.accessLevel
   const displayName = user.user.spotifyProfile?.displayName ?? user.user.id ?? ''

   const invalidate = useInvalidateDetailedReviewCache(reviewId)

   const { mutate: shareReview } = useShareReviewMutation({
      onError: () => toast.error('Failed to update review sharing.'),
      onSuccess: () => {
         toast.success('Updated review sharing.', { id: 'share-review-toast' })
         invalidate()
      },
   })

   const setAccessLevel = (accessLevel: AccessLevel) => {
      if (accessLevel !== user.accessLevel) {
         shareReview({ input: { reviewId, userId: user.user.id, accessLevel } })
      }
   }

   const removeUser = () => {
      shareReview({ input: { reviewId, userId: user.user.id } })
   }

   const theme = useThemeValue()
   const { x, y, strategy, refs } = useFloating({
      placement: 'right-start',
      strategy: 'absolute',
      middleware: [flip()],
   })

   const currentUserId = useCurrentUserId()
   const isEditable = useIsReviewOwner(reviewId, currentUserId)

   return (
      <Listbox value={accessLevel} onChange={setAccessLevel}>
         {({ open }) => (
            <>
               <Listbox.Label className='sr-only'> Change published status </Listbox.Label>
               <div className='relative'>
                  <div className='divide-primary-content/50 inline-flex w-full justify-between divide-x rounded-md bg-primary shadow-sm '>
                     <div className='text-primary-content inline-flex flex-1 items-center justify-between rounded-l-md border border-transparent py-2 pl-3 pr-4 shadow-sm'>
                        <Link to={`/app/user/${user.user.id}`}>
                           <p className='ml-1 text-sm font-medium'>{displayName} </p>
                        </Link>
                        <span className='badge badge-secondary'>{accessLevel}</span>
                     </div>
                     <Listbox.Button
                        disabled={!isEditable}
                        className='text-primary-content hover:bg-primary-focus inline-flex flex-none items-center rounded-l-none rounded-r-md p-2 text-sm font-medium focus:outline-none'
                     >
                        <span className='sr-only'>Change shared status</span>
                        <ChevronDownIcon
                           className='text-primary-content h-5 w-5'
                           aria-hidden='true'
                           ref={refs.setReference}
                        />
                     </Listbox.Button>
                  </div>
                  <Portal>
                     <Transition
                        show={open}
                        as={Fragment}
                        data-theme={theme}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                     >
                        <Listbox.Options
                           ref={refs.setFloating}
                           style={{
                              position: strategy,
                              top: y ?? 0,
                              left: x ?? 0,
                              zIndex: 100,
                              width: 'max-content',
                           }}
                           className='-opacity-5 ring-base-300 flex w-72 origin-top-right flex-col items-start divide-y divide-foreground/50 overflow-hidden rounded-md bg-background shadow-lg ring-1 focus:outline-none '
                        >
                           <>
                              {ShareOptions.map(option => (
                                 <Listbox.Option
                                    key={option.value}
                                    className={({ active }) =>
                                       cn(
                                          active ? 'text-primary-content bg-primary' : 'text-foreground',
                                          'w-full cursor-default select-none p-4 text-sm'
                                       )
                                    }
                                    value={option.value}
                                 >
                                    {({ selected, active }) => (
                                       <div className='flex flex-col'>
                                          <div className='flex justify-between'>
                                             <p className={'font-semibold'}>{option.value}</p>
                                             {selected ? (
                                                <span
                                                   className={
                                                      active ? 'text-primary-content bg-primary' : 'text-foreground'
                                                   }
                                                >
                                                   <CheckIcon className='h-5 w-5' aria-hidden='true' />
                                                </span>
                                             ) : null}
                                          </div>
                                          <p
                                             className={cn(
                                                active ? 'text-primary-content bg-primary' : 'text-foreground'
                                             )}
                                          >
                                             {option.description}
                                          </p>
                                       </div>
                                    )}
                                 </Listbox.Option>
                              ))}
                              <div className='grid w-full place-items-center self-center '>
                                 <button className='btn btn-error m-2' onClick={removeUser}>
                                    Remove Collaborator
                                 </button>
                              </div>
                           </>
                        </Listbox.Options>
                     </Transition>
                  </Portal>
               </div>
            </>
         )}
      </Listbox>
   )
}
