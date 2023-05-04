import { Atom, atom } from 'jotai'

const atomValueOrThrow = <T>(valueAtom: Atom<T | null | undefined>) =>
   atom<T>(get => {
      const currentValue = get(valueAtom)
      if (currentValue !== null && currentValue !== undefined) {
         return currentValue
      }

      throw new Error(`atomValueOrThrow: atom ${valueAtom.debugLabel} is missing value.`)
   })

export default atomValueOrThrow
