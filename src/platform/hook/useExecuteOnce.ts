import { useEffect, useRef } from 'react'

type EffectCallback = () => (void | Destructor)
type Destructor = () => void

export const useExecuteOnce = (condition: () => boolean, fn: EffectCallback, deps: any[]) => {
    const ref = useRef(false)
    useEffect(() => {
        if (condition() && !ref.current) {
            fn()
            ref.current = true
        }
    }, deps)
}
