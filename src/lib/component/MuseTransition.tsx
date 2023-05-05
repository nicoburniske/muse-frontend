import { Transition } from '@headlessui/react'
import { JSXElementConstructor } from 'react'

import { cn } from '@/util/Utils'

type MuseTransitionProps = {
   children: React.ReactNode
   option: TransitionOption
   className?: string
   duration?: (typeof Durations)[number]
   as?: ReactTag
}
type ReactTag = keyof JSX.IntrinsicElements | JSXElementConstructor<any>

export const MuseTransition = ({ children, option, as, className, duration }: MuseTransitionProps) => {
   const selected = MuseTransitions[option]
   const withDuration = { ...selected, enter: cn(selected.enter, duration) }
   return (
      <Transition appear={true} show={true} className={className} as={as} {...withDuration}>
         {children}
      </Transition>
   )
}

type TransitionOption = keyof typeof MuseTransitions

const Durations = [
   'duration-100',
   'duration-150',
   'duration-200',
   'duration-300',
   'duration-500',
   'duration-700',
   'duration-1000',
] as const

const MuseTransitions = {
   Grow: {
      enter: 'transform transition-all',
      enterFrom: 'opacity-0 scale-50',
      enterTo: 'opacity-100 scale-100',
      leave: 'transform transition ease-in-out',
      leaveFrom: 'opacity-100 scale-100',
      leaveTo: 'opacity-0 scale-95',
   },
   BottomFlyIn: {
      enter: 'transition ease-out duration-200',
      enterFrom: 'opacity-0 translate-y-1',
      enterTo: 'opacity-100 translate-y-0',
      leave: 'transition ease-in duration-150',
      leaveFrom: 'opacity-100 translate-y-0',
      leaveTo: 'opacity-0 translate-y-1',
   },
   Notification: {
      enter: 'transform ease-out duration-300 transition',
      enterFrom: 'translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2',
      enterTo: 'translate-y-0 opacity-100 sm:translate-x-0',
      leave: 'transition ease-in duration-100',
      leaveFrom: 'opacity-100',
      leaveTo: 'opacity-0',
   },
   Simple: {
      enter: 'transition-opacity duration-150',
      enterFrom: 'opacity-0',
      enterTo: 'opacity-100',
      leave: 'transition-opacity duration-150',
      leaveFrom: 'opacity-100',
      leaveTo: 'opacity-0',
   },
} as const
