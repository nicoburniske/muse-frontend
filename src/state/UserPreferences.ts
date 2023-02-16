import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { atomWithStorage } from 'jotai/utils'

export interface UserPreferences {
   theme: Theme
   shouldTransferPlaybackOnMount: boolean
   seekInterval: number
}

export enum Theme {
   Acid = 'acid',
   Aqua = 'aqua',
   Autumn = 'autumn',
   Black = 'black',
   Bumblebee = 'bumblebee',
   Business = 'business',
   Cymk = 'cmyk',
   Coffee = 'coffee',
   Corporate = 'corporate',
   Cupcake = 'cupcake',
   Cyberpunk = 'cyberpunk',
   Dark = 'dark',
   Dracula = 'dracula',
   Emerald = 'emerald',
   Fantasy = 'fantasy',
   Forest = 'forest',
   Garden = 'garden',
   Halloween = 'halloween',
   Lemonade = 'lemonade',
   Light = 'light',
   Lofi = 'lofi',
   Luxury = 'luxury',
   Night = 'night',
   Pastel = 'pastel',
   Retro = 'retro',
   Synthwave = 'synthwave',
   Valentine = 'valentine',
   Winter = 'winter',
   Wireframe = 'wireframe',
}

const isDark = (theme: Theme) => {
   switch (theme) {
      case Theme.Black:
      case Theme.Business:
      case Theme.Coffee:
      case Theme.Dark:
      case Theme.Dracula:
      case Theme.Forest:
      case Theme.Halloween:
      case Theme.Luxury:
      case Theme.Night:
      case Theme.Synthwave:
         return true
      default:
         return false
   }
}

const userPreferencesAtom = atomWithStorage<UserPreferences>('MuseUserPreferences', {
   theme: Theme.Black,
   shouldTransferPlaybackOnMount: false,
   seekInterval: 10000,
})

export const themeAtom = focusAtom(userPreferencesAtom, optic => optic.prop('theme'))
const isDarkThemeAtom = atom(get => isDark(get(themeAtom)))
export const useTheme = () => useAtom(themeAtom)
export const useThemeValue = () => useAtomValue(themeAtom)
export const useSetTheme = () => useSetAtom(themeAtom)
export const useIsDarkTheme = () => useAtomValue(isDarkThemeAtom)

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
