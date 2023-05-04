import { Getter, atom, useAtomValue } from 'jotai'
import { DependencyList, useMemo } from 'react'

export const useDerivedAtomValue = <T>(func: (getter: Getter) => T, deps?: DependencyList): T => {
   return useAtomValue(useMemo(() => atom(get => func(get)), deps ?? []))
}
