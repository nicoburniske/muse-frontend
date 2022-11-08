import { SetStateAction } from "jotai"
import { Dispatch, useEffect, useState } from "react"

export default function useStateWithSyncedDefault<T>(defaultValue: T, debounce: number = 0): [T, Dispatch<SetStateAction<T>>, () => void] {
    const [state, setState] = useState(defaultValue)
    useEffect(() => { setTimeout(() => setState(defaultValue), debounce) }, [defaultValue])
    return [state, setState, (() => setState(defaultValue)) as () => void]
}

