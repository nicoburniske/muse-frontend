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
        <div className="flex flex-col" >
            <div>Comment</div>
            <TextField
                sx={{ p: "20px 0" }}
                multiline
                fullWidth
                minRows={8}
                id="outlined-multilined"
                placeholder="create a comment"
                value={comment}
            />
            <input type="text" placeholder="create a comment" className="input input-bordered input-lg w-full max-w-xs h"
                onChange={(e) => setComment(e.target.value as string)}
                value={comment}
            />

            <Button
                sx={buttonStyle}
                onClick={submitAndReset}
                disabled={!canSubmit}>
                {initialValue.length === 0 ? "create" : "update"}
            </Button>
            <Button
                sx={buttonStyle}
                onClick={cancel}>
                cancel
            </Button>
        </div>
    )
}


const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const buttonStyle = {
    float: "right",
    bgcolor: "custom.moderateBlue",
    color: "neutral.white",
    p: "8px 25px",
    "&:hover": {
        bgcolor: "custom.lightGrayishBlue",
    }
}