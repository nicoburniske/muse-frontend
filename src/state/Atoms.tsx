import { atom } from 'jotai'
import { useAtomsDebugValue, useAtomsDevtools } from 'jotai-devtools'

export const searchAtom = atom<string>('')
export const searchLoweredAtom = atom<string>(get => get(searchAtom).toLowerCase())

export const DebugAtomsComponents = () => {
   useAtomsDebugValue()
}

export const DebugAtomsReduxDevTools = () => {
   useAtomsDevtools('Muse')
   return null
}
