import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import useStateWithReset from './useStateWithReset'

type ToggleFunc<T> = (value: T) => T
type StateSupplier<S> = (defaultState: S) => [S, Dispatch<SetStateAction<S>>]

export default function useToggle<T>(toggleFunc: ToggleFunc<T>) {
   return function withState(s: StateSupplier<T>) {
      return function createToggle(initial: T): [T, Dispatch<SetStateAction<T>>, () => void] {
         const [state, setState] = s(initial)
         const toggle = useCallback(() => {
            setState(toggleFunc(state))
         }, [state])
         return [state, setState, toggle]
      }
   }
}

export const useBoolToggle = useToggle<boolean>(a => !a)(useState)
export const useBoolToggleSynced = useToggle<boolean>(a => !a)(useStateWithReset as unknown as StateSupplier<boolean>)
