import { useEffect, useState } from "react"

export default function useStateWithSyncdDefault<T>(defaultValue: T) {
    const state = useState(defaultValue)
    const [, setState] = state
    useEffect(() => setState(defaultValue), [defaultValue])
    return state
}

