import { Box, Button, IconButton, TextField, Typography } from "@mui/material"
import { useMemo, useState } from "react"

export interface CommentFormProps {
    initialValue?: string
    onSubmit: (comment: string) => Promise<void>
    onCancel: () => void
}

// TODO: integrate markdown here!
export function CommentForm({ onSubmit, onCancel, initialValue = "" }: CommentFormProps) {
    const [comment, setComment] = useState(initialValue)
    const canSubmit = useMemo(() => comment != initialValue, [comment, initialValue])

    const submitAndReset = async (event) => {
        event.preventDefault()
        try {
            await onSubmit(comment)
        } catch (error) {
            console.error(error)
        }
    }

    const cancel = (event) => {
        event.preventDefault()
        onCancel()
        setComment(initialValue)
    }

    return (
        <div className="flex flex-col items-center outline-dashed " >
            <div>Comment</div>
            <textarea placeholder="create a comment" className="form-textarea mt-1 block w-1/2 h-24"
                onChange={(e) => setComment(e.target.value as string)}
                value={comment}
            />
            <div className="flex flex-row items-center outline-dashed " >
                <button className="btn btn-primary space-w-5"
                    onClick={submitAndReset}
                    disabled={!canSubmit}>
                    {initialValue.length === 0 ? "create" : "update"}
                </button>
                <button className="btn btn-secondary"
                    onClick={cancel}>
                    cancel
                </button>
            </div>
        </div>
    )
}
