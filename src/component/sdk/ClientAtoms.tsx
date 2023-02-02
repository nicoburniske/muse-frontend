import { atom, useAtomValue, useSetAtom } from 'jotai'
import atomWithSuspend from 'platform/atom/atomWithSuspend'
import { SpotifyWebApi } from 'spotify-web-api-ts'

const accessTokenAtom = atomWithSuspend<string>()
accessTokenAtom.debugLabel = 'accessTokenAtom'
export const useSetAccessToken = () => useSetAtom(accessTokenAtom)

export const spotifyClientAtom = atom(async (get) => {
    const accessToken = await get(accessTokenAtom)
    return new SpotifyWebApi({ accessToken })
})
export const useSpotifyClient = () => useAtomValue(spotifyClientAtom)