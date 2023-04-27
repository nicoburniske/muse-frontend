import { Transition } from '@headlessui/react'
import { Fragment, ReactNode } from 'react'
import { Sheet, SheetContent } from './Sheet'

export default function RightSidePane({ isOpen, children }: { isOpen: boolean; children: ReactNode }) {
   return null
   // <Transition
   //    show={isOpen}
   //    as={Fragment}
   //    enter='transform transition ease-in-out duration-300'
   //    enterFrom='translate-x-full'
   //    enterTo='translate-x-0'
   //    leave='transform transition ease-in-out duration-300'
   //    leaveFrom='translate-x-0'
   //    leaveTo='translate-x-full'
   // >
   //    <div className='fixed right-0 z-10 flex h-full flex-col bg-secondary text-secondary-content'>
   //       <aside className='h-full w-64 overflow-y-auto md:w-96'>{children}</aside>
   //    </div>
   // </Transition>
}
