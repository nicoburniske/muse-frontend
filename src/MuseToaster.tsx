import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { Button } from 'platform/component/Button'
import { Fragment } from 'react'
import { Toaster, toast as hotToast, resolveValue } from 'react-hot-toast'
import { useThemeValue } from 'state/UserPreferences'
import { cn } from 'util/Utils'

export function MuseToaster() {
   const theme = useThemeValue()

   return (
      <Toaster
         position='bottom-right'
         reverseOrder={false}
         gutter={8}
         toastOptions={{
            duration: 2000,
            position: 'top-right',
            success: {
               icon: <CheckCircleIcon className='text-success h-6 w-6' aria-hidden='true' />,
            },
            error: {
               icon: <ExclamationTriangleIcon className='text-error h-6 w-6' aria-hidden='true' />,
            },
         }}
      >
         {t => (
            <div className='flex w-full flex-col items-center space-y-4 sm:items-end'>
               <Transition
                  data-theme={theme}
                  appear
                  show={t.visible}
                  as={Fragment}
                  enter='transform ease-out duration-300 transition'
                  enterFrom='translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2'
                  enterTo='translate-y-0 opacity-100 sm:translate-x-0'
                  leave='transition ease-in duration-100'
                  leaveFrom='opacity-100'
                  leaveTo='opacity-0'
               >
                  <div
                     className={cn(
                        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring ring-opacity-5',
                        'bg-background text-foreground',
                        t.className
                     )}
                  >
                     <div className='p-4'>
                        <div className='flex items-start'>
                           <div className='flex-shrink-0'>{t.icon}</div>
                           <div className='ml-3 w-0 flex-1 pt-0.5'>
                              <p className='text-sm font-medium '>{resolveValue(t.message, t)}</p>
                           </div>
                           <div className='ml-4 flex flex-shrink-0'>
                              <Button
                                 type='button'
                                 variant='svg'
                                 size='empty'
                                 onClick={() => {
                                    hotToast.dismiss(t.id)
                                 }}
                              >
                                 <span className='sr-only'>Close</span>
                                 <XMarkIcon className='h-5 w-5' aria-hidden='true' />
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </Transition>
            </div>
         )}
      </Toaster>
   )
}
