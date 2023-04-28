import { useAddTrackToQueue, useRemoveTracksFromPlaylistMutation } from 'component/sdk/ClientHooks'
import toast from 'react-hot-toast'
import { cn } from 'util/Utils'
import { EllipsisHorizontalIcon, QueueListIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { GetPlaylistQuery, useGetPlaylistQuery } from 'graphql/generated/schema'
import { useCurrentUserId } from 'state/CurrentUser'
import {
   DropdownMenu,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuContent,
} from 'platform/component/DropdownMenu'
import { Button } from 'platform/component/Button'
import { getLink, useSpotifyIcon } from 'component/ListenOnSpotify'

type TrackOptionsProps = {
   trackId: string
   playlistId?: string
}

export default function TrackOptions({ trackId, playlistId }: TrackOptionsProps) {
   const { data: playlistOwner } = useGetPlaylistQuery(
      { id: playlistId! },
      {
         enabled: playlistId !== undefined,
         select: useCallback((data: GetPlaylistQuery) => data.getPlaylist?.owner.id, []),
      }
   )

   const { mutate: addToQueueMutation } = useAddTrackToQueue({
      onSuccess: () => toast.success('Added track to queue.'),
      onError: () => toast.error('Failed to add track to queue.'),
   })
   const addToQueue = () => addToQueueMutation(trackId)

   const currentUserId = useCurrentUserId()

   const isUserOwnedPlaylist = playlistId !== undefined && playlistOwner === currentUserId

   const queryClient = useQueryClient()
   const { mutate: removeFromPlaylistMutation } = useRemoveTracksFromPlaylistMutation({
      onSuccess: () => {
         toast.success('Removed track from playlist.')
         queryClient.invalidateQueries(useGetPlaylistQuery.getKey({ id: playlistId! }))
      },
      onError: () => toast.error('Failed to add remove track from playlist.'),
   })

   const removeFromPlaylist = () => {
      if (isUserOwnedPlaylist) {
         removeFromPlaylistMutation({
            playlistId,
            trackIds: [trackId],
         })
      }
   }

   const spotifyLink = getLink(trackId, 'Track')
   const spotifyIcon = useSpotifyIcon()

   return (
      <DropdownMenu>
         <DropdownMenuTrigger>
            <Button variant='ghost' size='square'>
               <EllipsisHorizontalIcon className='h-5 w-5' aria-hidden='true' />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent>
            <DropdownMenuItem>
               <img src={spotifyIcon} className={'mr-2 h-4 w-4'} />
               <a href={spotifyLink} rel='noreferrer' target='_blank' className={cn('flex')}>
                  Listen on Spotify
               </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addToQueue}>
               <QueueListIcon className={'mr-2 h-4 w-4'} />
               <span> Add to Queue </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={removeFromPlaylist}>
               <XCircleIcon className={'mr-2 h-4 w-4'} />
               <span> Remove from Playlist </span>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
