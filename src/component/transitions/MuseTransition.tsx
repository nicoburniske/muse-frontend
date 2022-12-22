import { Transition } from '@headlessui/react'

type MuseTransitionProps = {
    children: React.ReactNode
    option: TransitionOption
}

export const MuseTransition = ({ children, option }: MuseTransitionProps) => {
    return (
        < Transition
            appear={true}
            show={true}
            {...MuseTransitions[option]}
        >
            {children}
        </Transition >
    )
}

type TransitionOption = keyof typeof MuseTransitions
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
    }
} as const