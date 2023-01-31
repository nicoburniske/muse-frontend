import { Atom, atom } from 'jotai'

const atomValueOrSuspend = <T,>(valueAtom: Atom<T | null | undefined>) => atom<Promise<T>>((get) => {
    const currentValue = get(valueAtom)
    if (currentValue) {
        return Promise.resolve(currentValue)
    }

    return new Promise(() => { })
})

export default atomValueOrSuspend
