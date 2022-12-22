import { DetailedPlaylistTrackFragment } from 'graphql/generated/schema'
import { PrimitiveAtom } from 'jotai'
import { RefObject, useRef } from 'react'
import UserAvatar, { TooltipPos } from 'component/UserAvatar'
import useDoubleClick from 'hook/useDoubleClick'
import LikeButton from 'component/LikeButton'
import { useLongPress } from 'use-long-press'
import { usePlay } from 'component/playbackSDK/hooks'
import { useLikeSvgStyle, useTrackColor } from './useSyncedStyles'
import { useCommentModalTrack } from './useCommentModalTrack'
import { msToTimeStr } from 'util/Utils'

export interface PlaylistTrackProps {
    playlistTrack: DetailedPlaylistTrackFragment
    reviewId: string
    isLikedAtom: PrimitiveAtom<boolean>
}

// TODO: Consider making image optional for conciseness.
export default function PlaylistTrack({ playlistTrack, reviewId, isLikedAtom }: PlaylistTrackProps) {
    const { addedAt, addedBy, track, playlist: { id: playlistId } } = playlistTrack


    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(', ')
    // Sorted biggest to smallest.
    const albumImage = track.album?.images?.at(-1)
    const avatarImage = addedBy?.spotifyProfile?.images?.at(-1)
    const displayName = addedBy?.spotifyProfile?.displayName ?? addedBy?.id

    // Get track styles.
    const styles = useTrackColor(track.id)
    const svgClassAtom = useLikeSvgStyle(track.id, isLikedAtom)

    const showModal = useCommentModalTrack(reviewId, track.id)

    const { playlistOffset, isLoading } = usePlay()

    const onPlayTrack = () => {
        if (!isLoading) {
            playlistOffset(playlistId, track.id)
        }
    }

    // Play on div double click.
    const trackDivRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>
    useDoubleClick({ ref: trackDivRef, onDoubleClick: onPlayTrack })
    const bind = useLongPress(() => {
        showModal()
    }, { threshold: 500 })

    const { minutes, seconds } = msToTimeStr(track.durationMs)

    return (
        <div
            {...bind()}
            ref={trackDivRef}
            className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 | card card-body items-center p-0.5 m-0 select-none ${styles}`} >

            <div className="hidden sm:flex avatar ml-1">
                <div className="w-8 md:w-12 rounded" onClick={showModal}>
                    <img src={albumImage} />
                </div>
            </div>

            <div className='col-span-2 flex flex-col grow'>
                <div className="truncate text-sm lg:text-base p-0.5"> {track.name} </div>
                <div className="truncate text-xs lg:text-sm p-0.5 font-light"> {artistNames ?? ''} </div>
            </div>

            <div className='hidden md:grid place-items-center text-xs lg:text-sm'>
                <p> {new Date(addedAt).toLocaleDateString()} </p>
            </div>
            {/* <div className={`flex flex-row w-3/6 justify-evenly }> */}
            {/* TODO: This needs to get centered vertically */}
            <div className="grid place-items-center">
                <UserAvatar displayName={displayName} image={avatarImage as string} tooltipPos={TooltipPos.Left} />
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
        </div >
    )
}

