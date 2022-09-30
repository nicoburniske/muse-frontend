import { Box, Button, TextField } from "@mui/material"
import { useState } from "react"

export interface CommentFormProps {
    initialValue?: string
    onSubmit: (comment: string) => Promise<void>
    onCancel: () => void
}

// TODO: integrate markdown here!
export function CommentForm({ onSubmit, onCancel, initialValue = "" }: CommentFormProps) {
    const [comment, setComment] = useState(initialValue)
    const canSubmit = comment.length !== 0

    const submitAndReset = (event) => {
        event.preventDefault()
        onSubmit(comment)
        setComment("")
    }

    const cancel = (event) => {
        event.preventDefault()
        onCancel()
        setComment(initialValue)
    }

    return (
        <Box>
            <TextField
                sx={{ p: "20px 0" }}
                multiline
                fullWidth
                minRows={8}
                id="outlined-multilined"
                placeholder="create a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value as string)}
            />
            <Button
                sx={{
                    float: "right",
                    bgcolor: "custom.moderateBlue",
                    color: "neutral.white",
                    p: "8px 25px",
                    "&:hover": {
                        bgcolor: "custom.lightGrayishBlue",
                    },
                }}
                onClick={submitAndReset}
                disabled={!canSubmit}
            >
                {initialValue.length === 0 ? "create" : "update"}
            </Button>

            <Button
                sx={{
                    float: "right",
                    bgcolor: "custom.moderateBlue",
                    color: "neutral.white",
                    p: "8px 25px",
                    "&:hover": {
                        bgcolor: "custom.lightGrayishBlue",
                    },
                }}
                onClick={cancel}
            >
                cancel
            </Button>


        </Box >
    )
}
