import { SetStateAction } from "jotai"
import { Dispatch, useEffect, useState } from "react"

export default function useStateWithSyncedDefault<T>(defaultValue: T): [T, Dispatch<SetStateAction<T>>, () => void] {
    const [state, setState] = useState(defaultValue)
    useEffect(() => setState(defaultValue), [defaultValue])

    return [state, setState, (() => setState(defaultValue)) as () => void] 
}

