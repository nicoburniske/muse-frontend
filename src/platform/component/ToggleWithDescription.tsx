import { Switch } from '@headlessui/react'
import { cn } from 'util/Utils'

export type ToggleProps = {
   label: string
   description: string
   enabled: boolean
   setEnabled: (enabled: boolean) => void
   className?: string
}

export const ToggleWithDescription = ({ label, description, enabled, setEnabled, className }: ToggleProps) => {
   return (
      <Switch.Group as='div' className={cn('flex items-center justify-between', className)}>
         <span className='flex flex-grow flex-col text-foreground'>
            <Switch.Label as='span' className='text-base font-bold' passive>
               {label}
            </Switch.Label>
            <Switch.Description as='span' className='text-sm font-light'>
               {description}
            </Switch.Description>
         </span>
         <Switch
            checked={enabled}
            onChange={setEnabled}
            className={cn(
               enabled ? 'bg-success' : 'bg-secondary',
               'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-primary'
            )}
         >
            <span
               aria-hidden='true'
               className={cn(
                  enabled ? 'translate-x-5' : 'translate-x-0',
                  'bg-neutral pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out'
               )}
            />
         </Switch>
      </Switch.Group>
   )
}
