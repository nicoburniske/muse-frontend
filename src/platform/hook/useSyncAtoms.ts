import { Atom, PrimitiveAtom, atom, useSetAtom, useStore } from 'jotai'
import { useEffect, useMemo } from 'react'

export default function useSyncAtoms<Value>(atomToSet: PrimitiveAtom<Value>, atomToGet: Atom<Value>) {
    const store = useStore()

    const sync = useSetAtom(useMemo(() => atom(null, (get, set) =>
        set(atomToSet, get(atomToGet))
    ), [atomToSet, atomToGet]))

    useEffect(() => store.sub(atomToGet, sync), [store, sync])
}
