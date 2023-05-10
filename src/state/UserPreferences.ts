import { SetStateAction, WritableAtom, atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { focusAtom } from 'jotai-optics'

export interface UserPreferences {
   theme: Theme
   shouldTransferPlaybackOnMount: boolean
   seekInterval: number
}

export const Themes = ['light', 'dark', 'emerald', 'emerald-dark', 'spotify-dark'] as const
export type Theme = (typeof Themes)[number]

const userPreferencesAtom = atomWithStorage<UserPreferences>('MuseUserPreferences', {
   theme: 'dark',
   shouldTransferPlaybackOnMount: false,
   seekInterval: 10000,
})

export const themeAtom: WritableAtom<Theme, [SetStateAction<Theme>], void> = focusAtom(userPreferencesAtom, optic =>
   optic.prop('theme')
)
// Ensure that we always have a valid theme. Default is dark mode.
themeAtom.onMount = set =>
   set((theme: Theme) => {
      if (Themes.includes(theme)) {
         return theme
      } else {
         return 'dark'
      }
   })

const isDarkThemeAtom = atom(get => get(themeAtom).includes('dark'))

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
export const useSeekInterval = () => useAtomValue(seekIntervalAtom)
export const useSetSeekInterval = () => useSetAtom(seekIntervalAtom)
