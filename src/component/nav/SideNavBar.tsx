import { NAVIGATION } from './NavConstants'
import { classNames } from 'util/Utils'
import { Suspense } from 'react'
import LogoImage from '/logo.png'
import { ProfileDropdown } from './ProfileDropdown'
import { useLocation, useNavigate } from 'react-router-dom'

export const SideNavBar = () => {
    return (
        <>
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex w-20 flex-col">
                    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-primary to-secondary overflow-hidden">
                        <div className="flex-1">
                            <div className="flex items-center justify-center py-4">
                                <img
                                    className="h-8 w-auto"
                                    src={LogoImage}
                                    alt="Muse"
                                />
                            </div>
                            <NavBarLinks />
                        </div>
                        <div className="flex flex-shrink-0 pb-5">
                            <div className="w-full flex-shrink-0">
                                <Suspense fallback={null}>
                                    <ProfileDropdown />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const NavBarLinks = () => {
    const nav = useNavigate()
    const location = useLocation()
    const path = location.pathname

    return (
        <nav aria-label="Sidebar" className="flex flex-col items-center space-y-3 py-6">
            {NAVIGATION.map((item) => (
                <a
                    key={item.name}
                    onClick={() => nav(item.href)}
                    className={
                        classNames(
                            'p-3 flex flex-col items-center bg-secondary text-secondary-content hover:bg-primary-focus hover:text-primary-content transition-all duration-100',
                            path.includes(item.href) ? 'bg-primary-focus text-primary-content' : '',
                            'rounded-3xl hover:rounded-xl hover:w-full'
                        )}
                >
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">{item.name}</span>
                </a>
            ))}
        </nav>
    )
}