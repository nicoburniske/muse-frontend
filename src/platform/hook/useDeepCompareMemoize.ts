import equal from 'fast-deep-equal'
import { useMemo, useRef } from 'react'

/**
 * @param value the value to be memoized (usually a dependency list)
 * @returns a memoized version of the value as long as it remains deeply equal
 */
export function useDeepCompareMemoize<T>(value: T) {
   const ref = useRef<T>(value)
   const signalRef = useRef<number>(0)

   if (!equal(value, ref.current)) {
      ref.current = value
      signalRef.current += 1
   }

   return useMemo(() => ref.current, [signalRef.current])
}
