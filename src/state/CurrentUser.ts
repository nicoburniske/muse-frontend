import { CurrentUserQuery, useCurrentUserQuery } from 'graphql/generated/schema'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import atomValueOrSuspend from 'platform/atom/atomValueOrSuspend'
import { useCallback, useEffect } from 'react'

const maybeCurrentUserIdAtom = atom<string | undefined>(undefined)
const currentUserIdAtom = atomValueOrSuspend(maybeCurrentUserIdAtom)

export const useCurrentUserId = () => useAtomValue(currentUserIdAtom)

export const SyncCurrentUser = () => {
    useAtom(loadable(currentUserIdAtom))

    const { data } = useCurrentUserQuery({}, {
        staleTime: 10 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        select: useCallback((data: CurrentUserQuery) => data?.user?.id, [])
    })
    const setCurrentUser = useSetAtom(maybeCurrentUserIdAtom)

    useEffect(() => {
        setCurrentUser(data)
    }, [data])

    return null
}