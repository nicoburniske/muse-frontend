import { Label } from '@/lib/component/Label'
import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectItemText,
   SelectTrigger,
   SelectValue,
} from '@/lib/component/Select'
import { Theme, Themes, useTheme } from '@/state/UserPreferences'

const ThemeOptions = [...Themes].sort((a, b) => a.localeCompare(b)) as Theme[]

type ThemeSetterProps = { open: boolean; setOpen: (open: boolean) => void }

export const ThemeSetter = ({ open, setOpen }: ThemeSetterProps) => {
   const [currentTheme, setTheme] = useTheme()

   return (
      <div className='flex flex-col gap-2'>
         <Label htmlFor='theme-setter'>Theme</Label>
         <div id='theme-setter'>
            <Select
               open={open}
               value={currentTheme}
               onValueChange={v => setTheme(v as Theme)}
               onOpenChange={open => setOpen(open)}
            >
               <SelectTrigger>
                  <SelectValue placeholder='Select a theme' />
               </SelectTrigger>
               <SelectContent>
                  <SelectGroup>
                     {ThemeOptions.map(theme => (
                        <SelectItem
                           key={theme}
                           value={theme}
                           data-theme={theme}
                           className='justify-between bg-background text-foreground'
                        >
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
         </div>
      </div>
   )
}
