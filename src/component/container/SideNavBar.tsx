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
               <div className='to-neutral flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-primary'>
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
                     'flex flex-col items-center p-3 transition-all duration-100 hover:bg-secondary/50 hover:text-secondary-foreground',
                     path.includes(item.href)
                        ? 'w-3/4 bg-secondary text-secondary-foreground'
                        : 'bg-background text-foreground',
                     'rounded-3xl hover:w-full hover:rounded-xl',
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
