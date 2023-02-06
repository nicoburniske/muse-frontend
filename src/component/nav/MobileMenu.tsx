import { Dialog, Transition } from '@headlessui/react'
import { atom, useAtom } from 'jotai'
import { Fragment } from 'react'
import { classNames } from 'util/Utils'
import { NAVIGATION } from './NavConstants'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLocation, useNavigate } from 'react-router-dom'
import { ProfileDropdownSuspense } from './ProfileDropdown'
import { useThemeValue } from 'state/UserPreferences'

export const mobileMenuOpenAtom = atom(false)

export function MobileMenu() {
   const [mobileMenuOpen, setMobileMenuOpen] = useAtom(mobileMenuOpenAtom)
   const theme = useThemeValue()
   const nav = useNavigate()
   const location = useLocation()
   const path = location.pathname
   return (
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
         <Dialog as='div' className='relative z-40 md:hidden' onClose={setMobileMenuOpen} data-theme={theme}>
            <Transition.Child
               as={Fragment}
               enter='transition-opacity ease-linear duration-300'
               enterFrom='opacity-0'
               enterTo='opacity-100'
               leave='transition-opacity ease-linear duration-300'
               leaveFrom='opacity-100'
               leaveTo='opacity-0'
            >
               <div className='fixed inset-x-0 top-0 z-20 bg-neutral/60 sm:inset-0' aria-hidden='true' />
            </Transition.Child>

            <div className='fixed inset-0 z-40 flex'>
               <Transition.Child
                  as={Fragment}
                  enter='transition ease-in-out duration-300 transform'
                  enterFrom='-translate-x-full'
                  enterTo='translate-x-0'
                  leave='transition ease-in-out duration-300 transform'
                  leaveFrom='translate-x-0'
                  leaveTo='-translate-x-full'
               >
                  <Dialog.Panel className='relative flex w-full max-w-xs flex-1 flex-col bg-base-100 pt-5 pb-4'>
                     <Transition.Child
                        as={Fragment}
                        enter='ease-in-out duration-300'
                        enterFrom='opacity-0'
                        enterTo='opacity-100'
                        leave='ease-in-out duration-300'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                     >
                        <div className='absolute top-1 right-0 -mr-14 p-1'>
                           <button
                              type='button'
                              className='btn btn-secondary btn-circle'
                              onClick={() => setMobileMenuOpen(false)}
                           >
                              <XMarkIcon className='h-6 w-6 text-secondary-content' aria-hidden='true' />
                              <span className='sr-only'>Close sidebar</span>
                           </button>
                        </div>
                     </Transition.Child>
                     <div className='flex flex-shrink-0 items-center px-4'>
                        <img className='h-8 w-auto' src='/logo.png' alt='Your Company' />
                     </div>
                     <div className='mt-5 flex h-0 flex-1 flex-col justify-between overflow-y-auto px-2'>
                        <nav className='flex h-full flex-col'>
                           <div className='space-y-1'>
                              {NAVIGATION.map(item => (
                                 <a
                                    key={item.name}
                                    onClick={() => nav(item.href)}
                                    className={classNames(
                                       path.includes(item.href) ? 'bg-primary-focus text-primary-content' : '',
                                       'group flex items-center rounded-md py-2 px-3 text-sm font-medium'
                                    )}
                                    aria-current={path.includes(item.href) ? 'page' : undefined}
                                 >
                                    <item.icon
                                       className={classNames(
                                          path.includes(item.href) ? 'bg-primary-focus text-primary-content' : '',
                                          'mr-3 h-6 w-6'
                                       )}
                                       aria-hidden='true'
                                    />
                                    <span>{item.name}</span>
                                 </a>
                              ))}
                           </div>
                        </nav>
                        <div className='self-start px-2'>
                           <ProfileDropdownSuspense onModalOpen={() => setMobileMenuOpen(false)} />
                        </div>
                     </div>
                  </Dialog.Panel>
               </Transition.Child>
               <div className='w-14 flex-shrink-0' aria-hidden='true'>
                  {/* Dummy element to force sidebar to shrink to fit close icon */}
               </div>
            </div>
         </Dialog>
      </Transition.Root>
   )
}
