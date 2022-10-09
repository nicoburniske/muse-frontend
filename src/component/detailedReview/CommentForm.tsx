import { useMemo, useState } from "react"
import { Dialog } from '@headlessui/react'

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
        <div className="flex flex-col items-center " >
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
export interface CommentFormModalProps {
    open: boolean
    onSubmit: (comment: string) => Promise<void>
    onClose: () => void
    onCancel: () => void
    title: string
    initialValue?: string
}

export const CommentFormModal = ({ open, onSubmit, onClose, onCancel, title, initialValue}: CommentFormModalProps) => {
    return (
    <Dialog open={open} onClose={onClose}>
        <div className="fixed inset-0 flex items-center justify-center p-4 w-full">
            <Dialog.Panel className="w-full max-w-sm rounded bg-neutral">
                <Dialog.Title>{title}</Dialog.Title>
                {/* <Dialog.Description>
                    This will permanently deactivate your account
                </Dialog.Description> */}
                <CommentForm onSubmit={onSubmit} onCancel={onCancel} initialValue={initialValue}/>
            </Dialog.Panel>
        </div>
    </Dialog>)
}