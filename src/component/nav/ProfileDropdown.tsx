import { Menu, Transition } from '@headlessui/react'
import { useCurrentUser } from 'component/playbackSDK/hooks'
import { usePreferencesModal } from 'component/preferences/UserPreferencesForm'
import { Fragment, useCallback } from 'react'
import { classNames } from 'util/Utils'

export const ProfileDropdown = () => {
    const { openPreferencesModal } = usePreferencesModal()

    const { data: image } = useCurrentUser({
        suspense: true,
        staleTime: 1000 * 60 * 60,
        select: useCallback((data) => data?.images.at(0)?.url, [])
    })

    return (
        <Menu as="div" className="relative flex-shrink-0 ">
            <div>
                <Menu.Button className="w-full hover:scale-110 transition-all">
                    <div className="flex flex-col items-center">
                        <div className='avatar'>
                            <div className="w-10 h-10 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                                <img src={image} />
                            </div>
                        </div>
                        <span className="sr-only">Open user menu</span>
                    </div>
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className='absolute z-10 mt-2 w-48 -translate-y-[calc(100%+60px)] rounded-md bg-base-200 flex flex-col ring-1 ring-black ring-opacity-5 focus:outline-none'
                >
                    <Menu.Item >
                        {({ active }) => (
                            <a
                                className={classNames(
                                    active ? 'bg-base-300' : 'bg-base-200',
                                    'block px-4 py-2 text-sm text-base-content'
                                )}
                                // href={'/profile'}
                            >
                                profile
                            </a>
                        )}
                    </Menu.Item>

                    <Menu.Item >
                        {({ active }) => (
                            <a
                                className={classNames(
                                    active ? 'bg-base-300' : 'bg-base-200',
                                    'block px-4 py-2 text-sm text-base-content'
                                )}
                                onClick={() => openPreferencesModal()}
                            >
                                settings
                            </a>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition >
        </Menu >
    )
}