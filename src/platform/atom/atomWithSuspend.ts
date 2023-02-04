import { atom } from 'jotai'

const atomWithSuspend = <T>() => {
   const valueAtom = atom(new Promise(() => {}) as Promise<T>)
   return atom(
      get => get(valueAtom),
      (_get, set, newValue: T) => set(valueAtom, Promise.resolve(newValue))
   )
}

export default atomWithSuspend
