import {
   Select,
   SelectTrigger,
   SelectValue,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectItemText,
} from 'platform/component/Select'
import { useEffect } from 'react'
import { Theme, useTheme } from 'state/UserPreferences'
import { cn } from 'util/Utils'

const ThemeOptions = Object.values(Theme).sort((a, b) => a.localeCompare(b))

export const ThemeSetter = () => {
   const [currentTheme, setTheme] = useTheme()

   useEffect(() => {
      document.documentElement.setAttribute('data-theme', currentTheme)
   }, [currentTheme])

   return (
      <Select
         // open={true}
         value={currentTheme}
         onValueChange={v => setTheme(v as Theme)}
      >
         <SelectTrigger>
            <SelectValue placeholder='Select a theme' />
         </SelectTrigger>
         <SelectContent>
            <SelectGroup>
               {ThemeOptions.map(theme => (
                  <SelectItem key={theme} value={theme} data-theme={theme} className='justify-between'>
                     <div className='flex w-full justify-between'>
                        <SelectItemText> {theme} </SelectItemText>
                        <span className='flex w-12 justify-evenly justify-self-center'>
                           <span className='w-2 bg-primary' />
                           <span className='w-2 bg-secondary' />
                           <span className='w-2 bg-accent' />
                           <span className='w-2 bg-muted' />
                           <span className='w-2 bg-popover' />
                        </span>
                     </div>
                  </SelectItem>
               ))}
            </SelectGroup>
         </SelectContent>
      </Select>
   )
}
