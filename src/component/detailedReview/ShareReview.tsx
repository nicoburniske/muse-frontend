import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Combobox, Dialog } from '@headlessui/react'
import {
   AccessLevel,
   CollaboratorFragment,
   SearchUsersQuery,
   useProfileAndReviewsQuery,
   useSearchUsersQuery,
   useShareReviewMutation,
} from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { ThemeModal } from 'platform/component/ThemeModal'
import useStateWithReset from 'platform/hook/useStateWithReset'
import Portal from 'platform/component/Portal'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowUturnLeftIcon, CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { cn, nonNullable } from 'util/Utils'
import { useCurrentUserId } from 'state/CurrentUser'

export interface ShareReviewProps {
   reviewId: string
   collaborators: CollaboratorFragment[]
   onChange?: () => void
   children: ReactNode
}

export function ShareReview({ reviewId, onChange, collaborators: collabProp, children }: ShareReviewProps) {
   const [accessLevel, setAccessLevel, resetAccessLevel] = useStateWithReset<AccessLevel>('Viewer')
   const [username, setUsername, resetUsername] = useStateWithReset('')
   const [isModalOpen, setModalOpen, resetModalOpen] = useStateWithReset(false)
   const [collaborators, setCollaborators, resetCollaborators] = useStateWithReset(collabProp)

   useEffect(() => {
      setCollaborators(collabProp)
   }, [collabProp, setCollaborators])

   const queryClient = useQueryClient()
   const resetReviewOverviews = () => queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())

   const { mutate: shareReview, isLoading } = useShareReviewMutation({
      onError: () => toast.error('Failed to update review sharing.'),
      onSuccess: () => {
         if (onChange) {
            onChange()
         }
         resetReviewOverviews()
         reset()
         toast.success('Updated review sharing.', { id: 'share-review-toast' })
      },
   })

   const onSubmit = async () => {
      const addCollaborator = (() => {
         if (username.length !== 0) {
            const variables = { input: { reviewId, accessLevel, userId: username } }
            return shareReview(variables)
         } else {
            return Promise.resolve(null)
         }
      })()

      // Delete all removed collaborators.
      const removeCollaborators = collabProp
         .filter(c => !collaborators.find(c2 => c2.user.id === c.user.id))
         .map(c => ({ input: { reviewId, userId: c.user.id } }))
         .map(variables => shareReview(variables))

      try {
         await Promise.all([addCollaborator, ...removeCollaborators])
      } catch (e) {
         toast.error('Failed to update review sharing.')
      }
   }
   const reset = () => {
      resetAccessLevel()
      resetUsername()
      resetCollaborators()
   }

   const onCancel = () => {
      reset()
      resetModalOpen()
   }

   const disabledUndo = useMemo(() => collaborators.length === collabProp.length, [collaborators, collabProp])

   const disabled = useMemo(() => isLoading || (username.length === 0 && disabledUndo), [username, disabledUndo])

   return (
      <>
         <Portal>
            <ThemeModal open={isModalOpen} className='min-h-96 h-fit w-96 '>
               <div className='flex flex-col items-center justify-between space-y-2 p-3'>
                  <Dialog.Title className='text-lg font-bold'>Share Review</Dialog.Title>

                  {collabProp.length > 0 && (
                     <>
                        <div className='form-control w-full'>
                           <label className='label'>
                              <span className='label-text font-bold'> Shared With </span>
                           </label>
                           {/* TODO: do I need this color? */}
                           <ul className='menu h-32 flex-nowrap divide-y divide-base-200 overflow-y-scroll bg-base-200'>
                              {collaborators.map(c => (
                                 <li key={c.user.id}>
                                    <div className='group grid grid-cols-7'>
                                       <p className='col-span-3 truncate'>{c.user.id}</p>
                                       <p className='col-span-3 basis-full'>{c.accessLevel}</p>
                                       <button
                                          className='btn btn-error btn-xs col-span-1 justify-self-end opacity-0 group-hover:opacity-100'
                                          onClick={() =>
                                             setCollaborators(collaborators.filter(c2 => c2.user.id !== c.user.id))
                                          }
                                       >
                                          <XMarkIcon className='h-4 w-4' />
                                       </button>
                                    </div>
                                 </li>
                              ))}
                           </ul>
                        </div>
                        <div className='divider-primary divider' />
                     </>
                  )}
                  <SearchUsersComboBox onSelect={(userId: string) => setUsername(userId)} />
                  <div className='form-control w-full'>
                     <label className='label'>
                        <span className='label-text font-bold'>Access Level</span>
                     </label>
                     <select
                        value={accessLevel}
                        onChange={e => setAccessLevel(e.target.value as AccessLevel)}
                        className='select select-bordered w-full'
                     >
                        {(['Viewer', 'Collaborator'] as AccessLevel[]).map(a => (
                           <option key={a} value={a}>
                              {a}
                           </option>
                        ))}
                     </select>
                  </div>
                  <div className='flex w-full flex-row items-center justify-around'>
                     <button className='btn btn-success disabled:btn-outline' onClick={onSubmit} disabled={disabled}>
                        <span className='hidden md:block'>Confirm</span>
                        <CheckIcon className='h-5 w-5' />
                     </button>

                     <button
                        className='btn btn-info gap-2'
                        disabled={disabledUndo}
                        onClick={() => setCollaborators(collabProp)}
                     >
                        <span className='hidden md:block'>Undo</span>
                        <ArrowUturnLeftIcon className='h-5 w-5' />
                     </button>
                     <button className='btn btn-info gap-2' onClick={onCancel}>
                        <span className='hidden md:block'>Cancel</span>
                        <XMarkIcon className='h-5 w-5' />
                     </button>
                  </div>
               </div>
            </ThemeModal>
         </Portal>
         <button className='muse-share btn btn-primary btn-sm lg:btn-md' onClick={() => setModalOpen(true)}>
            {children}
         </button>
      </>
   )
}

const SearchUsersComboBox = ({ onSelect }: { onSelect: (userId: string) => void }) => {
   const [query, setQuery] = useState('')
   const [selectedPerson, setSelectedPerson] = useState<UserIdName | null>(null)
   const setBoth = (person: UserIdName | null) => {
      if (person) {
         onSelect(person.id)
      }
      setSelectedPerson(person)
   }
   const users = useSearchUsersToShare(query)

   return (
      <Combobox as='div' value={selectedPerson} onChange={setBoth} className='w-full text-base-content'>
         <Combobox.Label className='block text-sm font-medium'>Share with</Combobox.Label>
         <div className='relative mt-1'>
            <Combobox.Input
               className='w-full rounded-md border border-base-content/50 bg-base-100 py-2 pl-3 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm'
               onChange={event => setQuery(event.target.value)}
               // @ts-ignore
               displayValue={(person: UserIdName) => {
                  if (person) {
                     return person?.displayName ?? person.id
                  }
                  return ''
               }}
            />
            <Combobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
               <ChevronUpDownIcon className='h-5 w-5 ' aria-hidden='true' />
            </Combobox.Button>

            {users.length > 0 && (
               <Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-300 py-1 text-base shadow-lg ring-1 ring-base-300 ring-opacity-5 focus:outline-none sm:text-sm'>
                  {users.map(person => (
                     <Combobox.Option
                        key={person.id}
                        value={person}
                        className={({ active }) =>
                           cn(
                              'relative cursor-default select-none py-2 pl-3 pr-9',
                              active ? 'bg-primary text-primary-content' : ''
                           )
                        }
                     >
                        {({ active, selected }) => (
                           <>
                              <div className='flex'>
                                 <span className={cn('truncate', selected && 'font-semibold')}>
                                    {person.displayName ?? person.id}
                                 </span>
                                 <span
                                    className={cn(
                                       'ml-2 truncate',
                                       active ? 'text-primary-content' : 'text-base-content/50'
                                    )}
                                 >
                                    @{person.id}
                                 </span>
                              </div>

                              {selected && (
                                 <span
                                    className={cn(
                                       'absolute inset-y-0 right-0 flex items-center pr-4',
                                       active ? 'text-primary-content' : ''
                                    )}
                                 >
                                    <CheckIcon className='h-5 w-5' aria-hidden='true' />
                                 </span>
                              )}
                           </>
                        )}
                     </Combobox.Option>
                  ))}
               </Combobox.Options>
            )}
         </div>
      </Combobox>
   )
}

type UserIdName = {
   id: string
   displayName?: string
}
const useSearchUsersToShare = (search: string): UserIdName[] => {
   const debouncedSearch = useDebounce(search, 500)
   const currentUserId = useCurrentUserId()

   const { data: users } = useSearchUsersQuery(
      { search: debouncedSearch },
      {
         enabled: debouncedSearch.length > 0,
         staleTime: 1 * 60 * 1000,
      }
   )

   return (
      users?.searchUser
         ?.map(u => u.spotifyProfile)
         .filter(nonNullable)
         ?.filter(u => u.id !== currentUserId) ?? []
   )
}
function useDebounce<T>(value: T, delay?: number): T {
   const [debouncedValue, setDebouncedValue] = useState(value)

   useEffect(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

      return () => {
         clearTimeout(timer)
      }
   }, [value, delay])

   return debouncedValue
}

// const { mutate: copy } = useCopyToClipboard({ onSuccess: () => toast.success('Copied to clipboard!') })
// const copyLink = () => copy(`https://muselabs.xyz/app/reviews/${reviewId}`)

// <button className='btn btn-info gap-2' onClick={copyLink}>
//    <ClipboardDocumentCheckIcon className='h-5 w-5' />
// </button>
