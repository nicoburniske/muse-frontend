import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline'
import { useSetAtom } from 'jotai'
import { mobileMenuOpenAtom } from './MobileMenu'

export const OpenMobileMenuButton = () => {
   const setMobileMenuOpen = useSetAtom(mobileMenuOpenAtom)

   return (
      <button
         type='button'
         className='btn btn-primary m-auto h-full px-4 md:hidden'
         onClick={() => setMobileMenuOpen(true)}
      >
         <span className='sr-only'>Open sidebar</span>
         <Bars3BottomLeftIcon className='h-6 w-6' aria-hidden='true' />
      </button>
   )
}
