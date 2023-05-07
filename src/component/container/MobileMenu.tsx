import { atom, useAtom, useSetAtom } from 'jotai'
import { useLocation } from 'react-router-dom'

import { Dialog, DialogContent, DialogTrigger } from '@/lib/component/Dialog'
import { cn } from '@/util/Utils'

import { MOBILE_NAV, NavItem } from './NavConstants'

const mobileNavOpenAtom = atom(false)

export function MobileNavigation() {
   const [isOpen, setIsOpen] = useAtom(mobileNavOpenAtom)
   return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogTrigger asChild>
            <button
               className='relative z-10 flex h-8 w-8 items-center justify-center md:hidden [&:not(:focus-visible)]:focus:outline-none'
               aria-label='Toggle Navigation'
               onClick={() => setIsOpen(!isOpen)}
            >
               <MobileNavIcon open={isOpen} />
            </button>
         </DialogTrigger>
         <DialogContent>
            <div className='mt-3 flex w-full flex-col justify-start'>
               {MOBILE_NAV.map(item => (
                  <MobileNavLink key={item.name} item={item} />
               ))}
            </div>
         </DialogContent>
      </Dialog>
   )
}

function MobileNavLink({ item }: { item: NavItem }) {
   const { name, href, action, className } = item

   const path = useLocation().pathname
   const click = action()
   const setOpen = useSetAtom(mobileNavOpenAtom)
   const onClick = () => {
      click()
      setOpen(false)
   }

   return (
      <button
         className={cn(
            path.includes(href) ? 'bg-primary text-primary-foreground' : '',
            'inline-flex w-full justify-start rounded p-2',
            className
         )}
         onClick={onClick}
      >
         <item.icon className={cn('mr-3 h-6 w-6')} aria-hidden='true' />
         <span>{name}</span>
      </button>
   )
}

function MobileNavIcon({ open }: { open: boolean }) {
   return (
      <svg
         aria-hidden='true'
         className='h-3.5 w-3.5 overflow-visible stroke-foreground'
         fill='none'
         strokeWidth={2}
         strokeLinecap='round'
      >
         <path d='M0 1H14M0 7H14M0 13H14' className={cn('origin-center transition', open && 'scale-90 opacity-0')} />
         <path d='M2 2L12 12M12 2L2 12' className={cn('origin-center transition', !open && 'scale-90 opacity-0')} />
      </svg>
   )
}
