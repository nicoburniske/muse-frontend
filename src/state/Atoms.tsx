import { atom } from 'jotai'
import { focusAtom } from 'jotai/optics'
import { atomWithStorage } from 'jotai/utils'
import { useAtomsDebugValue } from 'jotai/devtools'

export const currentUserIdAtom = atomWithStorage<string>('currentUser', '')
export interface SelectedTrack { reviewId: string, trackId: string }
export const selectedTrackAtom = atom<SelectedTrack | undefined>(undefined)

export const searchAtom = atom<string>('')
export const searchLoweredAtom = atom<string>(get => get(searchAtom).toLowerCase())

interface CommentModalData {
    onSubmit: (comment: string) => Promise<void>
    trackId: string
    onCancel: () => void
    title: string
    initialValue?: string
}

export const openCommentModalAtom = atom<undefined | CommentModalData>(undefined)

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

export enum Theme {
    Light = 'light',
    Dark = 'dark',
    Cupcake = 'cupcake',
    Bumblebee = 'bumblebee',
    Emerald = 'emerald',
    Corporate = 'corporate',
    Synthwave = 'synthwave',
    Retro = 'retro',
    Cyberpunk = 'cyberpunk',
    Valentine = 'valentine',
    Halloween = 'halloween',
    Garden = 'garden',
    Forest = 'forest',
    Aqua = 'aqua',
    Lofi = 'lofi',
    Pastel = 'pastel',
    Fantasy = 'fantasy',
    Wireframe = 'wireframe',
    Black = 'black',
    Luxury = 'luxury',
    Darcula = 'dracula',
    Cymk = 'cmyk',
    Autumn = 'autumn',
    Business = 'business',
    Acid = 'acid',
    Lemonaid = 'lemonade',
    Night = 'night',
    Coffee = 'coffee',
    Winter = 'winter'
}

export const themeAtom = atomWithStorage<Theme>('muse-app-theme', Theme.Black)

export const DebugAtoms = () => {
    useAtomsDebugValue()
    return null
}