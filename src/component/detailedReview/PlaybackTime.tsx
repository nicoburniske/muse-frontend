import { EntityType, useCreateCommentMutation } from "graphql/generated/schema";
import { useSetAtom } from "jotai";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { openCommentModalAtom } from "state/Atoms";

export function PlaybackTime({ time, trackId, reviewId, disabled }: { time: number, trackId: string, reviewId: string, disabled: boolean }) {
    const setCommentModal = useSetAtom(openCommentModalAtom)
    const [createComment,] = useCreateCommentMutation({ onCompleted: () => { toast.success("comment created"); setCommentModal(undefined) } })
    const onSubmit = (comment: string) =>
        createComment({ variables: { input: { comment, entityId: trackId, entityType: EntityType.Track, reviewId } } })
            .then(() => { })

    const {minutes, seconds} = useMemo(() => msToTime(time), [time])

    const showModal = () => {
        const paddedS = seconds < 10 ? `0${seconds}` : seconds
        const initialValue = `<Stamp at="${minutes}:${paddedS}" />`
        const values = { title: "create comment", onCancel: () => setCommentModal(undefined), onSubmit, initialValue }
        setCommentModal(values)
    }

    const tooltipContent = disabled ? "Not part of this review" : "Comment at timestamp"

    return (
        <div className="tooltip tooltip-right" data-tip={tooltipContent}>
            <button className="hover:bg-neutral hover:text-neutral-content" onClick={showModal} disabled={disabled}>
                <span className="countdown font-mono text-2xl">
                    <span style={{ "--value": minutes }}></span>:
                    <span style={{ "--value": seconds }}></span>
                </span>
            </button>
        </div>
    )
}

function msToTime(duration: number) {
    const
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        seconds = Math.floor((duration / 1000) % 60),
        ms = Math.floor((duration % 1000) / 100)

    return {hours, minutes, seconds, ms}
}