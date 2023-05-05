import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Fragment, ReactNode } from 'react'

import { cn } from '@/util/Utils'

type SelectManyProps<T> = {
   selected: T[]
   allOptions: readonly T[]
   onChange: (s: T[]) => void
   createKey: (t: T) => string
   renderOption: (t: T) => ReactNode
   renderSelected: (t: T[]) => string
}

const SelectMany = <T,>({
   selected,
   allOptions,
   onChange,
   createKey,
   renderOption,
   renderSelected,
}: SelectManyProps<T>) => {
   return (
      <Listbox value={selected} multiple onChange={onChange}>
         {({ open }) => (
            <>
               <Listbox.Button className='relative flex h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                  <span className='block truncate text-foreground'>{renderSelected(selected)}</span>
                  <ChevronDownIcon className='h-4 w-4 opacity-50' />
               </Listbox.Button>

               <Transition
                  show={open}
                  as={Fragment}
                  enter='transition ease-in duration-150'
                  enterFrom='opacity-80'
                  enterTo='opacity-100'
               >
                  <Listbox.Options
                     className={cn(
                        'ring-neutral absolute z-10 mt-1 max-h-80 overflow-auto rounded-md py-1 shadow-md',
                        'border bg-popover text-popover-foreground'
                     )}
                  >
                     {allOptions.map(option => (
                        <Listbox.Option
                           key={createKey(option)}
                           className={({ disabled }) =>
                              cn(
                                 'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
                                 disabled ? 'pointer-events-none opacity-50' : ''
                              )
                           }
                           value={option}
                        >
                           {({ selected }) => (
                              <>
                                 {selected ? (
                                    <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
                                       <CheckIcon className='h-4 w-4' />
                                    </span>
                                 ) : null}
                                 <span className={cn('block text-clip')}>{renderOption(option)}</span>
                              </>
                           )}
                        </Listbox.Option>
                     ))}
                  </Listbox.Options>
               </Transition>
            </>
         )}
      </Listbox>
   )
}

export default SelectMany
