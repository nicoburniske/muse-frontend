import { Dialog } from '@headlessui/react'
import { ThemeModal } from 'platform/component/ThemeModal'
import { CommentForm } from './CommentForm'

export interface CommentFormModalProps {
    open: boolean
    onSubmit: (comment: string) => Promise<void>
    onCancel: () => void
    title: string
    trackId: string
    initialValue?: string
}

export const CommentFormModal = ({ open, onSubmit, onCancel, title, trackId, initialValue }: CommentFormModalProps) => {
    return (
        <ThemeModal open={open} className="max-w-4xl">
            <div className="flex flex-col items-center justify-between space-y-5 p-3" >
                <Dialog.Title className="font-bold text-lg">
                    {title}
                </Dialog.Title>
                <CommentForm onSubmit={onSubmit} onCancel={onCancel} initialValue={initialValue} trackId={trackId}/>
            </div>
        </ThemeModal>
    )
}
