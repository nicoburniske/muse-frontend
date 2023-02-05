import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'

interface NowPlaying {
   trackId: string
}

export const nowPlayingTrackAtom = atom<NowPlaying | undefined>(undefined)
nowPlayingTrackAtom.debugLabel = 'nowPlayingTrackAtom'

export const isPlayingAtom = atom(get => get(nowPlayingTrackAtom) !== undefined)

export const nowPlayingTrackIdAtom = focusAtom(nowPlayingTrackAtom, optic => optic.optional().prop('trackId'))

export const nowPlayingEnabledAtom = atom(false)
nowPlayingEnabledAtom.debugLabel = 'nowPlayingEnabledAtom'
