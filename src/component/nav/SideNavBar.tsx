import { NAVIGATION, NavItem } from './NavConstants'
import { cn } from 'util/Utils'
import LogoImage from '/logo.png'
import { ProfileDropdownSuspense } from './ProfileDropdown'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'platform/component/Tooltip'

export const SideNavBar = () => {
   const nav = useNavigate()
   return (
      <>
         <div className='hidden md:flex md:flex-shrink-0'>
            <div className='flex w-20 flex-col'>
               <div className='flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-primary to-neutral'>
                  <div className='flex-1'>
                     <div className='flex items-center justify-center py-4' onClick={() => nav('/')}>
                        <img className='h-8 w-auto' src={LogoImage} alt='Muse' />
                     </div>
                     <NavBarLinks />
                  </div>
                  <div className='flex flex-shrink-0 pb-5'>
                     <div className='w-full flex-shrink-0'>
                        <ProfileDropdownSuspense />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   )
}

const NavBarLinks = () => {
   return (
      <nav aria-label='Sidebar' className='flex flex-col items-center space-y-3 py-6'>
         {NAVIGATION.map(item => (
            <NavBarLink key={item.name} item={item} />
         ))}
      </nav>
   )
}

const NavBarLink = ({ item }: { item: NavItem }) => {
   const nav = useNavigate()
   const location = useLocation()
   const path = location.pathname
   return (
      <TooltipProvider delayDuration={500}>
         <Tooltip>
            <TooltipTrigger asChild>
               <a
                  onClick={() => nav(item.href)}
                  className={cn(
                     'flex flex-col items-center p-3 transition-all duration-100 hover:bg-primary-focus hover:text-primary-content',
                     path.includes(item.href)
                        ? 'bg-primary-focus text-primary-content'
                        : 'bg-secondary text-secondary-content',
                     'rounded-3xl hover:w-full hover:rounded-xl'
                  )}
               >
                  <item.icon className='h-6 w-6' aria-hidden='true' />
                  <span className='sr-only'>{item.name}</span>
               </a>
            </TooltipTrigger>
            <TooltipContent side='right' align='start' alignOffset={-4} className='bg-primary text-primary-content'>
               <p>{item.name}</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}
