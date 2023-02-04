import { atom } from 'jotai'

export interface SelectedTrack {
   reviewId: string
   trackId: string
}
export const selectedTrackAtom = atom<SelectedTrack | undefined>(undefined)
