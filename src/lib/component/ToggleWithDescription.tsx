import { InformationCircleIcon } from '@heroicons/react/24/outline'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/lib/component/Tooltip'
import { cn } from '@/util/Utils'

import { Label } from './Label'
import { Switch } from './Switch'

export type ToggleProps = {
   id: string
   label: string
   description: string
   enabled: boolean
   setEnabled: (enabled: boolean) => void
   className?: string
}

export const ToggleWithDescription = ({ id, label, description, enabled, setEnabled, className }: ToggleProps) => {
   return (
      <div className={cn('flex gap-2', className)}>
         <TooltipProvider delayDuration={200}>
            <Tooltip>
               <TooltipTrigger>
                  <div className='flex items-center gap-2'>
                     <Label htmlFor={id}>{label}</Label>
                     <InformationCircleIcon className='h-4 w-4' />
                  </div>
               </TooltipTrigger>
               <TooltipContent>{description}</TooltipContent>
            </Tooltip>
         </TooltipProvider>
         <Switch id={id} checked={enabled} onCheckedChange={setEnabled} />
      </div>
   )
}
