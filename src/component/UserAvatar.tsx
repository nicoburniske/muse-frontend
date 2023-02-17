import { UserWithSpotifyOverviewFragment } from 'graphql/generated/schema'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'platform/component/Tooltip'
import { useMemo } from 'react'
import { cn, nonNullable } from 'util/Utils'

export enum TooltipPos {
   None = '',
   Left = 'md:tooltip-left',
   Right = 'md:tooltip-right',
   Up = 'md:tooltip-up',
   Down = 'md:tooltip-bottom',
}

const size = 'w-6 md:w-8 lg:w-8'

interface UserAvatarProps {
   dateAdded?: string
   user: UserWithSpotifyOverviewFragment
}

export default function UserAvatarTooltip({ dateAdded, user }: UserAvatarProps) {
   const images = user?.spotifyProfile?.images
   const image = images?.at(1) ?? images?.at(0)

   const displayName = user.spotifyProfile?.displayName ?? undefined
   const userId = user.id

   const name = displayName ?? userId

   return (
      <TooltipProvider delayDuration={300}>
         <Tooltip>
            <TooltipTrigger asChild>
               <UserAvatar name={name} image={image} className={size} />
            </TooltipTrigger>
            <TooltipContent side='right' align='start' className='bg-primary text-primary-content'>
               <p>
                  {name} on {dateAdded}
               </p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}

export const UserAvatar = ({ name, image, className }: { name: string; image?: string; className?: string }) => {
   if (nonNullable(image) && image.length > 0) {
      return (
         <div className={'avatar'}>
            <div className={cn('rounded-full ', className)}>
               <img src={image} />
            </div>
         </div>
      )
   } else {
      return (
         <div className={'avatar placeholder'}>
            <div className={cn('w-12 rounded-full bg-neutral-focus text-neutral-content', className)}>
               <span>{name.slice(0, 1)}</span>
            </div>
         </div>
      )
   }
}
