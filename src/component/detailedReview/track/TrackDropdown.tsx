
import { useFloating } from '@floating-ui/react-dom'
import Portal from 'component/Portal'
import { useThemeValue } from 'state/UserPreferences'
import { useCommentModalTrack } from './useCommentModalTrack'
import { useAddTrackToQueue, useRemoveTracksFromPlaylistMutation } from 'component/playbackSDK/hooks'
import toast from 'react-hot-toast'
import { Menu, Transition } from '@headlessui/react'
import { classNames } from 'util/Utils'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetPlaylistQuery } from 'graphql/generated/schema'
import { currentUserIdAtom } from 'state/Atoms'
import { useAtomValue } from 'jotai'

type TrackOptionsProps = {
    trackId: string
    reviewId: string

    playlist?: {
        id: string
        owner: string
    }
}

export default function TrackOptions({ trackId, reviewId, playlist }: TrackOptionsProps) {
    const theme = useThemeValue()
    const { x, y, strategy, refs } = useFloating({
        placement: 'right-start',
        strategy: 'absolute'
    })

    const showCommentModal = useCommentModalTrack(reviewId, trackId)

    const { mutate: addToQueueMutation } = useAddTrackToQueue({
        onSuccess: () => toast.success('Added track to queue.'),
        onError: () => toast.error('Failed to add track to queue.')
    })
    const addToQueue = () => addToQueueMutation(trackId)

    const currentUserId = useAtomValue(currentUserIdAtom)

    const isUserOwnedPlaylist = playlist?.id !== undefined && playlist?.owner === currentUserId

    const queryClient = useQueryClient()
    const { mutate: removeFromPlaylistMutation } = useRemoveTracksFromPlaylistMutation({
        onSuccess: () => {
            toast.success('Removed track from playlist.')
            queryClient.invalidateQueries(useGetPlaylistQuery.getKey({ id: playlist?.id! }))
        },
        onError: () => toast.error('Failed to add remove track from playlist.')
    })

    const removeFromPlaylist = () => {
        if (isUserOwnedPlaylist) {
            removeFromPlaylistMutation({ playlistId: playlist.id, trackIds: [trackId] })
        }
    }

    return (
        <Menu>
            {({ open }) => (
                <>
                    <Menu.Button ref={refs.setReference} className={
                        classNames(
                            ' btn btn-sm btn-ghost btn-square place-items-center',
                            open ? 'grid' : 'hidden group-hover:grid'
                        )}>
                        <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                    <Portal>
                        <Transition
                            data-theme={theme}
                            as={Fragment}
                            show={open}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
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
                                className="menu bg-base-300 rounded-md shadow-lg"
                            >
                                <Menu.Item>
                                    {({ active }) => (
                                        <li>
                                            <a
                                                className={classNames(
                                                    active ? 'active' : '',
                                                    'text-sm'
                                                )}
                                                onClick={showCommentModal}
                                            >
                                                Create Comment
                                            </a>
                                        </li>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <li>
                                            <a
                                                className={classNames(
                                                    active ? 'active' : '',
                                                    'text-sm'
                                                )}
                                                onClick={addToQueue}
                                            >
                                                Add To Queue
                                            </a>
                                        </li>
                                    )}
                                </Menu.Item>

                                {isUserOwnedPlaylist && (
                                    <Menu.Item>
                                        {({ active }) => (
                                            <li>
                                                <a
                                                    className={classNames(
                                                        active ? 'active' : '',
                                                        'text-sm'
                                                    )}
                                                    onClick={removeFromPlaylist}
                                                >
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