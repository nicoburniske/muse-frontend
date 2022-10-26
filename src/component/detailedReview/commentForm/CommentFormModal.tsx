import { Dialog } from "@headlessui/react"
import { ThemeModal } from "component/ThemeModal"
import { CommentForm } from "./CommentForm"

export interface CommentFormModalProps {
    open: boolean
    onSubmit: (comment: string) => Promise<void>
    onCancel: () => void
    title: string
    initialValue?: string
}

export const CommentFormModal = ({ open, onSubmit, onCancel, title, initialValue }: CommentFormModalProps) => {
    return (
        <ThemeModal open={open}>
            <Dialog.Panel className="w-full max-w-4xl rounded bg-neutral border-primary">
                <div className="flex flex-col items-center justify-between space-y-5 p-3" >
                    <Dialog.Title>
                        <h3 className="font-bold text-lg text-neutral-content"> {title} </h3>
                    </Dialog.Title>
                    <CommentForm onSubmit={onSubmit} onCancel={onCancel} initialValue={initialValue} />
                </div>
            </Dialog.Panel>
        </ThemeModal>
    )
}
