import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { useAtomsDebugValue, useAtomsDevtools } from 'jotai-devtools'


export interface SelectedTrack { reviewId: string, trackId: string }
export const selectedTrackAtom = atom<SelectedTrack | undefined>(undefined)

export const searchAtom = atom<string>('')
export const searchLoweredAtom = atom<string>(get => get(searchAtom).toLowerCase())

interface NowPlaying {
    trackId: string
    isLiked: boolean
}
export const nowPlayingTrackAtom = atom<NowPlaying | undefined>(undefined)
nowPlayingTrackAtom.debugLabel = 'nowPlayingTrackAtom'

export const isPlayingAtom = atom(get => get(nowPlayingTrackAtom) !== undefined)

export const nowPlayingTrackIdAtom =
    focusAtom(nowPlayingTrackAtom, (optic) => optic.optional().prop('trackId'))
export const nowPlayingIsLikedAtom =
    focusAtom(nowPlayingTrackAtom, (optic) => optic.optional().prop('isLiked'))

export const allReviewTracksAtom = atom(new Set<string>())
export const nowPlayingEnabledAtom = atom((get) => {
    const trackId = get(nowPlayingTrackAtom)?.trackId
    const allTracks = get(allReviewTracksAtom)
    return (trackId !== undefined && allTracks.has(trackId))
})

export const DebugAtomsComponents = () => {
    useAtomsDebugValue()
}

export const DebugAtomsReduxDevTools = () => {
    useAtomsDevtools('Muse')
    return null
}
