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
    isLikedAtom: PrimitiveAtom<boolean>
}

// TODO: Consider making image optional for conciseness.
export default function AlbumTrack({ track, reviewId, isLikedAtom }: AlbumTrackProps) {

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
            // TODO: fix this? 
            albumOffset(track?.album?.id ?? '', track.id)
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
            className={`card card-body grid grid-cols-6 items-center p-0.5 m-0 ${styles}`} >

            <div className="hidden sm:flex avatar ml-1">
                <div className="w-8 md:w-12 rounded" onClick={showModal}>
                    <img src={albumImage} />
                </div>
            </div>

            <div className='col-span-2 flex flex-col grow'>
                <div className="select-none	truncate text-sm lg:text-base p-0.5"> {track.name} </div>
                <div className="select-none	truncate text-xs lg:text-sm p-0.5 font-light"> {artistNames ?? ''} </div>
            </div>

            <div className="select-none	text-center truncate text-sm lg:text-base p-0.5"> {`${minutes}:${seconds}`} </div>
            <div className="m-auto">
                <TrackPopularity popularity={track.popularity} />
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


const TrackPopularity = ({ popularity }: { popularity: number | null | undefined }) => {
    const color = (() => {
        if (!popularity) {
            return 'stroke-gray-500'
        } else if (popularity < 25) {
            return 'stroke-blue-500'
        } else if (popularity < 50) {
            return 'stroke-yellow-500'
        } else if (popularity < 75) {
            return 'stroke-orange-500'
        } else if (popularity < 100) {
            return 'stroke-red-500'
        }
    })()
    return (
        <div className="flex flex-row items-center space-x-0.5">
            <div>{popularity}</div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${color}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
        </div>
    )
}

