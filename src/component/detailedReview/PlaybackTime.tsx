import { EntityType, useCreateCommentMutation } from "graphql/generated/schema";
import { useSetAtom } from "jotai";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { openCommentModalAtom } from "state/Atoms";
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
        <button className="bg-neutral flex flex-row hover:bg-neutral hover:text-neutral-content tooltip tooltip-bottom"
            data-tip={tooltipContent} onClick={showModal} disabled={disabled}>
            <span className="countdown font-mono text-2xl ">
                <span style={{ "--value": minutes }}></span>:
                <span style={{ "--value": seconds }}></span>
            </span>
            <div className="divider divider-horizontal" />
            <span className="countdown font-mono text-2xl">
                <span style={{ "--value": minDuration }}></span>:
                <span style={{ "--value": secDuration }}></span>
            </span>
        </button>
    )
}
