import { Dialog, Transition } from '@headlessui/react'
import { atom, useAtom } from 'jotai'
import { Fragment } from 'react'
import { classNames } from 'util/Utils'
import { NAVIGATION } from './NavConstants'
import { XMarkIcon } from '@heroicons/react/24/outline'

export const mobileMenuOpenAtom = atom(false)

export function MobileMenu() {
    const [mobileMenuOpen, setMobileMenuOpen] = useAtom(mobileMenuOpenAtom)
    return (
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
            <Dialog as="div" className="relative z-40 md:hidden" onClose={setMobileMenuOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity ease-linear duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    {/* <div className="fixed inset-0 bg-gray-600 bg-opacity-75" /> */}
                    <div className="fixed inset-x-0 top-0 sm:inset-0 bg-neutral/60 z-20" aria-hidden="true" />
                </Transition.Child>

                <div className="fixed inset-0 z-40 flex">
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-indigo-700 pt-5 pb-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-in-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in-out duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="absolute top-1 right-0 -mr-14 p-1">
                                    <button
                                        type="button"
                                        className="flex h-12 w-12 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        <span className="sr-only">Close sidebar</span>
                                    </button>
                                </div>
                            </Transition.Child>
                            <div className="flex flex-shrink-0 items-center px-4">
                                <img
                                    className="h-8 w-auto"
                                    src="https://tailwindui.com/img/logos/mark.svg?color=white"
                                    alt="Your Company"
                                />
                            </div>
                            <div className="mt-5 h-0 flex-1 overflow-y-auto px-2">
                                <nav className="flex h-full flex-col">
                                    <div className="space-y-1">
                                        {NAVIGATION.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    item.current
                                                        ? 'bg-indigo-800 text-white'
                                                        : 'text-indigo-100 hover:bg-indigo-800 hover:text-white',
                                                    'group py-2 px-3 rounded-md flex items-center text-sm font-medium'
                                                )}
                                                aria-current={item.current ? 'page' : undefined}
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        item.current ? 'text-white' : 'text-indigo-300 group-hover:text-white',
                                                        'mr-3 h-6 w-6'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                <span>{item.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </nav>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                    <div className="w-14 flex-shrink-0" aria-hidden="true">
                        {/* Dummy element to force sidebar to shrink to fit close icon */}
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}