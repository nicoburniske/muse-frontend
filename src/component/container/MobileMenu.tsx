import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { atom, useAtom } from 'jotai'
import { Fragment } from 'react'
import { useLocation } from 'react-router-dom'

import { useThemeValue } from '@/state/UserPreferences'
import { cn } from '@/util/Utils'

import { NAVIGATION, NavItem } from './NavConstants'
import { ProfileDropdownSuspense } from './ProfileDropdown'

export const mobileMenuOpenAtom = atom(false)

export function MobileMenu() {
   const [mobileMenuOpen, setMobileMenuOpen] = useAtom(mobileMenuOpenAtom)
   const theme = useThemeValue()
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
               <div className='bg-neutral/60 fixed inset-x-0 top-0 z-20 sm:inset-0' aria-hidden='true' />
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
                  <Dialog.Panel className='relative flex flex-col bg-background pb-4 pt-5'>
                     <Transition.Child
                        as={Fragment}
                        enter='ease-in-out duration-300'
                        enterFrom='opacity-0'
                        enterTo='opacity-100'
                        leave='ease-in-out duration-300'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                     >
                        <div className='absolute right-0 top-1 -mr-14 p-1'>
                           <button
                              type='button'
                              className='btn btn-secondary btn-circle'
                              onClick={() => setMobileMenuOpen(false)}
                           >
                              <XMarkIcon className='text-secondary-content h-6 w-6' aria-hidden='true' />
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
                                 <NavOption key={item.name} item={item} onSelect={() => setMobileMenuOpen(false)} />
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

const NavOption = ({ item, onSelect }: { item: NavItem; onSelect: () => void }) => {
   const path = useLocation().pathname
   const action = item.action()
   const onClick = () => {
      action()
      onSelect()
   }
   return (
      <a
         key={item.name}
         onClick={onClick}
         className={cn(
            path.includes(item.href) ? 'bg-primary-focus text-primary-content' : '',
            'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
         )}
         aria-current={path.includes(item.href) ? 'page' : undefined}
      >
         <item.icon
            className={cn(path.includes(item.href) ? 'bg-primary-focus text-primary-content' : '', 'mr-3 h-6 w-6')}
            aria-hidden='true'
         />
         <span>{item.name}</span>
      </a>
   )
}
