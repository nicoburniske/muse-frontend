import { atom, SetStateAction, useAtomValue, useSetAtom } from 'jotai'
import { useAtomsDebugValue, useAtomsDevtools } from 'jotai-devtools'

import atomWithDebounce from '@/lib/atom/atomWithDebounce'
import { getOS } from '@/util/Utils'

export const osAtom = atom<string | undefined>(() => getOS())
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
