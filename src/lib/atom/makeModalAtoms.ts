import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { RESET } from 'jotai/vanilla/utils'

export const makeModalAtoms = <Unsafe, Safe extends Unsafe>(defaultValue: Unsafe) => {
   const valueAtom = atomWithReset(defaultValue)
   const openAtom = atom(false)

   return {
      setOpen: atom(null, (get, set, newValue: Safe) => {
         set(openAtom, true)
         set(valueAtom, newValue)
      }),
      setClose: atom(null, (_, set) => {
         set(openAtom, false)
         set(valueAtom, RESET)
      }),
      valueAtom,
      openAtom: atom(
         get => get(openAtom),
         (_, set, open: boolean) => {
            set(openAtom, open)
            if (!open) {
               set(valueAtom, RESET)
            }
         }
      ),
   }
}
