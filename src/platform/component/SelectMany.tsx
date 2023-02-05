import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Fragment, ReactNode } from 'react'
import { classNames } from 'util/Utils'

type SelectManyProps<T> = {
   label: string
   selected: T[]
   allOptions: T[]
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
               <Listbox.Label className='block text-base font-bold text-base-content'>{label}</Listbox.Label>
               <div className='relative mt-1'>
                  <Listbox.Button className='focus:primary relative w-full cursor-default rounded-md border border-base-300 bg-base-100 py-2 pl-3 pr-10 text-left shadow-sm ring-primary focus:border-primary focus:outline-none focus:ring-1 sm:text-sm'>
                     <span className='block truncate text-base-content'>{renderSelected(selected)}</span>
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
                     <Listbox.Options className='absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-md bg-base-100 py-1 text-base shadow-lg ring-1 ring-neutral ring-opacity-5 focus:outline-none sm:text-sm'>
                        {allOptions.map(option => (
                           <Listbox.Option
                              key={createKey(option)}
                              className={({ active }) =>
                                 classNames(
                                    active ? 'bg-primary text-primary-content' : 'text-base-content',
                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                 )
                              }
                              value={option}
                           >
                              {({ selected, active }) => (
                                 <>
                                    <span
                                       className={classNames(
                                          selected ? 'font-semibold' : 'font-normal',
                                          'block truncate'
                                       )}
                                    >
                                       {renderOption(option)}
                                    </span>

                                    {selected ? (
                                       <span
                                          className={classNames(
                                             active ? 'text-primary-content' : 'text-base-content',
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
