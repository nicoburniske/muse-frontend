import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline'
import { useSetAtom } from 'jotai'
import { mobileMenuOpenAtom } from './MobileMenu'


export const OpenMobileMenuButton = () => {
    const setMobileMenuOpen = useSetAtom(mobileMenuOpenAtom)

    return (
        <button
            type="button"
            className="px-4 btn btn-primary m-auto h-full md:hidden"
            onClick={() => setMobileMenuOpen(true)}
        >
            <span className="sr-only">Open sidebar</span>
            <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
        </button>
    )
}