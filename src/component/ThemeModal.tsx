import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useThemeValue } from 'state/UserPreferences'

export const ThemeModal = ({ open, children, className }: { className?: string, open: boolean, children: JSX.Element }) => {
    const theme = useThemeValue()

    return (
        <Transition
            show={open}
            as={Fragment}
        >
            <Dialog onClose={() => null} data-theme={theme}>
                {/* Background transition */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-100"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-x-0 top-0 sm:inset-0 bg-neutral/60 z-20" aria-hidden="true" />
                </Transition.Child>

                {/* Panel transition */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div className="fixed inset-x-0 top-0 sm:inset-0 grid place-items-center p-4 w-full h-full z-20">
                        <Dialog.Panel className={'w-full rounded bg-base-300 border-primary relative ' + className}>
                            {children}
                        </Dialog.Panel>
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    )
}


