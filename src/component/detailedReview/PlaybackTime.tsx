import { EntityType, useCreateCommentMutation, usePausePlaybackMutation, useSeekPlaybackMutation, useSkipToNextMutation, useSkipToPreviousMutation, useStartPlaybackMutation } from "graphql/generated/schema";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { currentlyPlayingTrackAtom, openCommentModalAtom, selectedTrackAtom } from "state/Atoms";
import { msToTime } from "util/Utils";
interface PlaybackTimeProps {
    trackId: string,
    trackImage: string,
    trackName: string,
    trackArtist: string,
    isPlaying: boolean,
    // Current playback position.
    progressMs: number,
    // Track total duration.
    durationMs: number,
    reviewId: string,
    disabled: boolean
}

export function PlaybackTime({
    progressMs: progressProp, durationMs: durationProp,
    trackId, reviewId, disabled, isPlaying: isPlayingProp, trackImage, trackName, trackArtist }: PlaybackTimeProps) {
    // Synchronizing prop state with local state. Want the button to change instantly.
    const [isPlaying, setIsPlaying] = useState(isPlayingProp)
    useEffect(() => setIsPlaying(isPlayingProp), [isPlayingProp])

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
    const [nextTrack, { loading: nextLoading }] = useSkipToNextMutation({
        onError: () => toast.error('Failed to skip to next track.'),
    });

    const [prevTrack, { loading: prevLoading }] = useSkipToPreviousMutation({
        onError: () => toast.error('Failed to skip to previous track.'),
    });


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
            toast.success("Paused playback.", { autoClose: 500 })
            setIsPlaying(false)
        },
        onError: () => toast.success("Failed to pause playback."),
    })

    const [playTrack, { loading: loadingPlay }] = useStartPlaybackMutation({
        variables: { input: {} },
        onError: () => toast.error('Failed to start playback.'),
        onCompleted: () => {
            toast.success(`Successfully started playback`, { autoClose: 500 })
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
    const commonClass = 'btn btn-ghost neutral-focus'
    const buttonClass = useMemo(() => isLoading ? commonClass + ' loading' : commonClass, [isLoading])

    const icon = useMemo(() =>
        isLoading ? null :
            isPlaying ? <PauseIcon /> : <PlayIcon />
        , [isPlaying, isLoading])

    return (
        <div className="flex flex-row justify-center bg-neutral rounded-xl space-x-2 max-w-2xl w-full border-accent border">
            <button className="flex avatar tooltip tooltip-left p-1"
                        data-tip={tooltipContent} onClick={showModal} disabled={disabled} >
                <div className="rounded w-16 md:w-24 lg:w-32">
                    <img className='scale-100' loading='lazy' src={trackImage} />
                </div>
            </button>
            <div className="flex flex-col justify-between rounded-lg w-4/5">
                <div className="flex flex-row">
                    <div className={`flex flex-row justify-around w-full`} onClick={selectNowPlaying}>
                            <div className="text-center truncate p-0.5 prose w-1/2 text-neutral-content"> {trackName} </div>
                            <div className="divider divider-horizontal "/>
                            <div className="text-center truncate p-0.5 prose w-1/2 text-neutral-content"> {trackArtist} </div>
                    </div>
                </div>
                <div className="divider divider-vertical p-0 m-0"/>
                <div className="flex flex-row justify-around items-center text-neutral-content ">
                    <button className={commonClass} onClick={() => prevTrack()}><PreviousTrackIcon /></button>
                    <button className={commonClass} onClick={seekBackward}><SkipBackwardIcon /></button>
                    <button className={buttonClass} onClick={onTogglePlayback}>{icon}</button>
                    <button className={commonClass} onClick={seekForward}><SkipForwardIcon /></button>
                    <button className={commonClass} onClick={() => nextTrack()}><NextTrackIcon /></button>
                </div>
                <div className="flex flex-row text-neutral-content items-center justify-center space-x-1 p-1 w-full">
                    <button className="flex flex-row">
                        <span className="countdown font-mono text-xl ">
                            <span style={{ "--value": minutes }}></span>:
                            <span style={{ "--value": seconds }}></span>
                        </span>
                    </button>
                    <progress className="progress progress-success h-4 bg-neutral-focus" value={progress} max="1000" onClick={onProgressClick}></progress>
                    <span className="countdown font-mono text-xl">
                        <span style={{ "--value": minDuration }}></span>:
                        <span style={{ "--value": secDuration }}></span>
                    </span>
                </div>
            </div>
        </div>
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

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
)

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
)

const SkipForwardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
)

const SkipBackwardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
)

const NextTrackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
    </svg>
)

const PreviousTrackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
    </svg>
)
