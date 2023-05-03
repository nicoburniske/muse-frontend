import { useAtom, WritableAtom } from 'jotai'
import { Label } from 'platform/component/Label'
import { Switch } from 'platform/component/Switch'

type TogglePreferencesProps = {
   atom: WritableAtom<boolean, [boolean], void>
   id: string
   label: string
   description: string
}
export const TogglePreferences = ({ atom, id, label, description }: TogglePreferencesProps) => {
   const [shouldTransfer, setShouldTransfer] = useAtom(atom)

   return (
      <div className='flex justify-between'>
         <div className='flex-col items-center'>
            <Label htmlFor={id}>{label}</Label>
            <div className='text-sm text-muted-foreground'>{description}</div>
         </div>
         <Switch id={id} checked={shouldTransfer} onCheckedChange={setShouldTransfer} />
      </div>
   )
}
