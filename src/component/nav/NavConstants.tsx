import { ChatBubbleBottomCenterTextIcon, MagnifyingGlassIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'

export type NavItem = {
   name: string
   href: string
   icon: Icon
}

export type Icon = (props: React.ComponentProps<'svg'> & { title?: string; titleId?: string }) => JSX.Element

export const NAVIGATION: NavItem[] = [
   // { name: 'Home', href: '/app/home', icon: HomeIcon },
   { name: 'Reviews', href: '/app/reviews', icon: ChatBubbleBottomCenterTextIcon },
   { name: 'Playlists', href: '/app/playlists', icon: MusicalNoteIcon },
   { name: 'Search', href: '/app/search', icon: MagnifyingGlassIcon },
   // { name: 'Settings', href: '/app/settings', icon: CogIcon },
]
