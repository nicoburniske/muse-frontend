import { EntityType, useCreateCommentMutation, useSeekPlaybackMutation } from "graphql/generated/schema";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { currentlyPlayingTrackAtom, openCommentModalAtom, selectedTrackAtom } from "state/Atoms";
import { msToTime } from "util/Utils";
interface PlaybackTimeProps {
    progressMs: number,
    durationMs: number,
    trackId: string,
    reviewId: string,
    disabled: boolean
}

export function PlaybackTime({ progressMs, durationMs, trackId, reviewId, disabled }: PlaybackTimeProps) {
    const setCommentModal = useSetAtom(openCommentModalAtom)
    const nowPlaying = useAtomValue(currentlyPlayingTrackAtom)

    const progress = useMemo(() => (progressMs / durationMs) * 1000, [progressMs, durationMs])
    const setSelectedTrack = useSetAtom(selectedTrackAtom)

    const [seekTrack, { loading }] = useSeekPlaybackMutation({
        onError: () => toast.error(`Failed to start playback.`),
    });

    function onProgressClick(e: React.MouseEvent<HTMLProgressElement, MouseEvent>) {
        setSelectedTrack(nowPlaying)
        const progress = getPercentProgress(e)
        if (progress !== undefined && !loading) {
            const position = Math.floor(progress * durationMs)
            seekTrack({ variables: { input: { positionMs: position } } })
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

    const tooltipContent = disabled ? "Not part of this review" : "Comment at timestamp"

    return (
        <div className="flex flex-row w-1/3 bg-neutral text-neutral-content items-center justify-center space-x-1 p-1">
            <button className="flex flex-row hover:bg-neutral-focus  tooltip tooltip-bottom"
                data-tip={tooltipContent} onClick={showModal} disabled={disabled}>
                <span className="countdown font-mono text-2xl ">
                    <span style={{ "--value": minutes }}></span>:
                    <span style={{ "--value": seconds }}></span>
                </span>
            </button>
            <progress className="progress progress-success h-5 bg-neutral-focus" value={progress} max="1000" onClick={onProgressClick}></progress>
            <span className="countdown font-mono text-2xl">
                <span style={{ "--value": minDuration }}></span>:
                <span style={{ "--value": secDuration }}></span>
            </span>
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
