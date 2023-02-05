import { flip, offset, useFloating } from '@floating-ui/react'
import { Menu, Transition } from '@headlessui/react'
import Portal from 'platform/component/Portal'
import { useCurrentUser } from 'component/sdk/ClientHooks'
import { usePreferencesModal } from 'component/preferences/UserPreferencesForm'
import useLogoutMutation from 'state/useLogoutMutation'
import { Fragment, useCallback } from 'react'
import { PrivateUser } from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { useThemeValue } from 'state/UserPreferences'
import { classNames } from 'util/Utils'

export const ProfileDropdown = () => {
   const { openPreferencesModal } = usePreferencesModal()
   const theme = useThemeValue()
   const { mutate: logout } = useLogoutMutation()

   const { data } = useCurrentUser({
      suspense: true,
      staleTime: 1000 * 60 * 60,
      select: useCallback((data?: PrivateUser) => {
         return {
            image: data?.images.at(0)?.url,
            id: data?.id ?? '',
            displayName: data?.display_name ?? '',
         }
      }, []),
   })

   const { image, id, displayName } = data ?? {}

   const { x, y, strategy, refs } = useFloating({
      placement: 'top-start',
      strategy: 'absolute',
      middleware: [
         offset({
            mainAxis: 10,
            crossAxis: 10,
         }),
         flip(),
      ],
   })

   return (
      <Menu as='div'>
         <Menu.Button className='w-full transition-all hover:scale-110' ref={refs.setReference}>
            <div className='flex flex-col items-center'>
               <div className='avatar'>
                  <div className='h-10 w-10 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100'>
                     <img src={image ?? ''} />
                  </div>
               </div>
               <span className='sr-only'>Open user menu</span>
            </div>
         </Menu.Button>
         <Portal>
            <Transition
               data-theme={theme}
               as={Fragment}
               enter='transition ease-out duration-100'
               enterFrom='transform opacity-0 scale-95'
               enterTo='transform opacity-100 scale-100'
               leave='transition ease-in duration-75'
               leaveFrom='transform opacity-100 scale-100'
               leaveTo='transform opacity-0 scale-95'
            >
               <Menu.Items
                  ref={refs.setFloating}
                  style={{
                     position: strategy,
                     top: y ?? 0,
                     left: x ?? 0,
                  }}
                  className=' divide-y divide-base-content/20 rounded-md bg-base-100 text-base-content shadow-lg ring-1 ring-primary ring-opacity-5 focus:outline-none'
               >
                  <div className='py-1'>
                     <Menu.Item>
                        {({ active }) => (
                           <button
                              onClick={() => logout(undefined)}
                              className={classNames(
                                 active ? 'bg-base-300' : '',
                                 'block w-full px-4 py-2 text-left text-sm'
                              )}
                           >
                              Sign out
                           </button>
                        )}
                     </Menu.Item>
                  </div>
                  <div className='py-1'>
                     <Menu.Item>
                        {({ active }) => (
                           <button
                              onClick={() => openPreferencesModal()}
                              className={classNames(
                                 active ? 'bg-base-300' : '',
                                 'block w-full px-4 py-2 text-left text-sm'
                              )}
                           >
                              Preferences
                           </button>
                        )}
                     </Menu.Item>
                  </div>
                  <div className='px-4 py-3'>
                     <p className='text-sm'>{displayName}</p>
                     <p className='truncate text-sm font-medium'>@{id}</p>
                  </div>
               </Menu.Items>
            </Transition>
         </Portal>
      </Menu>
   )
}
