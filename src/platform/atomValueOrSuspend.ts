import { Atom, atom } from 'jotai'

const atomValueOrSuspend = <T,>(value: Atom<T | null | undefined>) => atom<Promise<T>>((get) => {
    const currentValue = get(value)
    if (currentValue) {
        return Promise.resolve(currentValue)
    }

    return new Promise(() => { })
})

export default atomValueOrSuspend
