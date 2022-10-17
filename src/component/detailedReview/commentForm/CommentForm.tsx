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
        <div className="flex flex-col  w-full items-center space-y-5 p-3" >
            <textarea placeholder="..." className="form-textarea mt-1 block w-full h-48 text-base-content bg-base-100 focus:border-accent-focus border-accent"
                onChange={(e) => setComment(e.target.value as string)}
                value={comment}
            />
            <div className="flex flex-row items-center justify-around w-1/2" >
                <button className="btn btn-success disabled:btn-outline"
                    onClick={submitAndReset}
                    disabled={!canSubmit}>
                    {initialValue.length === 0 ? "create" : "update"}
                </button>
                <button className="btn btn-error"
                    onClick={cancel}>
                    cancel
                </button>
            </div>
        </div>
    )
}
