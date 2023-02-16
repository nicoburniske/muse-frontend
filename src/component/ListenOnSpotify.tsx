import { EntityType } from 'graphql/generated/schema'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'platform/component/Tooltip'
import { cn } from 'util/Utils'

export type ListenOnSpotifyProps = {
   entityId?: string
   entityType?: EntityType
   className?: string
}

export const ListenOnSpotifyButton = (props: ListenOnSpotifyProps) => {
   const { entityId, entityType, className } = props

   const spotifyLink = getLink(entityId, entityType)

   return (
      <div className={cn('btn btn-primary space-x-2', entityId ?? 'btn-disabled', className)}>
         <a href={spotifyLink} rel='noreferrer' target='_blank'>
            Listen on Spotify
         </a>
         <img src='/spotifyIcon.png' className='h-8 w-8 rounded-full bg-base-100' />
      </div>
   )
}

export const ListenOnSpotifyTooltip = (props: ListenOnSpotifyProps) => {
   const { entityId, entityType, className } = props

   const spotifyLink = getLink(entityId, entityType)
   return (
      <TooltipProvider delayDuration={300}>
         <Tooltip>
            <TooltipTrigger asChild>
               <a className='ml-2 flex-none' href={spotifyLink} rel='noreferrer' target='_blank'>
                  <img src='/spotifyIcon.png' className={cn('h-8 w-8 rounded-full bg-base-100', className)} />
               </a>
            </TooltipTrigger>
            <TooltipContent className='bg-primary text-primary-content'>
               <p> Listen on Spotify </p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}

const getLink = (entityId?: string, entityType?: EntityType) => {
   switch (entityType) {
      case 'Track':
         return `https://open.spotify.com/track/${entityId}`
      case 'Album':
         return `https://open.spotify.com/album/${entityId}`
      case 'Artist':
         return `https://open.spotify.com/artist/${entityId}`
      case 'Playlist':
         return `https://open.spotify.com/playlist/${entityId}`
      default:
         return ''
   }
}
