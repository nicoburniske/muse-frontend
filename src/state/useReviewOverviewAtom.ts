import { atom, useAtomValue } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'
import { atomsWithQuery } from 'jotai-tanstack-query'
import { useMemo } from 'react'

import { useDetailedReviewQuery } from '@/graphql/generated/schema'

const reviewDetailsQueryAtoms = atomFamily((reviewId: string) => makeDetailedReviewAtom(reviewId)[0])

const makeDetailedReviewAtom = (reviewId: string) =>
   atomsWithQuery(() => {
      const input = { reviewId }
      const func = () => useDetailedReviewQuery.fetcher(input)()
      return {
         queryKey: useDetailedReviewQuery.getKey(input),
         queryFn: func,
      }
   })

export const useReviewOverviewAtom = (reviewId: string) => {
   const detailsAtom = useMemo(() => atom(get => get(reviewDetailsQueryAtoms(reviewId))), [reviewId])
   const loaded = useAtomValue(loadable(detailsAtom))
   if (loaded.state === 'hasError') {
      throw loaded.error
   } else if (loaded.state === 'loading') {
      return undefined
   } else {
      return loaded.data
   }
}
