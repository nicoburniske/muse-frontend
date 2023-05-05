import { useStore } from 'jotai/react'
import type { Atom, WritableAtom } from 'jotai/vanilla'
import { useCallback, useEffect } from 'react'

type GetAtom<Value> = () => Value
type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result
type Options = Parameters<typeof useStore>[0]

const isWritable = <Value, Args extends unknown[], Result>(
   atom: Atom<Value> | WritableAtom<Value, Args, Result>
): atom is WritableAtom<Value, Args, Result> => !!(atom as WritableAtom<Value, Args, Result>).write

export function useTransientAtom<Value, Args extends unknown[], Result>(
   atom: WritableAtom<Value, Args, Result>,
   options?: Options
): [GetAtom<Value>, SetAtom<Args, Result>]

export function useTransientAtom<Value>(atom: Atom<Value>, options?: Options): [GetAtom<Value>, never]

export function useTransientAtom<Value, Args extends unknown[], Result>(
   atom: Atom<Value> | WritableAtom<Value, Args, Result>,
   options?: Options
) {
   const store = useStore(options)

   useEffect(() => {
      const unsubscribe = store.sub(atom, () => {
         // empty
      })
      return unsubscribe
   }, [store, atom])

   const getAtom = useCallback(() => store.get(atom), [store, atom])

   const setAtom = useCallback(
      (...args: Args) => {
         if (isWritable(atom)) {
            return store.set(atom, ...args)
         }
         throw new Error('not writable atom')
      },
      [store, atom]
   )

   return [getAtom, setAtom]
}
