import { PlaybackDeviceFragment } from 'graphql/generated/schema'
import { atom } from 'jotai'

export const selectedTrack = atom<string | undefined>(undefined)
export const currentlyPlayingTrack = atom<string | undefined>(undefined)
export const playbackDevices = atom<PlaybackDeviceFragment[]>([])

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

export const themeAtom = atom<Theme>(Theme.Dark)