import { Dialog } from "@headlessui/react"
import { CheckIcon, CrossIcon, HazardIcon, ReplyIcon, TrashIcon } from "component/Icons"
import { ThemeModal } from "component/ThemeModal"
import { useUpdateReviewMutation, useDeleteReviewMutation } from "graphql/generated/schema"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

interface EditReviewProps {
    isOpen: boolean
    reviewId: string
    reviewName: string
    isPublic: boolean
    onSuccess: () => void
    onCancel: () => void
}

function useStateWithSyncedDefault<T>(defaultValue: T) {
    const state = useState(defaultValue)
    const [, setState] = state
    useEffect(() => setState(defaultValue), [defaultValue])
    return state
}

const deleteStyle = "btn btn-error absolute top-0 right-5"

export const EditReview = ({ isOpen, reviewId, reviewName: reviewNameProp, isPublic: isPublicProp, onSuccess, onCancel }: EditReviewProps) => {
    const defaultIsPublic = useMemo(() => isPublicProp ? 1 : 0, [isPublicProp])

    const [reviewName, setReviewName] = useStateWithSyncedDefault(reviewNameProp)
    const [isPublic, setIsPublic] = useStateWithSyncedDefault(defaultIsPublic)

    const resetState = () => {
        setIsPublic(defaultIsPublic)
        setReviewName(reviewNameProp)
        setIsDeleting(false)
    }

    const input = { reviewId, name: reviewName, isPublic: (isPublic === 1 ? true : false) }
    const [updateReview, { loading }] = useUpdateReviewMutation({
        variables: { input },
        onError: () => toast.error('Failed to update review.'),
        onCompleted: () => {
            onSuccess()
            resetState()
        }
    })

    // Deleting
    const [isDeleting, setIsDeleting] = useState(false)
    const nav = useNavigate()
    const [deleteReview, { }] = useDeleteReviewMutation({
        variables: { input: { id: reviewId } },
        onError: () => toast.error('Failed to delete review.'),
        onCompleted: () => {
            nav('/')
            toast.success('Successfully deleted review.')
        }
    })

    const onSubmit = () => {
        updateReview()
    }

    const cancel = () => {
        onCancel()
        resetState()
    }

    const disabled = useMemo(() =>
        loading || (isPublic === defaultIsPublic && reviewName === reviewNameProp),
        [loading, isPublic, reviewName])

    return (
        <ThemeModal open={isOpen}>
            <Dialog.Panel className="w-1/4 max-w-4xl rounded bg-neutral border-primary relative">
                <div className="flex flex-col items-center justify-between space-y-5 p-3" >
                    <Dialog.Title>
                        <h3 className="font-bold text-lg text-neutral-content"> edit review </h3>
                    </Dialog.Title>
                    <div className="w-full max-w-xs">
                        <label className="label">
                            <span className="label-text text-neutral-content"> review name </span>
                        </label>
                        <input type="text" placeholder="Review Name" className="input input-bordered w-full max-w-xs"
                            onChange={(e) => setReviewName(e.target.value as string)}
                            value={reviewName}
                        />
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <label className="label">
                            <span className="label-text text-neutral-content">is public</span>
                        </label>
                        <select
                            value={isPublic} onChange={(e) => setIsPublic(+e.target.value)}
                            className="select select-bordered w-full max-w-xs">
                            <option value={0}>false</option>
                            <option value={1}>true</option>
                        </select>
                    </div>

                    <div className="flex flex-row items-center justify-around w-1/2" >
                        <button className="btn btn-success" disabled={disabled} onClick={onSubmit}> <CheckIcon /> </button>
                        <button className="btn btn-info" onClick={cancel}> <CrossIcon /> </button>
                    </div>

                    {isDeleting ?
                        <div className="btn-group absolute top-0 right-5" >
                            <button className="btn btn-error tooltip tooltip-error" data-tip="delete review" onClick={() => deleteReview()}>
                                <HazardIcon />
                            </button>
                            <button className="btn btn-info tooltip tooltip-info" data-tip="cancel delete" onClick={() => setIsDeleting(false)}>
                                <ReplyIcon />
                            </button>
                        </div>
                        :
                        <button className={deleteStyle} onClick={() => setIsDeleting(true)}>
                            <TrashIcon/>
                        </button>
                    }
                </div>
            </Dialog.Panel>
        </ThemeModal>
    )
}
