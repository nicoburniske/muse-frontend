import { atom, useAtomValue, useSetAtom } from 'jotai'
import atomWithSuspend from 'platform/atomWithSuspend'
import { SpotifyWebApi } from 'spotify-web-api-ts'

const accessTokenAtom = atomWithSuspend<string>()
accessTokenAtom.debugLabel = 'accessTokenAtom'
export const useSetAccessToken = () => useSetAtom(accessTokenAtom)

export const spotifyClientAtom = atom((get) => new SpotifyWebApi({ accessToken: get(accessTokenAtom) }))
export const useSpotifyClient = () => useAtomValue(spotifyClientAtom)