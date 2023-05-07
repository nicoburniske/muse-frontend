import {
   ChatBubbleBottomCenterTextIcon,
   CogIcon,
   MagnifyingGlassIcon,
   MusicalNoteIcon,
   UserIcon,
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

import { usePreferencesModal } from '@/component/preferences/UserPreferencesForm'
import { useCurrentUserId } from '@/state/CurrentUser'

export type NavItem = {
   name: string
   href: string
   icon: Icon
   action: () => () => void
   className?: string
}

export type Icon = (props: React.ComponentProps<'svg'> & { title?: string; titleId?: string }) => JSX.Element

const useNavAction = (path: string) => {
   const nav = useNavigate()
   return () => nav(path)
}

const useOpenPreferences = () => {
   const { openPreferencesModal } = usePreferencesModal()
   return () => openPreferencesModal()
}

export const NAV: readonly NavItem[] = [
   {
      name: 'Reviews',
      href: '/app/reviews',
      icon: ChatBubbleBottomCenterTextIcon,
      action: () => useNavAction('/app/reviews'),
   },
   { name: 'Playlists', href: '/app/playlists', icon: MusicalNoteIcon, action: () => useNavAction('/app/playlists') },
   { name: 'Search', href: '/app/search', icon: MagnifyingGlassIcon, action: () => useNavAction('/app/search') },
   {
      name: 'Settings',
      href: '/app/settings',
      icon: CogIcon,
      action: () => useOpenPreferences(),
      className: 'muse-preferences',
   },
] as const

export const MOBILE_NAV: readonly NavItem[] = [
   ...NAV,
   {
      name: 'Profile',
      href: '/app/profile',
      icon: UserIcon,
      action: () => useNavToProfile(),
   },
]

const useNavToProfile = () => {
   const userId = useCurrentUserId()
   const nav = useNavigate()
   return () => nav(`/app/user/${userId}`)
}
