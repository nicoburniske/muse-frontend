import { Dialog } from "@headlessui/react"
import { useAtomValue } from "jotai"
import { themeAtom } from "state/Atoms"
import { CommentForm } from "./CommentForm"

export interface CommentFormModalProps {
    open: boolean
    onSubmit: (comment: string) => Promise<void>
    onCancel: () => void
    title: string
    initialValue?: string
}

export const CommentFormModal = ({ open, onSubmit, onCancel, title, initialValue }: CommentFormModalProps) => {
    const theme = useAtomValue(themeAtom)
    return (
        // Returning null avoids close on click.
        <Dialog open={open} onClose={() => null} data-theme={theme}>
            <div className="fixed inset-0 bg-base-300/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4 w-full z-50">
                <Dialog.Panel className="w-full max-w-4xl rounded bg-neutral border-primary">
                    <div className="flex flex-col items-center justify-between space-y-5 p-3" >
                        <Dialog.Title>
                            <h3 className="font-bold text-lg text-neutral-content"> {title} </h3>
                        </Dialog.Title>
                        <CommentForm onSubmit={onSubmit} onCancel={onCancel} initialValue={initialValue} />
                        {/* </div> */}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>)
}
