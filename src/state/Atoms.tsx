import { PlaybackDeviceFragment } from 'graphql/generated/schema'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const selectedTrackAtom = atom<string | undefined>(undefined)
export const currentlyPlayingTrackAtom = atom<string | undefined>(undefined)
export const playbackDevicesAtom = atom<PlaybackDeviceFragment[]>([])

interface CommentModalData {
    onSubmit: (comment: string) => Promise<void>
    onCancel: () => void
    title: string
    initialValue?: string
}

export const openCommentModalAtom = atom<undefined | CommentModalData> (undefined)

export enum Theme {
    Light = "light",
    Dark = "dark",
    Cupcake = "cupcake",
    Bumblebee = "bumblebee",
    Emerald = "emerald",
    Corporate = "corporate",
    Synthwave = "synthwave",
    Retro = "retro",
    Cyberpunk = "cyberpunk",
    Valentine = "valentine",
    Halloween = "halloween",
    Garden = "garden",
    Forest = "forest",
    Aqua = "aqua",
    Lofi = "lofi",
    Pastel = "pastel",
    Fantasy = "fantasy",
    Wireframe = "wireframe",
    Black = "black",
    Luxury = "luxury",
    Darcula = "dracula",
    Cymk = "cmyk",
    Autumn = "autumn",
    Business = "business",
    Acid = "acid",
    Lemonaid = "lemonade",
    Night = "night",
    Coffee = "coffee",
    Winter = "winter"
}

export const themeAtom = atomWithStorage<Theme>('muse-app-theme', Theme.Dark)