import { Switch } from '@headlessui/react'
import { useAtom, WritableAtom } from 'jotai'
import { useThemeValue } from 'state/UserPreferences'
import { classNames } from 'util/Utils'

export const TogglePreferences = ({ atom }: { atom: WritableAtom<boolean, [boolean], boolean> }) => {
   const [shouldTransfer, setShouldTransfer] = useAtom(atom)

   const toggle = () => setShouldTransfer(!shouldTransfer)
   const theme = useThemeValue()

   return (
      <div className='form-control w-full' data-theme={theme}>
         <Switch.Group as='div' className='flex items-center justify-between' data-theme={theme}>
            <span className='flex flex-grow flex-col'>
               <Switch.Label as='span' className='text-sm font-bold' passive>
                  Transfer playback on start
               </Switch.Label>
               <Switch.Description as='span' className='text-sm'>
                  If enabled, playback will be immediately transfered on page load.
               </Switch.Description>
            </span>
            <Switch
               checked={shouldTransfer}
               onChange={toggle}
               className={classNames(
                  shouldTransfer ? 'bg-success' : 'bg-error',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
               )}
            >
               <span
                  aria-hidden='true'
                  className={classNames(
                     shouldTransfer ? 'translate-x-5' : 'translate-x-0',
                     'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-base-100 shadow ring-0 transition duration-200 ease-in-out'
                  )}
               />
            </Switch>
         </Switch.Group>
      </div>
   )
}
