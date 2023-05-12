import { Combobox } from '@headlessui/react'
import { ArrowPathIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

import { UserAvatar } from '@/component/avatar/UserAvatar'
import { useSearchUsersQuery } from '@/graphql/generated/schema'
import useDebounce from '@/lib/hook/useDebounce'
import { useCurrentUserId } from '@/state/CurrentUser'
import { cn, nonNullable } from '@/util/Utils'

export const SearchUsersComboBox = ({ onSelect }: { onSelect: (userId: string) => void }) => {
   const [query, setQuery] = useState('')
   const [selectedPerson, setSelectedPerson] = useState<UserIdName | null>(null)
   const setBoth = (person: UserIdName | null) => {
      if (person) {
         onSelect(person.id)
      }
      setSelectedPerson(person)
   }
   const { users, isLoading } = useSearchUsersToShare(query)

   return (
      <Combobox as='div' value={selectedPerson} onChange={setBoth} className='w-full text-foreground'>
         <Combobox.Label className='block text-sm font-medium'>Share With</Combobox.Label>
         <div className='relative mt-1'>
            <Combobox.Input
               className='flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
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
               {isLoading ? (
                  <ArrowPathIcon className={cn('h-4 w-4 animate-spin')} aria-hidden='true' />
               ) : (
                  <ChevronUpDownIcon className='h-4 w-4 opacity-50' aria-hidden='true' />
               )}
            </Combobox.Button>

            {users.length > 0 && (
               <Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover py-1 text-base text-popover-foreground shadow-lg sm:text-sm'>
                  {users.map(person => (
                     <Combobox.Option key={person.id} value={person} className={() => cn('cursor-default select-none')}>
                        {({ active, selected }) => (
                           <div
                              className={cn(
                                 'relative mx-1 flex w-[98%] items-center justify-between rounded-md p-1',
                                 active ? 'bg-accent text-accent-foreground' : ''
                              )}
                           >
                              <div className='mr-5 flex items-center gap-4 '>
                                 <UserAvatar
                                    name={person.displayName ?? person.id}
                                    image={person.images.at(-1)}
                                    className='h-10 w-10'
                                 />
                                 <span className={cn('truncate')}>{person.displayName ?? person.id}</span>
                              </div>

                              {selected ? (
                                 <span
                                    className={cn(
                                       'absolute inset-y-0 right-0 flex items-center pr-4',
                                       active ? 'text-foreground' : 'text-foreground/50'
                                    )}
                                 >
                                    <CheckIcon className='h-5 w-5' aria-hidden='true' />
                                 </span>
                              ) : (
                                 <div />
                              )}
                           </div>
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
const useSearchUsersToShare = (search: string) => {
   const debouncedSearch = useDebounce(search, 500)
   const currentUserId = useCurrentUserId()
   const enabled = debouncedSearch.length > 2

   const { data: users, isLoading } = useSearchUsersQuery(
      { search: debouncedSearch },
      {
         enabled,
         staleTime: 10000,
      }
   )

   return {
      users:
         users?.searchUser
            ?.map(u => u.spotifyProfile)
            .filter(nonNullable)
            ?.filter(u => u.id !== currentUserId) ?? [],
      isLoading: isLoading && enabled,
   }
}
