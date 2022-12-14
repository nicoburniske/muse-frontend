import { atom, Atom } from 'jotai'

const derivedAtomWithWrite = <T,>(baseAtom: Atom<T>) => {
    const overrideAtom = atom<T | null>(null)
    return atom(
        get => get(overrideAtom) ?? get(baseAtom),
        (_get, set, value: T) => set(overrideAtom, value)
    )
}

export default derivedAtomWithWrite