import { Transition } from '@headlessui/react'
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { Fragment } from 'react'
import { resolveValue, toast as hotToast, Toaster } from 'react-hot-toast'

import { Button } from '@/lib/component/Button'
import { cn } from '@/util/Utils'

export function MuseToaster() {
   return (
      <Toaster
         position='bottom-right'
         reverseOrder={false}
         gutter={8}
         toastOptions={{
            duration: 2000,
            position: 'top-right',
            success: {
               icon: <CheckCircleIcon className='h-6 w-6 text-primary' aria-hidden='true' />,
            },
            error: {
               icon: <ExclamationTriangleIcon className='h-6 w-6 text-destructive' aria-hidden='true' />,
            },
         }}
      >
         {t => (
            <div className='flex w-full flex-col items-center space-y-4 sm:items-end'>
               <Transition
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
                        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg',
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
