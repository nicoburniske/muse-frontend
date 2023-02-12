import { SetStateAction, atom, useAtomValue, useSetAtom } from 'jotai'
import { useAtomsDebugValue, useAtomsDevtools } from 'jotai-devtools'
import atomWithDebounce from 'platform/atom/atomWithDebounce'

export const { currentValueAtom: currentSearchAtom, debouncedValueAtom: searchAtom } = atomWithDebounce<string>('', 200)
export const searchLoweredAtom = atom<string>(get => get(searchAtom).toLowerCase())
export const useSearchAtom = (): [string, SetStateAction<string>] => {
   return [useAtomValue(currentSearchAtom), useSetAtom(searchAtom) as SetStateAction<string>]
}

export const DebugAtomsComponents = () => {
   useAtomsDebugValue()
}

export const DebugAtomsReduxDevTools = () => {
   useAtomsDevtools('Muse')
   return null
}
