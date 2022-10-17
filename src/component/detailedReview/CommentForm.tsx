import { useMemo, useState } from "react"
import { Dialog } from '@headlessui/react'
import { useAtomValue } from "jotai"
import { themeAtom } from "state/Atoms"

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
            <textarea placeholder="create a comment" className="form-textarea mt-1 block w-full h-48 text-base-content bg-base-100 focus:border-accent-focus border-accent"
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
        // Returning null for on close makes it so
        <Dialog open={open} onClose={() => null} data-theme={theme}>
            <div className="fixed inset-0 bg-base-300/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4 w-full z-50">
                <Dialog.Panel className="w-full max-w-4xl rounded bg-neutral border-primary">
                    <div className="flex flex-col items-center justify-between space-y-5 p-3" >
                        <Dialog.Title>
                            <h3 className="font-bold text-lg text-neutral-content"> {title} </h3>
                        </Dialog.Title>
                        {/* <Dialog.Description>
                This will permanently deactivate your account
            </Dialog.Description> */}
                        {/* <div className="w-full"> */}
                        <CommentForm onSubmit={onSubmit} onCancel={onCancel} initialValue={initialValue} />
                        {/* </div> */}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>)
}
// return (
//     // Returning null for on close makes it so
//     <Dialog open={open} onClose={() => null} data-theme={theme}>
//         <div className="fixed inset-0 bg-base-300/30" aria-hidden="true" />
//         <Dialog.Panel className="w-1/4 max-w-4xl rounded bg-neutral border-primary">
//             <div className="flex flex-col items-center justify-between space-y-5 p-3" >
//                 {/* <Dialog.Title>
//                     <h3 className="font-bold text-lg text-primary-content"> {title} </h3>
//                 </Dialog.Title> */}
//                 <Dialog.Title>{title}</Dialog.Title>
//                 {/* <Dialog.Description>
//                 This will permanently deactivate your account
//             </Dialog.Description> */}
//                 {/* <div className="w-full"> */}
//                 <CommentForm onSubmit={onSubmit} onCancel={onCancel} initialValue={initialValue} />
//                 {/* </div> */}
//             </div>
//         </Dialog.Panel>
//     </Dialog >)