import { ComponentProps } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/lib/component/Avatar'

export const MuseAvatar = (props: ComponentProps<typeof Avatar>) => {
   return (
      <Avatar {...props}>
         <AvatarImage src='/logo.png' alt='Muse Logo' className='object-contain' />
         <AvatarFallback delayMs={100}>M</AvatarFallback>
      </Avatar>
   )
}
