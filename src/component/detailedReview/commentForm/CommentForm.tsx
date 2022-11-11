import { CheckIcon, CrossIcon } from 'component/Icons'
import { useMemo, useState } from 'react'
import CommentMarkdown from '../comment/CommentMarkdown'

export interface CommentFormProps {
    initialValue?: string
    onSubmit: (comment: string) => Promise<void>
    onCancel: () => void
    trackId: string
}

// TODO: integrate markdown here!
export function CommentForm({ onSubmit, onCancel, initialValue = '', trackId }: CommentFormProps) {
    const [comment, setComment] = useState(initialValue)
    const canSubmit = useMemo(() => comment != initialValue, [comment, initialValue])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submitAndReset = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault()
        try {
            setIsSubmitting(true)
            await onSubmit(comment)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const cancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault()
        onCancel()
        setComment(initialValue)
    }

    const className = canSubmit ? (isSubmitting ? 'loading' : '') : 'btn-disabled'

    const [isEditing, setIsEditing] = useState(true)

    return (
        <div className="flex flex-col w-full items-center space-y-5" >
            <div className="tabs">
                <a className={`tab tab-bordered ${isEditing ? 'tab-active' : ''}`} onClick={() => setIsEditing(true)}>edit</a>
                <a className={`tab tab-bordered ${!isEditing ? 'tab-active' : ''}`} onClick={() => setIsEditing(false)}>preview</a>
            </div>
            {isEditing ?
                (
                    <div className="w-full flex flex-col items-center space-y-5 min-h-[15rem]">
                        <textarea placeholder="" className="grow w-full text-base-content bg-base-100 focus:border-accent-focus border-accent p-1"
                            onChange={(e) => setComment(e.target.value as string)}
                            value={comment}
                        />
                        <div className="flex flex-row items-center justify-around w-1/2" >
                            <button
                                className={`btn btn-success ${className}`}
                                onClick={submitAndReset}
                                disabled={!canSubmit || isSubmitting}>
                                <CheckIcon />
                            </button>
                            <button className="btn btn-error"
                                onClick={cancel}
                                disabled={isSubmitting}
                            >
                                <CrossIcon />
                            </button>
                        </div>
                    </div>) :
                (
                    <div className='w-full flex flex-col items-center min-h-[15rem] text-base-content bg-base-100 prose'>
                        <CommentMarkdown trackId={trackId} comment={comment} />
                    </div>
                )
            }
        </div>
    )
}
