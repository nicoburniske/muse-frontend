import { atom, useAtomValue, useSetAtom } from 'jotai'
import { SpotifyWebApi } from 'spotify-web-api-ts'

import atomValueOrSuspend from '@/lib/atom/atomValueOrSuspend'
import atomValueOrThrow from '@/lib/atom/atomValueOrThrow'
// import atomWithSuspend from '@/lib/atom/atomWithSuspend'

const maybeAccessToken = atom<string | null>(null)
const accessTokenAtom = atomValueOrSuspend(maybeAccessToken)
const unsafeAccessTokenAtom = atomValueOrThrow(maybeAccessToken)

accessTokenAtom.debugLabel = 'accessTokenAtom'
export const useSetAccessToken = () => useSetAtom(maybeAccessToken)

export const spotifyClientAtom = atom(async get => {
   const accessToken = await get(accessTokenAtom)
   return new SpotifyWebApi({ accessToken })
})

export const unsafeSpotifyClientAtom = atom(get => {
   const accessToken = get(unsafeAccessTokenAtom)
   return new SpotifyWebApi({ accessToken })
})

export const useSpotifyClient = () => useAtomValue(spotifyClientAtom)
