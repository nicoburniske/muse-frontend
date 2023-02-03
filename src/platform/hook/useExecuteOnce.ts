import { useEffect, useRef } from 'react'

export const useExecuteOnce = (condition: () => boolean, fn: () => void, deps: any[]) => {
    const ref = useRef(false)
    useEffect(() => {
        if (condition() && !ref.current) {
            fn()
            ref.current = true
        }
    }, deps)
}
