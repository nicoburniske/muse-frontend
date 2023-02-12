import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { Fragment, useEffect, useState } from 'react'
import toast, { Toast } from 'react-hot-toast'

export const museToast = {
   success: (message: string, description = '') => customToast(message),
}

export const customToast = (message: string, description = '') => {
   return toast.custom(t => <CustomToast message={message} description={description} t={t} />)
}

// customToast('Hello World')
type ToastLevel = 'success' | 'error' | 'warning'
type CustomToastProps = { t: Toast; message: string; description: string; level: ToastLevel }

const CustomToast = ({ t, message, description }: CustomToastProps) => {
   //    const renderedMessage = typeof t.message === 'function' ? t.message(t) : t.message
   const [visible, setVisible] = useState(t.visible)

   useEffect(() => {
      setVisible(t.visible)
   }, [t.visible])

   return (
      <div
         aria-live='assertive'
         className='pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6'
      >
         <div className='flex w-full flex-col items-center space-y-4 sm:items-end'>
            {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
            <Transition
               show={visible}
               as={Fragment}
               enter='transform ease-out duration-300 transition'
               enterFrom='translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2'
               enterTo='translate-y-0 opacity-100 sm:translate-x-0'
               leave='transition ease-in duration-100'
               leaveFrom='opacity-100'
               leaveTo='opacity-0'
            >
               <div className='pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5'>
                  <div className='p-4'>
                     <div className='flex items-start'>
                        <div className='flex-shrink-0'>
                           <CheckCircleIcon className='h-6 w-6 text-green-400' aria-hidden='true' />
                        </div>
                        <div className='ml-3 w-0 flex-1 pt-0.5'>
                           <p className='text-sm font-medium text-gray-900'>{message}</p>
                           {description ? <p className='mt-1 text-sm text-gray-500'>{description}</p> : null}
                        </div>
                        <div className='ml-4 flex flex-shrink-0'>
                           <button
                              type='button'
                              className='inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                              onClick={() => {
                                 setVisible(false)
                              }}
                           >
                              <span className='sr-only'>Close</span>
                              <XMarkIcon className='h-5 w-5' aria-hidden='true' />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </Transition>
         </div>
      </div>
   )
}
