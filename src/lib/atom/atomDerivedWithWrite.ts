import { Atom, atom, PrimitiveAtom } from 'jotai'

const atomDerivedWithWrite = <T>(baseAtom: Atom<T>): PrimitiveAtom<T> => {
   const overrideAtom = atom<T | null>(null)
   return atom(
      get => get(overrideAtom) ?? get(baseAtom),
      (_get, set, value: T) => set(overrideAtom, value)
   ) as PrimitiveAtom<T>
}

export default atomDerivedWithWrite
