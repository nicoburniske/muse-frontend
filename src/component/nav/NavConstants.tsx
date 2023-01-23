import { ChatBubbleBottomCenterTextIcon, CogIcon, HomeIcon } from '@heroicons/react/24/outline'

export const NAVIGATION = [
    { name: 'Home', href: '/', icon: HomeIcon, current: false },
    { name: 'Reviews', href: '#', icon: ChatBubbleBottomCenterTextIcon, current: true },
    { name: 'Settings', href: '#', icon: CogIcon, current: false },
]