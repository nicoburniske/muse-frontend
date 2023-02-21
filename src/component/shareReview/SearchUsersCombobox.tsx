import { Combobox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useSearchUsersQuery } from 'graphql/generated/schema'
import useDebounce from 'platform/hook/useDebounce'
import { useState } from 'react'
import { useCurrentUserId } from 'state/CurrentUser'
import { cn, nonNullable } from 'util/Utils'

export const SearchUsersComboBox = ({ onSelect }: { onSelect: (userId: string) => void }) => {
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
         <Combobox.Label className='block text-sm font-medium'>Share With</Combobox.Label>
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
         enabled: debouncedSearch.length > 2,
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
