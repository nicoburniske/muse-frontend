import { Dialog, Transition } from '@headlessui/react'
import { useAtomValue } from 'jotai'
import { Fragment } from 'react'
import { themeAtom } from 'state/Atoms'

export const ThemeModal = ({ open, children, className }: { className?: string, open: boolean, children: JSX.Element }) => {
    const theme = useAtomValue(themeAtom)

    return (
        <Transition
            show={open}
            enter="transition ease-in-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            as={Fragment}
        >
            <Dialog onClose={() => null} data-theme={theme}>
                <div className="fixed inset-x-0  top-0 sm:inset-0 bg-neutral/60 z-10" aria-hidden="true" />
                <div className="fixed inset-x-0 top-0 sm:inset-0 grid place-items-center p-4 w-full h-full z-50">
                    <Dialog.Panel className={'w-full rounded bg-base-300 border-primary relative ' + className}>
                        {children}
                    </Dialog.Panel>
                </div>
            </Dialog>
        </Transition>
    )
}


