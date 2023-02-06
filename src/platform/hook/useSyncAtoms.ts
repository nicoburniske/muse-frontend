import { Atom, PrimitiveAtom, useStore } from 'jotai'
import { useEffect } from 'react'

export default function useSyncAtoms<Value>(atomToSet: PrimitiveAtom<Value>, atomToGet: Atom<Value>) {
   const store = useStore()

   useEffect(() => {
      const sync = () => {
         const newValue = store.get(atomToGet)
         store.set(atomToSet, newValue)
      }
      sync()
      store.sub(atomToGet, sync)
   }, [store, atomToSet, atomToGet])
}
