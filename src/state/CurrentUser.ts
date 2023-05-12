import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import { useEffect } from 'react'

import { CurrentUserQuery, useCurrentUserQuery } from '@/graphql/generated/schema'
import atomValueOrSuspend from '@/lib/atom/atomValueOrSuspend'

type CurrentUser = CurrentUserQuery['me']
const maybeCurrentUserAtom = atom<CurrentUser | undefined>(undefined)
const currentUserAtom = atomValueOrSuspend(atom(get => get(maybeCurrentUserAtom)))
const currentUserIdAtom = atom(get => get(currentUserAtom).then(u => u.id))
const currentDisplayName = atom(async get => {
   const currentUser = await get(currentUserAtom)
   return currentUser.spotifyProfile?.displayName ?? currentUser.id
})
const currentUserImage = atom(async get => {
   const currentUser = await get(currentUserAtom)
   return currentUser.spotifyProfile?.images.at(0)
})

export const useCurrentUserId = () => useAtomValue(currentUserIdAtom)
export const useCurrentUserDisplayName = () => useAtomValue(currentDisplayName)
export const useCurrentUserImage = () => useAtomValue(currentUserImage)
export const useCurrentUserCountry = () => useAtomValue(atom(get => get(maybeCurrentUserAtom)?.spotifyProfile?.country))

export const SyncCurrentUser = () => {
   useAtom(loadable(currentUserAtom))

   const { data } = useCurrentUserQuery(
      {},
      {
         staleTime: 10 * 60 * 1000,
         cacheTime: 10 * 60 * 1000,
      }
   )
   const setCurrentUser = useSetAtom(maybeCurrentUserAtom)

   useEffect(() => {
      setCurrentUser(data?.me)
   }, [setCurrentUser, data])

   return null
}
