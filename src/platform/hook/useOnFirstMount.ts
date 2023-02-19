import { Atom, WritableAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

// TODO: Implement with store subscribe.
export const useOnFirstMountAtom = (
   needToExecuteAtom: Atom<boolean>,
   updateNeedToExecute: WritableAtom<boolean, boolean[], void>,
   execute: () => void
) => {
   const needToExecute = useAtomValue(needToExecuteAtom)
   const setNeedToExecute = useSetAtom(updateNeedToExecute)

   useEffect(() => {
      const timeout = setTimeout(() => {
         if (needToExecute) {
            execute()
            setNeedToExecute(false)
         }
         // Wait for atoms to load from local storage.
      }, 2000)
      return () => clearTimeout(timeout)
   }, [needToExecute, setNeedToExecute, execute])
}
