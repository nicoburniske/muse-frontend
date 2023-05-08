import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { RESET } from 'jotai/vanilla/utils'

export const makeModalAtoms = <Value, Input extends Value>(defaultValue: Value) => {
   const valueAtom = atomWithReset(defaultValue)
   const openAtom = atom(false)

   return {
      setOpen: atom(null, (get, set, newValue: Input) => {
         set(valueAtom, newValue)
         set(openAtom, true)
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
