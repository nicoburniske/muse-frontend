import { DetailedTrackFragment } from 'graphql/generated/schema'
import { PrimitiveAtom } from 'jotai'
import { RefObject, useCallback, useRef } from 'react'
import useDoubleClick from 'platform/hook/useDoubleClick'
import LikeButton from 'component/LikeButton'
import { usePlayMutation } from 'component/sdk/ClientHooks'
import { useLikeSvgStyle, useTrackColor } from './useSyncedStyles'
import { classNames, msToTimeStr } from 'util/Utils'
import { FireIcon } from '@heroicons/react/20/solid'
import TrackOptions from './TrackDropdown'

export interface AlbumTrackProps {
    track: DetailedTrackFragment
    reviewId: string
}

// TODO: Consider making image optional for conciseness.
export default function AlbumTrack({ track, reviewId }: AlbumTrackProps) {

    const artistNames = track.artists?.slice(0, 3).map(a => a.name).join(', ')

    // Get track styles.
    const styles = useTrackColor(track.id)
    const svgStyle = useCallback((isLiked: boolean | undefined) => useLikeSvgStyle(track.id)(isLiked), [track.id])

    const { albumOffset, isLoading } = usePlayMutation()

    const onPlayTrack = () => {
        if (!isLoading) {
            // TODO: fix this? 
            albumOffset(track?.album?.id ?? '', track.id)
        }
    }

    // Play on div double click.
    const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>
    useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: onPlayTrack })

    const { minutes, seconds } = msToTimeStr(track.durationMs)

    return (
        <div
            ref={playOnDoubleClickRef}
            className={classNames(
                'group card card-body flex flex-row justify-between items-center p-0.5 m-0 select-none border-2 border-base-300',
                styles
            )}
        >

            <div className='flex flex-col w-24 md:w-40 lg:w-48 pl-1'>
                <div className="select-none	truncate text-base p-0.5"> {track.name} </div>
                <div className="select-none	truncate text-sm p-0.5 font-light"> {artistNames ?? ''} </div>
            </div>

            <div className="select-none	text-center truncate text-sm lg:text-base p-0.5 hidden md:grid place-items-center">
                {`${minutes}:${seconds}`}
            </div>
            <div className="hidden md:grid place-items-center">
                <TrackPopularity popularity={track.popularity} />
            </div>
            <div className="grid place-items-center">
                <LikeButton
                    trackId={track.id}
                    svgStyle={svgStyle}
                    options={{ staleTime: 1000 * 60 }}
                    className={'btn btn-sm btn-ghost p-0'}
                />
            </div>
            <div className='w-5 flex mr-5'>
                <TrackOptions
                    trackId={track.id}
                    reviewId={reviewId}
                />
            </div>
        </div >
    )
}


const TrackPopularity = ({ popularity }: { popularity: number | null | undefined }) => {
    const color = (() => {
        if (!popularity) {
            return 'stroke-gray-500 fill-gray-500'
        } else if (popularity < 25) {
            return 'stroke-blue-500 fill-blue-500'
        } else if (popularity < 50) {
            return 'stroke-yellow-500 fill-yellow-500'
        } else if (popularity < 75) {
            return 'stroke-orange-500 fill-orange-500'
        } else if (popularity < 100) {
            return 'stroke-red-500 fill-red-500'
        }
    })()
    return (
        <div className="flex flex-row items-center space-x-0.5">
            <div>{popularity}</div>
            <FireIcon className={classNames('w-6 h-6', color)} />
        </div>
    )
}

