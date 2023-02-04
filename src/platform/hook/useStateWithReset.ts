import { Dispatch, SetStateAction, useState } from 'react'

export default function useStateWithReset<T>(defaultValue: T): [T, Dispatch<SetStateAction<T>>, () => void] {
   const [state, setState] = useState(defaultValue)
   return [state, setState, (() => setState(defaultValue)) as () => void]
}
