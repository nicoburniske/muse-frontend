import { UserWithSpotifyOverviewFragment } from 'graphql/generated/schema'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'platform/component/Tooltip'
import { cn, nonNullable } from 'util/Utils'

const size = 'w-6 md:w-8 lg:w-8'

type UserAvatarTooltipProps = {
   dateAdded?: string
   user: UserWithSpotifyOverviewFragment
}

export function UserAvatarTooltip({ dateAdded, user }: UserAvatarTooltipProps) {
   const images = user?.spotifyProfile?.images
   const image = images?.at(1) ?? images?.at(0)

   const displayName = user.spotifyProfile?.displayName
   const userId = user.id

   const name = displayName ?? userId

   return (
      <TooltipProvider delayDuration={300}>
         <Tooltip>
            <TooltipTrigger>
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

export type UserAvatarProps = {
   name: string
   image?: string
   className?: string
}
export const UserAvatar = ({ name, image, className }: UserAvatarProps) => {
   if (nonNullable(image) && image.length > 0) {
      return (
         <div className={'avatar'}>
            <div className={cn('rounded-full ', className)}>
               <img src={image} alt='UserProfilePicture' />
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
