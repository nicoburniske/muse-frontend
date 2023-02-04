import { NAVIGATION } from './NavConstants'
import { classNames } from 'util/Utils'
import { Suspense } from 'react'
import LogoImage from '/logo.png'
import { ProfileDropdown } from './ProfileDropdown'
import { useLocation, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

export const SideNavBar = () => {
   const nav = useNavigate()
   return (
      <>
         <div className='hidden md:flex md:flex-shrink-0'>
            <div className='flex w-20 flex-col'>
               <div className='flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-primary to-secondary'>
                  <div className='flex-1'>
                     <div className='flex items-center justify-center py-4' onClick={() => nav('/')}>
                        <img className='h-8 w-auto' src={LogoImage} alt='Muse' />
                     </div>
                     <NavBarLinks />
                  </div>
                  <div className='flex flex-shrink-0 pb-5'>
                     <div className='w-full flex-shrink-0'>
                        <ErrorBoundary fallback={<ProfilePlaceholder />}>
                           <Suspense fallback={<ProfilePlaceholder />}>
                              <ProfileDropdown />
                           </Suspense>
                        </ErrorBoundary>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   )
}

const ProfilePlaceholder = () => {
   return (
      <div className='flex w-full justify-center'>
         <div className='avatar placeholder'>
            <div className='w-10 rounded-full bg-neutral-focus text-neutral-content'>
               <span className='text-xl'>?</span>
            </div>
         </div>
      </div>
   )
}

const NavBarLinks = () => {
   const nav = useNavigate()
   const location = useLocation()
   const path = location.pathname

   return (
      <nav aria-label='Sidebar' className='flex flex-col items-center space-y-3 py-6'>
         {NAVIGATION.map(item => (
            <a
               key={item.name}
               onClick={() => nav(item.href)}
               className={classNames(
                  'flex flex-col items-center bg-secondary p-3 text-secondary-content transition-all duration-100 hover:bg-primary-focus hover:text-primary-content',
                  path.includes(item.href) ? 'bg-primary-focus text-primary-content' : '',
                  'rounded-3xl hover:w-full hover:rounded-xl'
               )}
            >
               <item.icon className='h-6 w-6' aria-hidden='true' />
               <span className='sr-only'>{item.name}</span>
            </a>
         ))}
      </nav>
   )
}
