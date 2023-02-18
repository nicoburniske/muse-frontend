import { Atom, WritableAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

// TODO: Implement with store subscribe.
export const useOnFirstMountAtom = (
   needToExecuteAtom: Atom<boolean>,
   updateExecutedAtom: WritableAtom<boolean, boolean[], void>,
   execute: () => void
) => {
   const needToExecute = useAtomValue(needToExecuteAtom)
   const setExecuted = useSetAtom(updateExecutedAtom)

   useEffect(() => {
      if (needToExecute) {
         execute()
         setExecuted(false)
      }
   }, [needToExecute, setExecuted, execute])
}
