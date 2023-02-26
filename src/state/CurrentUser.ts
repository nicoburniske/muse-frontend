import { CurrentUserQuery, useCurrentUserQuery } from 'graphql/generated/schema'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import atomValueOrSuspend from 'platform/atom/atomValueOrSuspend'
import { useEffect } from 'react'

type CurrentUser = CurrentUserQuery['user']
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
export const useCurrentDisplayName = () => useAtomValue(currentDisplayName)
export const useCurrentUserImage = () => useAtomValue(currentUserImage)

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
      setCurrentUser(data?.user)
   }, [setCurrentUser, data])

   return null
}
