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
   Emerald = 'emerald',
   EmeraldDark = 'emerald-dark',
}

const isDark = (theme: Theme) => {
   return theme === Theme.Dark || theme === Theme.EmeraldDark
}

const userPreferencesAtom = atomWithStorage<UserPreferences>('MuseUserPreferences', {
   theme: Theme.Dark,
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
