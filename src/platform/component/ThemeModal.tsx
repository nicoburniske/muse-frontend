import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useThemeValue } from 'state/UserPreferences'

export const ThemeModal = ({
   open,
   children,
   className,
}: {
   className?: string
   open: boolean
   children: JSX.Element
}) => {
   const theme = useThemeValue()

   return (
      <Transition show={open} as={Fragment}>
         <Dialog onClose={() => null} data-theme={theme}>
            {/* Background transition */}
            <Transition.Child
               as={Fragment}
               enter='ease-out duration-100'
               enterFrom='opacity-0'
               enterTo='opacity-100'
               leave='ease-in duration-100'
               leaveFrom='opacity-100'
               leaveTo='opacity-0'
            >
               <div className='fixed inset-x-0 top-0 z-20 bg-neutral/60 sm:inset-0' aria-hidden='true' />
            </Transition.Child>

            {/* Panel transition */}
            <Transition.Child
               as={Fragment}
               enter='ease-out duration-300'
               enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
               enterTo='opacity-100 translate-y-0 sm:scale-100'
               leave='ease-in duration-200'
               leaveFrom='opacity-100 translate-y-0 sm:scale-100'
               leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
               <div className='fixed inset-x-0 top-0 z-20 grid h-full w-full place-items-center p-4 sm:inset-0'>
                  <Dialog.Panel className={'relative w-full rounded border-primary bg-base-100 ' + className}>
                     {children}
                  </Dialog.Panel>
               </div>
            </Transition.Child>
         </Dialog>
      </Transition>
   )
}
