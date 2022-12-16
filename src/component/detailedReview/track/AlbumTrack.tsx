import { DetailedTrackFragment } from 'graphql/generated/schema'
import { PrimitiveAtom } from 'jotai'
import { RefObject, useRef } from 'react'
import useDoubleClick from 'hook/useDoubleClick'
import LikeButton from 'component/LikeButton'
import { useLongPress } from 'use-long-press'
import { usePlay } from 'component/playbackSDK/hooks'
import { useLikeSvgStyle, useTrackColor } from './useSyncedStyles'
import { useCommentModalTrack } from './useCommentModalTrack'
import { msToTimeStr } from 'util/Utils'

export interface AlbumTrackProps {
    track: DetailedTrackFragment
    reviewId: string
    albumId: string
    isLikedAtom: PrimitiveAtom<boolean>
}

// TODO: Consider making image optional for conciseness.
export default function AlbumTrack({ track, reviewId, albumId, isLikedAtom }: AlbumTrackProps) {

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(', ')
    // Sorted biggest to smallest.
    const albumImage = track.album?.images?.at(-1)

    // Get track styles.
    const styles = useTrackColor(track.id)
    const svgClassAtom = useLikeSvgStyle(track.id, isLikedAtom)

    const showModal = useCommentModalTrack(reviewId, track.id)

    const { albumOffset, isLoading } = usePlay()

    const onPlayTrack = () => {
        if (!isLoading) {
            albumOffset(albumId, track.id)
        }
    }

    // Play on div double click.
    const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>
    useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: onPlayTrack })
    const bind = useLongPress(() => {
        showModal()
    }, { threshold: 500 })

    const { minutes, seconds } = msToTimeStr(track.durationMs)

    return (
        <div
            {...bind()}
            ref={playOnDoubleClickRef}
            className={`card card-body grid grid-cols-5 items-center p-0.5 m-0 ${styles}`} >

            <div className="hidden sm:flex avatar ml-1">
                <div className="w-8 md:w-12 rounded" onClick={showModal}>
                    <img src={albumImage} />
                </div>
            </div>

            <div className='col-span-2 flex flex-col grow'>
                <div className="select-none	truncate text-sm lg:text-base p-0.5"> {track.name} </div>
                <div className="select-none	truncate text-xs lg:text-sm p-0.5 font-light"> {artistNames ?? ''} </div>
            </div>

            <div className="select-none	truncate text-sm lg:text-base p-0.5"> {`${minutes}:${seconds}`} </div>
            {/* <div className="select-none	truncate text-sm lg:text-base p-0.5"> {track.popularity} </div> */}

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

