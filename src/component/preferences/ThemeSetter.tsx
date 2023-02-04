import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Fragment } from 'react'
import { Theme, useTheme } from 'state/UserPreferences'
import { classNames } from 'util/Utils'

const ThemeOptions = Object.values(Theme).sort((a, b) => a.localeCompare(b))

export const ThemeSetter = () => {
   const [currentTheme, setTheme] = useTheme()

   return (
      <Listbox value={currentTheme} onChange={t => setTheme(t)}>
         {({ open }) => (
            <div>
               <Listbox.Label className='block text-sm font-bold'>Theme</Listbox.Label>
               <div className='relative'>
                  <Listbox.Button className='relative w-full cursor-default rounded-md border border-base-300 bg-base-100 py-3 pl-3 pr-10 text-left shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm'>
                     <span className='block truncate'>{currentTheme}</span>
                     <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                        <ChevronUpDownIcon className='h-5 w-5 text-base-content' aria-hidden='true' />
                     </span>
                  </Listbox.Button>

                  <Transition
                     show={open}
                     as={Fragment}
                     leave='transition ease-in duration-100'
                     leaveFrom='opacity-100'
                     leaveTo='opacity-0'
                  >
                     <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-300 py-1 text-base shadow-lg ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm'>
                        {ThemeOptions.map(theme => (
                           <Listbox.Option
                              key={theme}
                              className={({ active, selected }) =>
                                 classNames(
                                    active ? 'bg-secondary text-secondary-content' : 'text-base-content',
                                    selected ? 'bg-primary text-primary-content' : 'text-base-content',
                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                 )
                              }
                              value={theme}
                           >
                              {({ selected, active }) => (
                                 <>
                                    <span
                                       className={classNames(
                                          selected ? 'font-semibold' : 'font-normal',
                                          'block truncate'
                                       )}
                                    >
                                       {theme}
                                    </span>

                                    {selected ? (
                                       <span
                                          className={classNames(
                                             active ? 'bg-secondary text-secondary-content' : 'text-base-content',
                                             selected ? 'bg-primary text-primary-content' : 'text-base-content',
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
            </div>
         )}
      </Listbox>
   )
}
