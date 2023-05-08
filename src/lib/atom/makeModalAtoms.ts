import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { RESET } from 'jotai/vanilla/utils'

export const makeModalAtoms = <Unsafe, Safe extends Unsafe>(defaultValue: Unsafe) => {
   const valueAtom = atomWithReset(defaultValue)

   return {
      setOpen: atom(null, (get, set, newValue: Safe) => {
         set(valueAtom, newValue)
      }),
      setClose: atom(null, (_, set) => {
         set(valueAtom, RESET)
      }),
      valueAtom,
      openAtom: atom(
         get => get(valueAtom) !== defaultValue,
         (_, set, open: boolean) => {
            if (!open) {
               set(valueAtom, RESET)
            }
         }
      ),
   }
}
