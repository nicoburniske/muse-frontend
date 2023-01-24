import { offset, useFloating } from '@floating-ui/react'
import { Menu, Transition } from '@headlessui/react'
import Portal from 'component/Portal'
import { useCurrentUser } from 'component/playbackSDK/hooks'
import { usePreferencesModal } from 'component/preferences/UserPreferencesForm'
import { Fragment, useCallback } from 'react'
import { PrivateUser } from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { useThemeValue } from 'state/UserPreferences'
import { classNames } from 'util/Utils'

export const ProfileDropdown = () => {
    const { openPreferencesModal } = usePreferencesModal()
    const theme = useThemeValue()

    const { data: image } = useCurrentUser({
        suspense: true,
        staleTime: 1000 * 60 * 60,
        select: useCallback((data?: PrivateUser) => data?.images.at(0)?.url, [])
    })

    const { x, y, strategy, refs } = useFloating({
        placement: 'top-start',
        strategy: 'absolute',
        middleware: [offset(
            {
                mainAxis: 10,
                crossAxis: 10
            }
        )]
    })

    return (
        <Menu as="div">
            <Menu.Button
                className="w-full hover:scale-110 transition-all"
                ref={refs.setReference}
            >
                <div className="flex flex-col items-center">
                    <div className='avatar'>
                        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={image ?? ''} />
                        </div>
                    </div>
                    <span className="sr-only">Open user menu</span>
                </div>
            </Menu.Button>
            <Portal>
                <Transition
                    data-theme={theme}
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items
                        ref={refs.setFloating}
                        style={{
                            position: strategy,
                            top: y ?? 0,
                            left: x ?? 0,
                        }}

                        className="menu bg-neutral text-neutral-content rounded-md shadow-lg "
                    >
                        <Menu.Item >
                            {({ active }) => (
                                <li>
                                    <a
                                        className={classNames(
                                            active ? 'active' : '',
                                        )}
                                    // href={'/profile'}
                                    >
                                        Profile
                                    </a>
                                </li>
                            )}
                        </Menu.Item>

                        <Menu.Item >
                            {({ active }) => (
                                <li>
                                    <a
                                        className={classNames(
                                            active ? 'active' : '',
                                        )}
                                        onClick={() => openPreferencesModal()}
                                    >
                                        Settings
                                    </a>
                                </li>
                            )}
                        </Menu.Item>
                    </Menu.Items>
                </Transition >
            </Portal>
        </Menu >
    )
}