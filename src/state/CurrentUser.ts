import { atom } from 'jotai'
import atomValueOrSuspend from 'platform/atom/atomValueOrSuspend'

export const maybeCurrentUserIdAtom = atom<string | undefined>(undefined)
export const currentUserAtom = atomValueOrSuspend(maybeCurrentUserIdAtom)

