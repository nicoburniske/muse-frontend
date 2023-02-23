import { EntityType } from 'graphql/generated/schema'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'platform/component/Tooltip'
import { useIsDarkTheme } from 'state/UserPreferences'
import { cn } from 'util/Utils'

export const useSpotifyLogo = () => (useIsDarkTheme() ? '/spotifyLogoWhite.png' : '/spotifyLogoBlack.png')
export const useSpotifyIcon = () => (useIsDarkTheme() ? '/spotifyIconWhite.png' : '/spotifyIconBlack.png')

export type ListenOnSpotifyProps = {
   entityId?: string
   entityType?: EntityType
   className?: string
}

export const ListenOnSpotifyLogo = (props: ListenOnSpotifyProps) => {
   const { entityId, entityType, className } = props

   const spotifyLink = getLink(entityId, entityType)

   const spotifyLogo = useSpotifyLogo()

   return (
      <>
         <div className={cn('p-3', className)}>
            <ListenOnSpotifyTooltip>
               <a
                  className={cn('hidden md:flex', entityId && entityType ? '' : 'pointer-events-none')}
                  href={spotifyLink}
                  rel='noreferrer'
                  target='_blank'
               >
                  <img src={spotifyLogo} className='w-20' />
               </a>
            </ListenOnSpotifyTooltip>
         </div>
         <ListenOnSpotifyIcon entityId={entityId} entityType={entityType} className={'md:hidden'} />
      </>
   )
}

export const ListenOnSpotifyIcon = (props: ListenOnSpotifyProps) => {
   const { entityId, entityType, className } = props

   const spotifyLink = getLink(entityId, entityType)
   const spotifyIcon = useSpotifyIcon()
   return (
      <div className={cn('p-4', className)}>
         <ListenOnSpotifyTooltip>
            <a href={spotifyLink} rel='noreferrer' target='_blank'>
               <img src={spotifyIcon} className={cn('h-8 w-8')} />
            </a>
         </ListenOnSpotifyTooltip>
      </div>
   )
}

const ListenOnSpotifyTooltip = ({ children }: { children: React.ReactNode }) => (
   <TooltipProvider delayDuration={300}>
      <Tooltip>
         <TooltipTrigger asChild>{children}</TooltipTrigger>
         <TooltipContent className='bg-primary text-primary-content'>
            <p> Listen on Spotify </p>
         </TooltipContent>
      </Tooltip>
   </TooltipProvider>
)

export const getLink = (entityId?: string, entityType?: EntityType) => {
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
