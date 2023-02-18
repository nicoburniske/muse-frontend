import {
   ChatBubbleBottomCenterTextIcon,
   CogIcon,
   MagnifyingGlassIcon,
   MusicalNoteIcon,
} from '@heroicons/react/24/outline'
import { usePreferencesModal } from 'component/preferences/UserPreferencesForm'
import { useNavigate } from 'react-router-dom'

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

export const NAVIGATION: NavItem[] = [
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
]
