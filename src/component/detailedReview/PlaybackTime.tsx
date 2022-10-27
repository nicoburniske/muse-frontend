import { HeartIcon, NextTrackIcon, PauseIcon, PlayIcon, PreviousTrackIcon, ShuffleIcon, SkipBackwardIcon, SkipForwardIcon } from "component/Icons";
import { EntityType, useCreateCommentMutation, usePausePlaybackMutation, useSeekPlaybackMutation, useSkipToNextMutation, useSkipToPreviousMutation, useStartPlaybackMutation, useToggleShuffleMutation } from "graphql/generated/schema";
import useStateWithSyncedDefault from "hook/useStateWithSyncedDefault";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { currentlyPlayingTrackAtom, openCommentModalAtom, selectedTrackAtom } from "state/Atoms";
import { msToTime } from "util/Utils";
interface PlaybackTimeProps {
    trackId: string,
    trackImage: string,
    trackName: string,
    trackArtist: string,
    isPlaying: boolean,
    isShuffled: boolean,
    // Current playback position.
    progressMs: number,
    // Track total duration.
    durationMs: number,
    reviewId: string,
    disabled: boolean
}

const commonClass = 'btn btn-ghost neutral-focus'

export function PlaybackTime({
    progressMs: progressProp, durationMs: durationProp,
    trackId, reviewId, disabled, isPlaying: isPlayingProp, isShuffled: isShuffledProp,
    trackImage, trackName, trackArtist }: PlaybackTimeProps) {
    const [isPlaying, setIsPlaying] = useStateWithSyncedDefault(isPlayingProp)
    const [isShuffled, setIsShuffled] = useStateWithSyncedDefault(isShuffledProp)

    // Sometimes spotify sends crap. need to ensure that the positions makes sense.
    const progressMs = useMemo(() => progressProp >= 0 ? progressProp : 0, [progressProp])
    const durationMs = useMemo(() => durationProp > 0 ? durationProp : 1, [durationProp])
    const setCommentModal = useSetAtom(openCommentModalAtom)
    const nowPlaying = useAtomValue(currentlyPlayingTrackAtom)

    const progress = useMemo(() => (progressMs / durationMs) * 1000, [progressMs, durationMs])
    const setSelectedTrack = useSetAtom(selectedTrackAtom)

    const [seekTrack, { loading }] = useSeekPlaybackMutation({
        onError: () => toast.error('Failed to seek playback.'),
    });
    const [nextTrack,] = useSkipToNextMutation({
        onError: () => toast.error('Failed to skip to next track.'),
    });

    const [prevTrack,] = useSkipToPreviousMutation({
        onError: () => toast.error('Failed to skip to previous track.'),
    });

    const [toggleShuffle, { }] = useToggleShuffleMutation({
        variables: { input: !isShuffled },
        onCompleted: () => {
            setIsShuffled(!isShuffled)
        },
        onError: () => toast.error('Failed to toggle shuffle.')
    })

    function onProgressClick(e: React.MouseEvent<HTMLProgressElement, MouseEvent>) {
        const progress = getPercentProgress(e)
        if (progress !== undefined && !loading) {
            const position = Math.floor(progress * durationMs)
            seekTrack({ variables: { input: { positionMs: position } } })
        }
    }

    const selectNowPlaying = () => {
        setSelectedTrack('')
        setTimeout(() => setSelectedTrack(nowPlaying), 1);
    }

    const seekForward = () => seekTrack({ variables: { input: { positionMs: progressMs + 10000 } } })
    const seekBackward = () => seekTrack({ variables: { input: { positionMs: progressMs - 10000 } } })

    const [pausePlayback, { loading: loadingPause }] = usePausePlaybackMutation({
        variables: { deviceId: undefined },
        onCompleted: () => {
            setIsPlaying(false)
        },
        onError: () => toast.success("Failed to pause playback."),
    })

    const [playTrack, { loading: loadingPlay }] = useStartPlaybackMutation({
        variables: { input: {} },
        onError: () => toast.error('Failed to start playback.'),
        onCompleted: () => {
            setIsPlaying(true)
        }
    });
    const isLoading = loadingPause || loadingPlay

    const onTogglePlayback = () => {
        if (!isLoading) {
            if (isPlaying) {
                pausePlayback()
            } else {
                playTrack()
            }
        }
    }

    const [createComment,] = useCreateCommentMutation({ onCompleted: () => { toast.success("comment created"); setCommentModal(undefined) } })
    const onSubmit = (comment: string) =>
        createComment({ variables: { input: { comment, entityId: trackId, entityType: EntityType.Track, reviewId } } })
            .then(() => { })

    const { minutes, seconds } = useMemo(() => msToTime(progressMs), [progressMs])
    const { minutes: minDuration, seconds: secDuration } = useMemo(() => msToTime(durationMs), [durationMs])

    const showModal = () => {
        const paddedS = seconds < 10 ? `0${seconds}` : seconds
        const initialValue = `<Stamp at="${minutes}:${paddedS}" />`
        const values = { title: "create comment", onCancel: () => setCommentModal(undefined), onSubmit, initialValue }
        setCommentModal(values)
    }

    const tooltipContent = useMemo(() => disabled ? "Not part of this review" : "Comment at timestamp", [disabled])
    const buttonClass = useMemo(() => isLoading ? commonClass + ' loading' : commonClass, [isLoading])
    const shuffleButtonClass = useMemo(() => isShuffled ? 'btn btn-success' : commonClass, [isShuffled])

    const icon = useMemo(() =>
        isLoading ? null :
            isPlaying ? <PauseIcon /> : <PlayIcon />
        , [isPlaying, isLoading])

    console.log(isShuffled, 'SHUFFLED')
    return (
        <div className="grid grid-cols-4 rounded-xl w-full h-full border-accent border bg-neutral">
            <div className='flex flex-row px-1 space-x-2 items-center max-w-[70%]'>
                <button className="tooltip tooltip-right p-1" data-tip={tooltipContent} onClick={showModal} disabled={disabled} >
                    <div className="avatar" >
                        <div className="w-16 lg:w-20 rounded">
                            <img loading='lazy' src={trackImage} />
                        </div>
                    </div>
                </button>
                <div className={`flex flex-col justify-around w-full`} onClick={selectNowPlaying}>
                    <div className="text-left truncate p-0.5 prose w-full text-neutral-content"> {trackName} </div>
                    <div className="text-left truncate p-0.5 prose w-full text-neutral-content"> {trackArtist} </div>
                </div>
            </div>
            <div className="col-span-2 flex flex-col justify-center items-center rounded-lg max-w-4xl">
                <div className="flex flex-row justify-around items-center text-neutral-content">
                    <button className={commonClass} onClick={() => null}><HeartIcon /></button>
                    <button className={commonClass} onClick={() => prevTrack()}><PreviousTrackIcon /></button>
                    <button className={commonClass} onClick={seekBackward}><SkipBackwardIcon /></button>
                    <button className={buttonClass} onClick={onTogglePlayback}>{icon}</button>
                    <button className={commonClass} onClick={seekForward}><SkipForwardIcon /></button>
                    <button className={commonClass} onClick={() => nextTrack()}><NextTrackIcon /></button>
                    <button className={shuffleButtonClass} onClick={() => toggleShuffle()}><ShuffleIcon /></button>
                </div>
                <div className="flex flex-row text-neutral-content items-center justify-center space-x-1 p-1 w-full">
                    <button className="flex flex-row">
                        <span className="countdown font-mono text-sm lg:text-lg">
                            <span style={{ "--value": minutes }}></span>:
                            <span style={{ "--value": seconds }}></span>
                        </span>
                    </button>
                    <progress className="progress progress-success h-2 lg:h-3 bg-neutral-focus" value={progress} max="1000" onClick={onProgressClick}></progress>
                    <span className="countdown font-mono text-sm lg:text-lg">
                        <span style={{ "--value": minDuration }}></span>:
                        <span style={{ "--value": secDuration }}></span>
                    </span>
                </div>
            </div>
        </div >
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