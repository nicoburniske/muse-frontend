import { atom } from 'jotai'
import { focusAtom } from 'jotai/optics'
import { atomWithStorage } from 'jotai/utils'
import { useAtomsDebugValue } from 'jotai/devtools'

export const currentUserIdAtom = atomWithStorage<string>('currentUser', '')
export interface SelectedTrack { reviewId: string, trackId: string }
export const selectedTrackAtom = atom<SelectedTrack | undefined>(undefined)

export const searchAtom = atom<string>('')
export const searchLoweredAtom = atom<string>(get => get(searchAtom).toLowerCase())

interface NowPlaying {
    trackId: string
    isLiked: boolean
}
export const allReviewTracks = atom(new Set<string>())
export const nowPlayingTrackAtom = atom<NowPlaying | undefined>(undefined)
export const nowPlayingEnabledAtom = atom((get) => {
    const trackId = get(nowPlayingTrackAtom)?.trackId
    const allTracks = get(allReviewTracks)
    return (trackId !== undefined && allTracks.has(trackId))
})

export const nowPlayingTrackIdAtom =
    focusAtom(nowPlayingTrackAtom, (optic) => optic.optional().prop('trackId'))
export const nowPlayingIsLikedAtom =
    focusAtom(nowPlayingTrackAtom, (optic) => optic.optional().prop('isLiked'))

export const DebugAtoms = () => {
    useAtomsDebugValue()
    return null
}