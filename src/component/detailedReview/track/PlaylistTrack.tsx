import { DetailedPlaylistTrackFragment, useGetPlaylistQuery } from 'graphql/generated/schema'
import { PrimitiveAtom, useAtomValue } from 'jotai'
import { RefObject, useRef } from 'react'
import UserAvatar, { TooltipPos } from 'component/UserAvatar'
import useDoubleClick from 'platform/hook/useDoubleClick'
import LikeButton from 'component/LikeButton'
import { useAddTracksToPlaylistMutation, usePlayMutation, useReorderPlaylistTracksMutation } from 'component/sdk/ClientHooks'
import { useLikeSvgStyle, useTrackColor } from './useSyncedStyles'
import { classNames, msToTimeStr } from 'util/Utils'
import { useDrag, useDrop } from 'react-dnd'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { currentUserIdAtom } from 'state/Atoms'

import TrackOptions from './TrackDropdown'

export interface PlaylistTrackProps {
    index: number
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    isLikedAtom: PrimitiveAtom<boolean>
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ index, playlistTrack, reviewId, isLikedAtom }: PlaylistTrackProps) {
    const { addedAt, addedBy, track, playlist: { id: playlistId } } = playlistTrack
    const { data: playlistOwner } = useGetPlaylistQuery({ id: playlistId }, { select: data => data.getPlaylist?.owner.id })

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(', ')
    // Sorted biggest to smallest.
    const albumImage = track.album?.images?.at(-1)
    const avatarImage = addedBy?.spotifyProfile?.images?.at(-1)
    const displayName = addedBy?.spotifyProfile?.displayName ?? addedBy?.id

    // Get track styles.
    const styles = useTrackColor(track.id)
    const svgClassAtom = useLikeSvgStyle(track.id, isLikedAtom)

    const { playlistOffset, isLoading } = usePlayMutation()

    const onPlayTrack = () => {
        if (!isLoading) {
            playlistOffset(playlistId, track.id)
        }
    }

    // Play on div double click.
    const trackDivRef = useRef<HTMLDivElement>()
    useDoubleClick({ ref: trackDivRef as RefObject<HTMLDivElement>, onDoubleClick: onPlayTrack })

    const { minutes, seconds } = msToTimeStr(track.durationMs)

    const dateAdded = new Date(addedAt).toLocaleDateString()

    const queryClient = useQueryClient()
    const reloadPlaylist = () => queryClient.invalidateQueries(useGetPlaylistQuery.getKey({ id: playlistId }))

    // On success optimistic update for atoms!
    const { mutate: addTracksToPlaylist } = useAddTracksToPlaylistMutation({
        onSuccess: () => {
            reloadPlaylist()
            toast.success('Added track to playlist.')
        },
        onError: () => toast.error('Failed to add track to playlist.')
    })

    const { mutate: reorder } = useReorderPlaylistTracksMutation({
        onSuccess: () => {
            reloadPlaylist()
            toast.success('Reordered playlist tracks.')
        },
        onError: () => toast.error('Failed to reorder playlist tracks.')
    })

    const currentUserId = useAtomValue(currentUserIdAtom)

    // Drop to add to playlist.
    const [{ canDrop, isAbove }, drop] = useDrop(() => ({
        accept: 'Track',
        canDrop: (item: { trackId: string, playlistId?: string, index: number }) => currentUserId === playlistOwner && item.trackId !== trackId,
        drop: (item: { trackId: string, playlistId?: string, index: number }) => {
            const insertIndex = isAbove ? index : index + 1
            if (item.playlistId === playlistId) {
                reorder({ playlistId, insertBefore: insertIndex, rangeStart: item.index, rangeLength: 1 })
            } else {
                addTracksToPlaylist({ trackIds: [item.trackId], playlistId, position: insertIndex })
            }
        },
        collect: monitor => {
            const canDrop = !!monitor.isOver() && monitor.canDrop()

            const clientOffset = monitor.getClientOffset()
            const currentDiv = trackDivRef.current?.getBoundingClientRect()
            if (clientOffset && currentDiv) {
                const { y } = clientOffset
                const { top, bottom } = currentDiv
                const isAbove = y < top + (bottom - top) / 2
                return { canDrop, isAbove }
            } else {
                return { canDrop, isAbove: undefined }
            }
        },
    }), [reorder, addTracksToPlaylist, currentUserId, playlistOwner])

    // Drag to re-order.
    const trackId = track.id
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'Track',
        item: { trackId, playlistId, index },
        canDrag: true,
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [trackId])


    return (
        <div
            ref={(el: HTMLDivElement) => {
                drag(el)
                drop(el)
                trackDivRef.current = el
            }}
            className={classNames(
                'group grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 card card-body items-center p-0.5 m-0 select-none w-full h-full border-2 border-base-300',
                styles,
                isDragging ? 'opacity-50' : '',
                isAbove === undefined || !canDrop ? '' :
                    isAbove ? 'border-t-success order-t-2 ' : 'border-b-success border-b-2'
            )} >

            <div className="hidden sm:flex avatar ml-1">
                <div className="w-8 md:w-12 rounded">
                    <img src={albumImage} />
                </div>
            </div>

            <div className='col-span-2 flex flex-col grow'>
                <div className="truncate text-sm lg:text-base p-0.5"> {track.name} </div>
                <div className="truncate text-xs lg:text-sm p-0.5 font-light"> {artistNames ?? ''} </div>
            </div>

            <div className="grid place-items-center">
                <UserAvatar
                    displayName={displayName}
                    tooltip={`${displayName} - ${dateAdded}`}
                    image={avatarImage as string} tooltipPos={TooltipPos.Left} />
            </div>
            <div className="truncate text-sm lg:text-base p-0.5 m-auto">
                <p>
                    {`${minutes}:${seconds}`}
                </p>
            </div>
            <div className="grid place-items-center">
                <LikeButton
                    trackId={track.id}
                    likeAtom={isLikedAtom}
                    svgClass={svgClassAtom}
                    className={'btn btn-sm btn-ghost p-0'}
                />
            </div>
            <div>
                <TrackOptions
                    trackId={track.id}
                    reviewId={reviewId}
                    playlist={{
                        owner: playlistOwner ?? '',
                        id: playlistId
                    }}
                />
            </div>
        </div >
    )
}
