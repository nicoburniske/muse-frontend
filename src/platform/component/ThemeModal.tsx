import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useThemeValue } from 'state/UserPreferences'
import { cn } from 'util/Utils'

export const ThemeModal = ({
   open,
   children,
   className,
   onClose = () => {},
}: {
   open: boolean
   onClose?: (value: boolean) => void
   className?: string
   children: JSX.Element
}) => {
   const theme = useThemeValue()

   return (
      <Transition show={open} as={Fragment}>
         <Dialog onClose={onClose} data-theme={theme}>
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
               <div className='fixed inset-0 z-20 bg-neutral/60' aria-hidden='true' />
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
               <div className='fixed inset-0 z-20 flex items-start justify-center p-4 sm:items-center'>
                  <Dialog.Panel className={cn('rounded-md border-2 border-base-200 bg-base-100', className)}>
                     {children}
                  </Dialog.Panel>
               </div>
            </Transition.Child>
         </Dialog>
      </Transition>
   )
}
