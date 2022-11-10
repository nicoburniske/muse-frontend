import { NextTrackIcon, PauseIcon, PlayIcon, PreviousTrackIcon, ShuffleIcon, SkipBackwardIcon, SkipForwardIcon } from 'component/Icons'
import LikeButton from 'component/LikeButton'
import { EntityType, useCreateCommentMutation, usePausePlaybackMutation, useSeekPlaybackMutation, useSkipToNextMutation, useSkipToPreviousMutation, useStartPlaybackMutation, useToggleShuffleMutation } from 'graphql/generated/schema'
import useStateWithSyncedDefault from 'hook/useStateWithSyncedDefault'
import { atom, useSetAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { openCommentModalAtom } from 'state/Atoms'
import { msToTime } from 'util/Utils'
import * as Slider from '@radix-ui/react-slider'


interface PlaybackTimeProps {
    trackId: string,
    trackImage: string,
    trackName: string,
    trackArtist: string,
    isPlaying: boolean,
    isShuffled: boolean,
    isLiked: boolean,
    // Current playback position.
    progressMs: number,
    // Track total duration.
    durationMs: number,
    reviewId: string,
    disabled: boolean
}

const commonClass = 'btn btn-sm lg:btn-md neutral-focus p-0'

export function PlaybackTime({
    progressMs: progressProp, durationMs: durationProp,
    trackId, reviewId, disabled, isPlaying, isShuffled,
    trackImage, trackName, trackArtist, isLiked }: PlaybackTimeProps) {

    const [progressMs, setProgressMs] = useStateWithSyncedDefault(progressProp >= 0 ? progressProp : 0)
    const setCommentModal = useSetAtom(openCommentModalAtom)

    const { mutateAsync: seekTrack } = useSeekPlaybackMutation({
        onError: () => toast.error('Failed to seek playback.'),
    })

    const seekForward = () => seekTrack({ input: { positionMs: progressProp + 10000 } })
    const seekBackward = () => seekTrack({ input: { positionMs: progressProp - 10000 } })

    // TODO: how to handle this?
    // const selectNowPlaying = () => {
    //     setSelectedTrack('')
    //     setTimeout(() => setSelectedTrack(nowPlaying), 1);
    // }

    const { mutate: createComment } = useCreateCommentMutation({ onSuccess: () => { toast.success('comment created'); setCommentModal(undefined) } })
    // TODO: how do I get review in here? 
    const onSubmit = (comment: string) =>
        createComment({ input: { comment, entityId: trackId, entityType: EntityType.Track, reviewId } },)

    // Sometimes spotify sends crap. need to ensure that the positions makes sense.
    const durationMs = durationProp > 0 ? durationProp : 1
    const progress = (progressMs / durationMs) * 1000

    const { minutes, seconds } = msToTime(progressMs)
    const { minutes: minDuration, seconds: secDuration } = msToTime(durationMs)

    function onProgressChange(p: number) {
        const position = Math.floor(p * durationMs)
        seekTrack({ input: { positionMs: position } })
            .then(() => setProgressMs(position))
    }

    const showModal = () => {
        const paddedS = seconds < 10 ? `0${seconds}` : seconds
        const initialValue = `<Stamp at="${minutes}:${paddedS}" />`
        const values = { title: 'create comment', onCancel: () => setCommentModal(undefined), onSubmit, initialValue }
        setCommentModal(values)
    }

    const tooltipContent = useMemo(() => disabled ? 'Not part of this review' : 'Comment at timestamp', [disabled])

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 rounded-xl w-full h-full border-accent border bg-neutral">
            <div className='flex flex-row px-1 space-x-2 items-center lg:max-w-[70%]'>
                <button className="hidden sm:inline-block tooltip tooltip-right p-1" data-tip={tooltipContent} onClick={showModal} disabled={disabled} >
                    <div className="avatar" >
                        <div className="w-12 md:w-16 lg:w-20 rounded">
                            <img loading='lazy' src={trackImage} />
                        </div>
                    </div>
                </button>
                {/* <div className={`flex flex-col justify-around w-full`} onClick={selectNowPlaying}> */}
                <div className={'flex flex-col justify-around w-full'}>
                    <div className="text-left truncate md:p-0.5 prose w-full text-neutral-content text-xs lg:text-md"> {trackName} </div>
                    <div className="text-left truncate md:p-0.5 prose w-full text-neutral-content text-xs lg:text-md"> {trackArtist} </div>
                </div>
            </div>
            <div className="sm:col-span-2 flex flex-col justify-center items-center rounded-lg w-full">
                <div className="flex flex-row justify-between md:justify-around items-center text-neutral-content md:w-full lg:w-3/4">
                    <PlayerButtons
                        trackId={trackId}
                        isPlaying={isPlaying}
                        isShuffled={isShuffled}
                        isLiked={isLiked}
                        seekForward={seekForward}
                        seekBackward={seekBackward}
                    />
                </div>
                <PlaybackProgress
                    progress={progress}
                    onProgressChange={onProgressChange}
                    minProgress={minutes}
                    secProgress={seconds}
                    minDuration={minDuration}
                    secDuration={secDuration}
                />
            </div>
        </div >
    )
}

interface PlayerButtonsProps {
    progress: number
    onProgressChange: (e: number) => void

    minProgress: number
    secProgress: number

    minDuration: number
    secDuration: number
}

const PlaybackProgress = ({ progress, onProgressChange, minProgress: minProg, secProgress: secProg, minDuration: minDur, secDuration: secDur }: PlayerButtonsProps) => {
    const minutesProgress = useMemo(() => minProg, [minProg])
    const secondsProgress = useMemo(() => secProg, [secProg])
    const minutesDuration = useMemo(() => minDur, [minDur])
    const secondsDuration = useMemo(() => secDur, [secDur])

    const [progressState, setProgressState] = useState<number[] | undefined>([progress])
    const [isSeeking, setIsSeeking] = useState(false)

    useEffect(() => {
        if (!isSeeking) {
            setProgressState([progress])
        }
    }, [progress, isSeeking])

    const commitChange = (value: [number]) => {
        onProgressChange(value.at(0)! / 1000)
        setIsSeeking(false)
        setProgressState([progress])
        setTimeout(() => {
        }, 100)
    }

    const enableSeeking = () => {
        setIsSeeking(true)
        setProgressState(undefined)
    }

    // TODO: tooltip with time to change to. 
    const handleSeek = (value: number[]) => {
        enableSeeking()
    }

    return (
        <div className="flex flex-row text-neutral-content items-center justify-center space-x-1 p-1 w-full">
            <span className="countdown font-mono text-sm lg:text-lg">
                <span style={{ '--value': minutesProgress }}></span>:
                <span style={{ '--value': secondsProgress }}></span>
            </span>
            <Slider.Root
                onValueCommit={commitChange}
                defaultValue={progressState}
                value={progressState}
                onValueChange={handleSeek}
                onMouseDown={enableSeeking}
                max={1000}
                step={10}
                aria-label="value"
                className="relative flex h-5 w-5/6 touch-none items-center"
            >
                <Slider.Track className="relative h-3  grow rounded-full bg-neutral-focus">
                    <Slider.Range className="absolute h-full rounded-full bg-purple-600 dark:bg-success" />
                </Slider.Track>
                <Slider.Thumb
                    className={
                        'block h-5 w-5 rounded-full bg-purple-600 dark:bg-white focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-opacity-75'
                    }
                />
            </Slider.Root>
            {/* <progress className="progress progress-success h-2 lg:h-3 bg-neutral-focus" value={progress} max="1000" onClick={onProgressClick}></progress> */}
            <span className="countdown font-mono text-sm lg:text-lg">
                <span style={{ '--value': minutesDuration }}></span>:
                <span style={{ '--value': secondsDuration }}></span>
            </span>
        </div>)
}

interface PlayerButtonProps {
    trackId: string
    isPlaying: boolean
    isShuffled: boolean
    isLiked: boolean
    seekForward: () => void
    seekBackward: () => void
}

const PlayerButtons = ({ trackId, isPlaying: isPlayingProp, isShuffled: isShuffledProp, isLiked, seekForward, seekBackward }: PlayerButtonProps) => {
    const [isShuffled, setIsShuffled] = useStateWithSyncedDefault(isShuffledProp)
    const [isPlaying, setIsPlaying] = useStateWithSyncedDefault(isPlayingProp)

    const { mutate: nextTrack } = useSkipToNextMutation({ onError: () => toast.error('Failed to skip to next track.') })

    const { mutate: prevTrack } = useSkipToPreviousMutation({ onError: () => toast.error('Failed to skip to previous track.') })

    const { mutate: pausePlayback, isLoading: loadingPause } = usePausePlaybackMutation({
        onSuccess: () => { setIsPlaying(false) },
        onError: () => toast.success('Failed to pause playback.'),
    })

    const { mutate: playTrack, isLoading: loadingPlay } = useStartPlaybackMutation()

    // variables: { input: !isShuffled },
    const { mutate: toggleShuffle } = useToggleShuffleMutation({
        onSuccess: () => {
            setIsShuffled(!isShuffled)
        },
        onError: () => toast.error('Failed to toggle shuffle.')
    })

    const isLoading = loadingPause || loadingPlay
    const onTogglePlayback = () => {
        if (!isLoading) {
            if (isPlaying) {
                pausePlayback({})
            } else {
                playTrack({ input: {} }, {
                    onError: () => toast.error('Failed to start playback.'),
                    onSuccess: () => {
                        setIsPlaying(true)
                    }
                })
            }
        }
    }

    const playButton = useMemo(() => {
        const buttonClass = isLoading ? commonClass + ' loading' : commonClass
        const playIcon = isLoading ? null : isPlaying ? <PauseIcon /> : <PlayIcon />
        return (<button className={buttonClass} onClick={onTogglePlayback}>{playIcon}</button>)
    }, [isPlaying, isLoading])


    const shuffleButton = useMemo(() => {
        const shuffleButtonClass = isShuffled ? commonClass + ' btn btn-success' : commonClass
        return (<button className={shuffleButtonClass} onClick={() => toggleShuffle({ input: !isShuffled })}><ShuffleIcon /></button>)
    }, [isShuffled])

    const likeAtom = atom(isLiked)

    const calculateSvgStyle = (isLiked: boolean) => isLiked ? 'fill-success' : ''
    return (
        <>
            <LikeButton trackId={trackId} likeAtom={likeAtom} className={commonClass} getSvgClassName={calculateSvgStyle} />
            <button className={commonClass} onClick={() => prevTrack({})}><PreviousTrackIcon /></button>
            <button className={commonClass} onClick={seekBackward}><SkipBackwardIcon /></button>
            {playButton}
            <button className={commonClass} onClick={seekForward}><SkipForwardIcon /></button>
            <button className={commonClass} onClick={() => nextTrack({})}><NextTrackIcon /></button>
            {shuffleButton}
        </>
    )
}

function getPercentProgress(e: React.MouseEvent<HTMLProgressElement, MouseEvent>) {
    const offsetLeft = e.currentTarget.offsetLeft
    const offsetWidth = e.currentTarget.offsetWidth
    if (offsetWidth > 0) {
        return (e.pageX - offsetLeft) / offsetWidth
    }
    return undefined
}

