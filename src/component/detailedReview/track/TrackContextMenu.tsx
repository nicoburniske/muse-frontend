import { useQueryClient } from '@tanstack/react-query'
import { useAddTrackToQueue, useRemoveTracksFromPlaylistMutation } from 'component/sdk/ClientHooks'
import { useGetPlaylistQuery } from 'graphql/generated/schema'
import { QueueListIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import toast from 'react-hot-toast'
import { getLink, useSpotifyIcon } from 'component/ListenOnSpotify'
import { ContextMenuContent, ContextMenuItem, ContextMenuShortcut } from 'platform/component/ContextMenu'
import { cn } from 'util/Utils'

type ContextMenuProps = {
   trackId: string
   playlistId?: string
}

const contextMenuAtom = atom<ContextMenuProps>({ trackId: '', playlistId: undefined })

export const useSetTrackContextMenu = () => useSetAtom(contextMenuAtom)

export const TrackContextMenuContent = () => {
   const { trackId, playlistId } = useAtomValue(contextMenuAtom)

   const { mutate: addToQueueMutation } = useAddTrackToQueue({
      onSuccess: () => toast.success('Added track to queue.'),
      onError: () => toast.error('Failed to add track to queue.'),
   })
   const addToQueue = () => addToQueueMutation(trackId)

   const showPlaylistActions = playlistId !== undefined

   const queryClient = useQueryClient()
   const { mutate: removeFromPlaylistMutation } = useRemoveTracksFromPlaylistMutation({
      onSuccess: () => {
         toast.success('Removed track from playlist.')
         queryClient.invalidateQueries(useGetPlaylistQuery.getKey({ id: playlistId! }))
      },
      onError: () => toast.error('Failed to add remove track from playlist.'),
   })

   const removeFromPlaylist = () => {
      if (showPlaylistActions) {
         removeFromPlaylistMutation({
            playlistId,
            trackIds: [trackId],
         })
      }
   }

   const spotifyLink = getLink(trackId, 'Track')
   const spotifyIcon = useSpotifyIcon()

   return (
      <ContextMenuContent>
         <ContextMenuItem inset>
            <img src={spotifyIcon} className={'mr-2 h-4 w-4'} />
            <a href={spotifyLink} rel='noreferrer' target='_blank' className={cn('flex')}>
               Listen on Spotify
            </a>
         </ContextMenuItem>
         <ContextMenuItem inset onClick={addToQueue}>
            <QueueListIcon className={'mr-2 h-4 w-4'} />
            <span> Add to Queue </span>
         </ContextMenuItem>

         <ContextMenuItem inset>
            <XCircleIcon className={'mr-2 h-4 w-4'} onClick={removeFromPlaylist} />
            <span> Remove from Playlist </span>
         </ContextMenuItem>
      </ContextMenuContent>
   )
}
