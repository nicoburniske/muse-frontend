import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { focusAtom } from 'jotai-optics'

export interface UserPreferences {
   theme: Theme
   shouldTransferPlaybackOnMount: boolean
   seekInterval: number
}

export const Themes = ['light', 'dark', 'emerald', 'emerald-dark', 'spotify-dark'] as const
export type Theme = (typeof Themes)[number]

const isDark = (theme: Theme) => {
   return theme.includes('dark')
}

const userPreferencesAtom = atomWithStorage<UserPreferences>('MuseUserPreferences', {
   theme: 'dark',
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
