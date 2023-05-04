import { PrimitiveAtom, useAtom } from 'jotai'
import { cn } from 'util/Utils'

type ToggleProps = {
   toggleAtom: PrimitiveAtom<boolean>
   iconLeft: JSX.Element
   iconRight: JSX.Element
   className?: string
}

const IconToggle = ({ iconLeft, iconRight, toggleAtom, className }: ToggleProps) => {
   const [toggle, setToggle] = useAtom(toggleAtom)

   return (
      <div className={cn('btn-group btn-group-horizontal', className)}>
         <button className={cn('btn btn-square btn-sm', toggle ? 'btn-active' : '')} onClick={() => setToggle(true)}>
            {iconLeft}
         </button>
         <button className={cn('btn btn-square btn-sm', toggle ? '' : 'btn-active')} onClick={() => setToggle(false)}>
            {iconRight}
         </button>
      </div>
   )
}

export default IconToggle
