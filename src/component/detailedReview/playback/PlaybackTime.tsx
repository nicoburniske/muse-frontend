import { HeartIcon, NextTrackIcon, PauseIcon, PlayIcon, PreviousTrackIcon, ShuffleIcon, SkipBackwardIcon, SkipForwardIcon } from "component/Icons";
import { EntityType, useCreateCommentMutation, usePausePlaybackMutation, useRemoveSavedTracksMutation, useSaveTracksMutation, useSeekPlaybackMutation, useSkipToNextMutation, useSkipToPreviousMutation, useStartPlaybackMutation, useToggleShuffleMutation } from "graphql/generated/schema";
import useStateWithSyncedDefault from "hook/useStateWithSyncedDefault";
import { useBoolToggleSynced } from "hook/useToggle";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import toast from 'react-hot-toast';
import { currentlyPlayingTrackAtom, openCommentModalAtom, selectedTrackAtom } from "state/Atoms";
import { msToTime } from "util/Utils";

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

const commonClass = 'btn  btn-sm lg:btn-md neutral-focus p-0'

export function PlaybackTime({
    progressMs: progressProp, durationMs: durationProp,
    trackId, reviewId, disabled, isPlaying, isShuffled,
    trackImage, trackName, trackArtist, isLiked }: PlaybackTimeProps) {

    const [progressMs, setProgressMs] = useStateWithSyncedDefault(progressProp >= 0 ? progressProp : 0)
    const setCommentModal = useSetAtom(openCommentModalAtom)
    const setSelectedTrack = useSetAtom(selectedTrackAtom)
    const nowPlaying = useAtomValue(currentlyPlayingTrackAtom)

    const { mutateAsync: seekTrack, isLoading: loading } = useSeekPlaybackMutation({
        onError: () => toast.error('Failed to seek playback.'),
    });

    const seekForward = () => seekTrack({ input: { positionMs: progressMs + 10000 } })
    const seekBackward = () => seekTrack({ input: { positionMs: progressMs - 10000 } })

    // TODO: how to handle this?
    // const selectNowPlaying = () => {
    //     setSelectedTrack('')
    //     setTimeout(() => setSelectedTrack(nowPlaying), 1);
    // }

    const { mutate: createComment } = useCreateCommentMutation({ onSuccess: () => { toast.success("comment created"); setCommentModal(undefined) } })
    // TODO: how do I get review in here? 
    const onSubmit = (comment: string) =>
        createComment({ input: { comment, entityId: trackId, entityType: EntityType.Track, reviewId } },)

    // Sometimes spotify sends crap. need to ensure that the positions makes sense.
    const durationMs = durationProp > 0 ? durationProp : 1
    const progress = (progressMs / durationMs) * 1000

    const { minutes, seconds } = msToTime(progressMs)
    const { minutes: minDuration, seconds: secDuration } = msToTime(durationMs)

    function onProgressClick(e: React.MouseEvent<HTMLProgressElement, MouseEvent>) {
        const progress = getPercentProgress(e)
        if (progress !== undefined && !loading) {
            const position = Math.floor(progress * durationMs)
            seekTrack({ input: { positionMs: position } })
                .then(() => setProgressMs(position))
        }
    }

    const showModal = () => {
        const paddedS = seconds < 10 ? `0${seconds}` : seconds
        const initialValue = `<Stamp at="${minutes}:${paddedS}" />`
        const values = { title: "create comment", onCancel: () => setCommentModal(undefined), onSubmit, initialValue }
        setCommentModal(values)
    }

    const tooltipContent = useMemo(() => disabled ? "Not part of this review" : "Comment at timestamp", [disabled])

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
                <div className={`flex flex-col justify-around w-full`}>
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
                    onProgressClick={onProgressClick}
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
    onProgressClick: (e: React.MouseEvent<HTMLProgressElement, MouseEvent>) => void

    minProgress: number
    secProgress: number

    minDuration: number
    secDuration: number
}

const PlaybackProgress = ({ progress: progProp, onProgressClick, minProgress: minProg, secProgress: secProg, minDuration: minDur, secDuration: secDur }: PlayerButtonsProps) => {
    const progress = useMemo(() => progProp, [progProp])
    const minutesProgress = useMemo(() => minProg, [minProg])
    const secondsProgress = useMemo(() => secProg, [secProg])

    const minutesDuration = useMemo(() => minDur, [minDur])
    const secondsDuration = useMemo(() => secDur, [secDur])

    return (
        <div className="flex flex-row text-neutral-content items-center justify-center space-x-1 p-1 w-full">
            <span className="countdown font-mono text-sm lg:text-lg">
                <span style={{ "--value": minutesProgress }}></span>:
                <span style={{ "--value": secondsProgress }}></span>
            </span>
            <progress className="progress progress-success h-2 lg:h-3 bg-neutral-focus" value={progress} max="1000" onClick={onProgressClick}></progress>
            <span className="countdown font-mono text-sm lg:text-lg">
                <span style={{ "--value": minutesDuration }}></span>:
                <span style={{ "--value": secondsDuration }}></span>
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

    const { mutate: nextTrack } = useSkipToNextMutation({ onError: () => toast.error('Failed to skip to next track.') });

    const { mutate: prevTrack } = useSkipToPreviousMutation({ onError: () => toast.error('Failed to skip to previous track.') });

    const { mutate: pausePlayback, isLoading: loadingPause } = usePausePlaybackMutation({
        onSuccess: () => { setIsPlaying(false) },
        onError: () => toast.success("Failed to pause playback."),
    })

    const { mutate: playTrack, isLoading: loadingPlay } = useStartPlaybackMutation();

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

    return (
        <>
            <LikeButton trackId={trackId} isLiked={isLiked} className={commonClass} />
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

const LikeButton = ({ trackId, isLiked: isLikedProp, className }: { trackId: string, isLiked: boolean, className: string }) => {
    const [isLiked, , toggleLiked] = useBoolToggleSynced(isLikedProp)

    const { mutate: likeTrack, isLoading: loadingLike } = useSaveTracksMutation({
        onSuccess: () => toggleLiked(),
        onError: () => toast.error('Failed to toggle like.'),
    });

    const { mutate: unlikeTrack, isLoading: loadingUnlike } = useRemoveSavedTracksMutation({
        onSuccess: () => toggleLiked(),
        onError: () => toast.error('Failed to toggle like.'),
    });
    const input = { trackIds: [trackId] }
    const handleClick = () => isLiked ? unlikeTrack(input) : likeTrack(input)

    const likedButtonClass = useMemo(() => isLiked ? className + ' btn btn-success' : className, [className, isLiked])
    return (
        <button className={likedButtonClass} onClick={() => handleClick()}>
            <HeartIcon />
        </button>
    )
}