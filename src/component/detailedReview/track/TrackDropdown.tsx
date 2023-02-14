import { useFloating } from '@floating-ui/react-dom'
import Portal from 'platform/component/Portal'
import { useThemeValue } from 'state/UserPreferences'
import { useAddTrackToQueue, useRemoveTracksFromPlaylistMutation } from 'component/sdk/ClientHooks'
import toast from 'react-hot-toast'
import { Menu, Transition } from '@headlessui/react'
import { cn } from 'util/Utils'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { Fragment, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { GetPlaylistQuery, useGetPlaylistQuery } from 'graphql/generated/schema'
import { useCurrentUserId } from 'state/CurrentUser'
import { flip } from '@floating-ui/react'

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
   const theme = useThemeValue()
   const { x, y, strategy, refs } = useFloating({
      placement: 'right-start',
      strategy: 'absolute',
      middleware: [flip()],
   })

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

   const spotifyUrl = `https://open.spotify.com/track/${trackId}`

   return (
      <Menu>
         {({ open }) => (
            <>
               <Menu.Button
                  ref={refs.setReference}
                  className={cn(
                     'btn btn-square btn-ghost btn-sm place-items-center',
                     open ? 'opacity-100' : 'opacity-100 hover:opacity-100 group-hover:opacity-100 sm:opacity-0'
                  )}
               >
                  <EllipsisHorizontalIcon className='h-5 w-5' aria-hidden='true' />
               </Menu.Button>
               <Portal>
                  <Transition
                     data-theme={theme}
                     as={Fragment}
                     show={open}
                     enter='transition ease-out duration-100'
                     enterFrom='transform opacity-0 scale-95'
                     enterTo='transform opacity-100 scale-100'
                     leave='transition ease-in duration-75'
                     leaveFrom='transform opacity-100 scale-100'
                     leaveTo='transform opacity-0 scale-95'
                  >
                     <Menu.Items
                        ref={refs.setFloating}
                        style={{
                           position: strategy,
                           top: y ?? 0,
                           left: x ?? 0,
                           zIndex: 100,
                           width: 'max-content',
                        }}
                        className='menu rounded-md bg-neutral text-neutral-content shadow-lg '
                     >
                        <Menu.Item>
                           {({ active }) => (
                              <li>
                                 <a
                                    className={cn(active ? 'active' : '', 'text-sm')}
                                    rel='noreferrer'
                                    target='_blank'
                                    href={spotifyUrl}
                                 >
                                    Listen On Spotify
                                 </a>
                              </li>
                           )}
                        </Menu.Item>

                        <Menu.Item>
                           {({ active }) => (
                              <li>
                                 <a className={cn(active ? 'active' : '', 'text-sm')} onClick={addToQueue}>
                                    Add To Queue
                                 </a>
                              </li>
                           )}
                        </Menu.Item>

                        {isUserOwnedPlaylist && (
                           <Menu.Item>
                              {({ active }) => (
                                 <li>
                                    <a className={cn(active ? 'active' : '', 'text-sm')} onClick={removeFromPlaylist}>
                                       Remove From Playlist
                                    </a>
                                 </li>
                              )}
                           </Menu.Item>
                        )}
                     </Menu.Items>
                  </Transition>
               </Portal>
            </>
         )}
      </Menu>
   )
}
