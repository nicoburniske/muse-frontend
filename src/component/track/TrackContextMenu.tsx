import { QueueListIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useQueryClient } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

import { getLink, useSpotifyIcon } from '@/component/ListenOnSpotify'
import { useAddTrackToQueue, useRemoveTracksFromPlaylistMutation } from '@/component/sdk/ClientHooks'
import { GetPlaylistQuery, useGetPlaylistQuery } from '@/graphql/generated/schema'
import { ContextMenuContent, ContextMenuItem } from '@/lib/component/ContextMenu'
import { useCurrentUserId } from '@/state/CurrentUser'
import { cn } from '@/util/Utils'

type ContextMenuProps = {
   trackId: string
   playlistId?: string
}

const contextMenuAtom = atom<ContextMenuProps>({ trackId: '' })

export const useSetTrackContextMenu = () => useSetAtom(contextMenuAtom)

export const TrackContextMenuContent = () => {
   const { trackId, playlistId } = useAtomValue(contextMenuAtom)

   const { mutate: addToQueueMutation } = useAddTrackToQueue({
      onSuccess: () => toast.success('Added track to queue.'),
      onError: () => toast.error('Failed to add track to queue.'),
   })
   const addToQueue = () => addToQueueMutation(trackId)

   const queryClient = useQueryClient()
   const { mutate: removeFromPlaylistMutation } = useRemoveTracksFromPlaylistMutation({
      onSuccess: () => {
         toast.success('Removed track from playlist.')
         queryClient.invalidateQueries(useGetPlaylistQuery.getKey({ id: playlistId! }))
      },
      onError: () => toast.error('Failed to add remove track from playlist.'),
   })

   const removeFromPlaylist = () => {
      if (playlistId !== undefined) {
         removeFromPlaylistMutation({
            playlistId,
            trackIds: [trackId],
         })
      }
   }

   const { data: playlistOwner } = useGetPlaylistQuery(
      { id: playlistId! },
      {
         enabled: playlistId !== undefined,
         select: useCallback((data: GetPlaylistQuery) => data.getPlaylist?.owner.id, []),
      }
   )
   const currentUserId = useCurrentUserId()
   const isUserOwnedPlaylist = playlistId !== undefined && playlistOwner === currentUserId

   const spotifyLink = getLink(trackId, 'Track')
   const spotifyIcon = useSpotifyIcon()

   return (
      <ContextMenuContent>
         <ContextMenuItem>
            <a href={spotifyLink} rel='noreferrer' target='_blank' className={cn('flex')}>
               <img src={spotifyIcon} className={'mr-2 h-4 w-4'} />
               Listen on Spotify
            </a>
         </ContextMenuItem>
         {
            <ContextMenuItem onClick={addToQueue}>
               <QueueListIcon className={'mr-2 h-4 w-4'} />
               <span> Add to Queue </span>
            </ContextMenuItem>
         }

         {isUserOwnedPlaylist && (
            <ContextMenuItem onClick={removeFromPlaylist}>
               <XCircleIcon className={'mr-2 h-4 w-4'} />
               <span> Remove from Playlist </span>
            </ContextMenuItem>
         )}
      </ContextMenuContent>
   )
}
