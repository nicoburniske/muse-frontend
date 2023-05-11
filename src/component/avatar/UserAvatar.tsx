import { UserWithSpotifyOverviewFragment } from '@/graphql/generated/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/component/Avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/lib/component/Tooltip'

const size = 'w-6 h-6 md:w-8 md:h-8'

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
            <TooltipContent side='right' align='start' className='bg-primary text-primary-foreground'>
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
   return (
      <Avatar className={className}>
         <AvatarImage src={image} alt='UserProfilePicture' className='object-cover' />
         <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
      </Avatar>
   )
}
