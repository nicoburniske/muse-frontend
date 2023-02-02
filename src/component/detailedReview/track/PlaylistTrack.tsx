import { DetailedPlaylistTrackFragment, useGetPlaylistQuery } from 'graphql/generated/schema'
import { PrimitiveAtom } from 'jotai'
import { RefObject, useEffect, useRef } from 'react'
import UserAvatar, { TooltipPos } from 'component/UserAvatar'
import useDoubleClick from 'platform/hook/useDoubleClick'
import LikeButton from 'component/LikeButton'
import { useAddTracksToPlaylistMutation, usePlayMutation, useReorderPlaylistTracksMutation } from 'component/sdk/ClientHooks'
import { useLikeSvgStyle, useTrackColor } from './useSyncedStyles'
import { classNames, msToTimeStr } from 'util/Utils'
import { useDrag, useDrop } from 'react-dnd'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import TrackOptions from './TrackDropdown'
import { useCurrentUserId } from 'state/CurrentUser'

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

    const currentUserId = useCurrentUserId()

    // Drop to add to playlist.
    const [{ canDrop, isAbove }, drop] = useDrop(() => ({
        accept: 'Track',
        canDrop: (item: { trackId: string, playlistId?: string, index: number }) => currentUserId === playlistOwner && item.trackId !== trackId,
        drop: (item: { trackId: string, playlistId?: string, index: number }) => {
            const lastIsAbove = lastIsAboveRef.current
            const insertIndex = lastIsAbove ? index : index + 1
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

    // isAbove will be undefined after drag is released!
    // So we need to save last value in ref.
    const lastIsAboveRef = useRef<boolean>(false)
    useEffect(() => {
        if (isAbove !== undefined) {
            lastIsAboveRef.current = isAbove
        }
    }, [isAbove])

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
                'group card card-body flex flex-row justify-between items-center p-0.5 m-0 select-none w-full h-full border-2 border-base-300',
                styles,
                isDragging ? 'opacity-50' : '',
                isAbove === undefined || !canDrop ? '' :
                    isAbove ? 'border-t-success order-t-2 ' : 'border-b-success border-b-2'
            )} >

            <div className="flex flex-row justify-start space-x-1">
                <div className="hidden sm:flex avatar ml-1">
                    <div className="w-8 md:w-12 rounded">
                        <img src={albumImage} />
                    </div>
                </div>


                <div className='flex flex-col w-24 md:w-48 lg:w-48 pl-1'>
                    <div className="select-none	truncate text-base p-0.5"> {track.name} </div>
                    <div className="select-none	truncate text-sm p-0.5 font-light"> {artistNames ?? ''} </div>
                </div>
            </div>

            <div className="hidden md:grid place-items-center">
                <UserAvatar
                    displayName={displayName}
                    tooltip={`${displayName} - ${dateAdded}`}
                    image={avatarImage as string} tooltipPos={TooltipPos.Left} />
            </div>

            <div className="select-none	text-center truncate text-sm lg:text-base p-0.5 hidden md:grid place-items-center">
                {`${minutes}:${seconds}`}
            </div>
            <div className="grid place-items-center">
                <LikeButton
                    trackId={track.id}
                    likeAtom={isLikedAtom}
                    svgClass={svgClassAtom}
                    className={'btn btn-sm btn-ghost p-0'}
                />
            </div>
            <div className='w-5 flex mr-5'>
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
