import { useLocation, useNavigate } from 'react-router-dom'

import LogoImage from '/logo.png'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/lib/component/Tooltip'
import { cn } from '@/util/Utils'

import { NAV, NavItem } from './NavConstants'
import { ProfileDropdownSuspense } from './ProfileDropdown'

export const SideNavBar = () => {
   const nav = useNavigate()
   return (
      <>
         <div className='hidden md:flex md:flex-shrink-0'>
            <div className='flex w-20 flex-col'>
               <div className='flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-primary to-background'>
                  <div className='flex-1'>
                     <div className='flex items-center justify-center py-4' onClick={() => nav('/')}>
                        <img className='h-8 w-auto' src={LogoImage} alt='Muse' />
                     </div>
                     <NavBarLinks />
                  </div>
                  <div className='flex flex-shrink-0 pb-5'>
                     <div className='grid w-full flex-shrink-0 place-items-center'>
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
         {NAV.map(item => (
            <NavBarLink key={item.name} item={item} />
         ))}
      </nav>
   )
}

const NavBarLink = ({ item }: { item: NavItem }) => {
   const location = useLocation()
   const path = location.pathname
   const action = item.action()
   return (
      <TooltipProvider delayDuration={300}>
         <Tooltip>
            <TooltipTrigger asChild>
               <a
                  onClick={action}
                  className={cn(
                     'flex flex-col items-center p-3 transition-all duration-100 ',
                     path.includes(item.href)
                        ? 'w-3/4 rounded-xl bg-accent text-accent-foreground hover:rounded-lg'
                        : 'rounded-3xl bg-background text-foreground hover:w-3/4 hover:rounded-xl hover:bg-accent hover:text-accent-foreground',
                     '',
                     item.className
                  )}
               >
                  <item.icon className='h-6 w-6' aria-hidden='true' />
                  <span className='sr-only'>{item.name}</span>
               </a>
            </TooltipTrigger>
            <TooltipContent side='right' align='start' alignOffset={-4} className='bg-primary text-primary-foreground'>
               <p>{item.name}</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}
