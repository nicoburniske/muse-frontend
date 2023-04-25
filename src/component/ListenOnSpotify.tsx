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
   logoClassName?: string
}

export const ListenOnSpotifyLogoTooltip = (props: ListenOnSpotifyProps) => {
   const { entityId, entityType, className } = props

   return (
      <>
         <div className={cn('p-3', className)}>
            <ListenOnSpotifyTooltip>
               <ListenOnSpotifyLogo {...props} />
            </ListenOnSpotifyTooltip>
         </div>
         <ListenOnSpotifyIcon entityId={entityId} entityType={entityType} className={'md:hidden'} />
      </>
   )
}

export const ListenOnSpotifyLogo = (props: Omit<ListenOnSpotifyProps, 'className'>) => {
   const { entityId, entityType, logoClassName } = props
   const spotifyLink = getLink(entityId, entityType)
   const spotifyLogo = useSpotifyLogo()
   return (
      <a
         className={cn('hidden md:flex', entityId && entityType ? '' : 'pointer-events-none')}
         href={spotifyLink}
         rel='noreferrer'
         target='_blank'
      >
         <img src={spotifyLogo} className={cn('w-20', logoClassName)} />
      </a>
   )
}

export const ListenOnSpotifyIcon = (props: ListenOnSpotifyProps) => {
   const { entityId, entityType, className, logoClassName } = props

   const spotifyLink = getLink(entityId, entityType)
   const spotifyIcon = useSpotifyIcon()
   return (
      <div className={cn('p-4', className)}>
         <ListenOnSpotifyTooltip>
            <a href={spotifyLink} rel='noreferrer' target='_blank'>
               <img src={spotifyIcon} className={cn('h-8 w-8', logoClassName)} />
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
