import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Fragment, ReactNode } from 'react'
import { cn } from 'util/Utils'

type SelectManyProps<T> = {
   label: string
   selected: T[]
   allOptions: readonly T[]
   onChange: (s: T[]) => void
   createKey: (t: T) => string
   renderOption: (t: T) => ReactNode
   renderSelected: (t: T[]) => string
}

const SelectMany = <T,>({
   label,
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
               <Listbox.Label className='block text-base font-bold text-foreground'>{label}</Listbox.Label>
               <div className='relative mt-1'>
                  <Listbox.Button className='focus:primary border-base-300 relative w-full cursor-default rounded-md border bg-background py-2 pl-3 pr-10 text-left text-sm shadow-sm ring-primary focus:border-primary focus:outline-none focus:ring-1 md:text-base'>
                     <span className='block truncate text-foreground'>{renderSelected(selected)}</span>
                     <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                        <ChevronUpDownIcon className='h-5 w-5 text-primary' aria-hidden='true' />
                     </span>
                  </Listbox.Button>

                  <Transition
                     show={open}
                     as={Fragment}
                     leave='transition ease-in duration-100'
                     leaveFrom='opacity-100'
                     leaveTo='opacity-0'
                  >
                     <Listbox.Options className='ring-neutral absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-opacity-5 focus:outline-none sm:text-sm'>
                        {allOptions.map(option => (
                           <Listbox.Option
                              key={createKey(option)}
                              className={({ active }) =>
                                 cn(
                                    active ? 'text-primary-content bg-primary' : 'text-foreground',
                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                 )
                              }
                              value={option}
                           >
                              {({ selected, active }) => (
                                 <>
                                    <span
                                       className={cn(
                                          selected ? 'font-semibold' : 'font-normal',
                                          'block text-clip text-sm md:text-base'
                                       )}
                                    >
                                       {renderOption(option)}
                                    </span>

                                    {selected ? (
                                       <span
                                          className={cn(
                                             active ? 'text-primary-content' : 'text-foreground',
                                             'absolute inset-y-0 right-0 flex items-center pr-4'
                                          )}
                                       >
                                          <CheckIcon className='h-5 w-5' aria-hidden='true' />
                                       </span>
                                    ) : null}
                                 </>
                              )}
                           </Listbox.Option>
                        ))}
                     </Listbox.Options>
                  </Transition>
               </div>
            </>
         )}
      </Listbox>
   )
}

export default SelectMany
