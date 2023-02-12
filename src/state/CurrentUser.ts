import { CurrentUserQuery, useCurrentUserQuery } from 'graphql/generated/schema'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import atomValueOrSuspend from 'platform/atom/atomValueOrSuspend'
import { useEffect } from 'react'

type CurrentUser = CurrentUserQuery['user']
const maybeCurrentUserAtom = atom<CurrentUser | undefined>(undefined)
const currentUserIdAtom = atomValueOrSuspend(atom(get => get(maybeCurrentUserAtom)?.id))
const currentDisplayName = atomValueOrSuspend(
   atom(get => {
      return get(maybeCurrentUserAtom)?.spotifyProfile?.displayName ?? get(maybeCurrentUserAtom)?.id
   })
)

export const useCurrentUserId = () => useAtomValue(currentUserIdAtom)
export const useCurrentDisplayName = () => useAtomValue(currentDisplayName)

export const SyncCurrentUser = () => {
   useAtom(loadable(currentUserIdAtom))

   const { data } = useCurrentUserQuery(
      {},
      {
         staleTime: 10 * 60 * 1000,
         cacheTime: 10 * 60 * 1000,
      }
   )
   const setCurrentUser = useSetAtom(maybeCurrentUserAtom)

   useEffect(() => {
      setCurrentUser(data?.user)
   }, [data])

   return null
}
