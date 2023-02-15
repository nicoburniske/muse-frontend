import { DependencyList, EffectCallback, useEffect } from 'react'
import { useDeepCompareMemoize } from './useDeepCompareMemoize'

const useEffectDeepEqual = (callback: EffectCallback, deps?: DependencyList) =>
   useEffect(callback, useDeepCompareMemoize(deps))
export default useEffectDeepEqual
