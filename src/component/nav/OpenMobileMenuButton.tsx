import { useSetAtom } from 'jotai'
import { mobileMenuOpenAtom } from './MobileMenu'

type OpenMobileMenuButtonProps = {
   children: (onClick: () => void) => React.ReactElement
}

export const OpenMobileMenuButton = ({ children }: OpenMobileMenuButtonProps) => {
   const setMobileMenuOpen = useSetAtom(mobileMenuOpenAtom)

   return children(() => setMobileMenuOpen(true))
}
