import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { atomWithStorage } from 'jotai/utils'

export interface UserPreferences {
   theme: Theme
   shouldTransferPlaybackOnMount: boolean
   seekInterval: number
}

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
   Winter = 'winter',
}

const userPreferencesAtom = atomWithStorage<UserPreferences>('MuseUserPreferences', {
   theme: Theme.Business,
   shouldTransferPlaybackOnMount: false,
   seekInterval: 10000,
})

export const themeAtom = focusAtom(userPreferencesAtom, optic => optic.prop('theme'))
export const useTheme = () => useAtom(themeAtom)
export const useThemeValue = () => useAtomValue(themeAtom)
export const useSetTheme = () => useSetAtom(themeAtom)

export const transferPlaybackOnMountAtom = focusAtom(userPreferencesAtom, optic =>
   optic.prop('shouldTransferPlaybackOnMount')
)
export const useShouldTransferPlaybackOnMount = () => useAtom(transferPlaybackOnMountAtom)
export const useShouldTransferPlaybackOnMountValue = () => useAtomValue(transferPlaybackOnMountAtom)
export const useSetShouldTransferPlaybackOnMount = () => useSetAtom(transferPlaybackOnMountAtom)

export const seekIntervalAtom = focusAtom(userPreferencesAtom, optic => optic.prop('seekInterval'))
export const setSeekIntervalAtom = atom(null, (_get, set, value: number) => {
   set(seekIntervalAtom, value)
})
export const useSeekInterval = () => useAtomValue(seekIntervalAtom)
export const useSetSeekInterval = () => useSetAtom(setSeekIntervalAtom)
