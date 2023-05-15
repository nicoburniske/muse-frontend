import { useCallback } from 'react'

import { CurrentUserQuery, useCurrentUserQuery } from '@/graphql/generated/schema'

export const useIsLoggedIn = () => {
   const { data } = useCurrentUserQuery(
      {},
      {
         staleTime: 0,
         select: useCallback((data: CurrentUserQuery) => data?.me?.spotifyProfile?.displayName ?? data?.me?.id, []),
      }
   )
   return data !== undefined
}
