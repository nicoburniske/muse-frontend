import { Dialog } from '@headlessui/react'
import { CheckIcon, CrossIcon, EllipsisIcon, HazardIcon, ReplyIcon, TrashIcon } from 'component/Icons'
import { ThemeModal } from 'platform/component/ThemeModal'
import { useUpdateReviewMutation, useDeleteReviewMutation } from 'graphql/generated/schema'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { atom, PrimitiveAtom, Provider, useAtom, useAtomValue, WritableAtom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import ReactDOM from 'react-dom'

type FormValues = {
    isPublic: boolean
    name: string
}

const nameSchema = z.string().min(1).max(100)

const reviewIdAtom = atom('')
const defaultFormValuesAtom = atom<FormValues>({ isPublic: false, name: '' })
const formValuesAtom = atom<FormValues>({ isPublic: false, name: '' })

const publicAtom = focusAtom(formValuesAtom, (optic) => optic.prop('isPublic'))
const nameAtom = focusAtom(formValuesAtom, (optic) => optic.prop('name'))

const errorsAtom = atom(get => {
    const name = get(nameAtom)
    const result = nameSchema.safeParse(name)
    return result.success ? [] : result.error.issues
})

const isValidAtom = atom((get) => {
    const defaultValues = get(defaultFormValuesAtom)
    const currentValues = get(formValuesAtom)

    const errors = get(errorsAtom)

    return errors.length === 0 && (
        defaultValues.isPublic !== currentValues.isPublic ||
        defaultValues.name !== currentValues.name)
})

const booleanToNumAtom = (value: PrimitiveAtom<boolean>): WritableAtom<number, number, void> => {
    return atom(get => get(value) ? 1 : 0, (_get, set, newValue: number) => set(value, newValue === 1))
}

const publicFormAtom = booleanToNumAtom(publicAtom)

const EditReviewFormButtons = ({ onCancel, onSuccess }:
    {
        onCancel: () => void
        onSuccess: () => void
    }) => {

    const reviewId = useAtomValue(reviewIdAtom)
    const { mutate, isLoading } = useUpdateReviewMutation({
        onError: () => toast.error('Failed to update review.'),
        onSuccess: () => {
            toast.success('Updated review.')
            onSuccess()
        }
    })
    const formValues = useAtomValue(formValuesAtom)
    const input = { reviewId, ...formValues }
    const updateReview = () => mutate({ input })

    const disabled = !useAtomValue(isValidAtom) || isLoading

    return (
        < div className="flex flex-row items-center justify-around w-full" >
            <button className="btn btn-success" disabled={disabled} onClick={updateReview}> <CheckIcon /> </button>
            <button className="btn btn-info" onClick={onCancel}> <CrossIcon /> </button>
        </div >
    )
}

const EditReviewForm = () => {
    const [reviewName, setReviewName] = useAtom(nameAtom)
    const [isPublic, setIsPublic] = useAtom(publicFormAtom)

    return (
        <div>
            <div className="w-full">
                <label className="label">
                    <span className="label-text"> Review Name </span>
                </label>
                <input type="text" placeholder="Review Name" className="input input-bordered w-full"
                    onChange={(e) => setReviewName(e.target.value as string)}
                    value={reviewName}
                />
            </div>
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Is Public</span>
                </label>
                <select
                    value={isPublic}
                    onChange={(e) => setIsPublic(+e.target.value)}
                    className="select select-bordered w-full">
                    <option value={0}>false</option>
                    <option value={1}>true</option>
                </select>
            </div>
        </div>
    )
}


type EditReviewButtonProps = {
    reviewId: string
    reviewName: string
    isPublic: boolean
    onSuccess: () => void
}

export const EditReviewButton = (props: EditReviewButtonProps) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            {
                ReactDOM.createPortal(
                    <EditReview
                        {...props}
                        isOpen={isOpen}
                        onCancel={() => setIsOpen(false)}
                    />,
                    document.body
                )
            }
            <button className="btn btn-primary btn-sm lg:btn-md" onClick={() => setIsOpen(true)}>
                <EllipsisIcon />
            </button>
        </>
    )
}

type EditReviewProps = {
    isOpen: boolean
    reviewId: string
    reviewName: string
    isPublic: boolean
    onSuccess: () => void
    onCancel: () => void
}

const EditReview = ({ isOpen, reviewId, reviewName, isPublic, onSuccess, onCancel }: EditReviewProps) => {
    // Deleting
    const [isDeleting, setIsDeleting] = useState(false)
    const nav = useNavigate()
    const { mutate: deleteReviewMutation } = useDeleteReviewMutation({
        onError: () => toast.error('Failed to delete review.'),
        onSuccess: () => {
            nav('/app/reviews')
            toast.success('Successfully deleted review.')
        }
    })

    const deleteReview = () => deleteReviewMutation({ input: { id: reviewId } })

    const defaultValues = useMemo(() => ({ name: reviewName, isPublic }), [reviewName, isPublic])

    return (
        <ThemeModal open={isOpen} className="max-w-md">
            <div className="flex flex-col items-center justify-between space-y-5 p-3 relative" >
                <Dialog.Title className="font-bold text-lg">
                    Edit Review
                </Dialog.Title>

                <Provider initialValues={[
                    [reviewIdAtom, reviewId],
                    [defaultFormValuesAtom, defaultValues],
                    [formValuesAtom, defaultValues]
                ]}>
                    <div className="w-[75%] flex flex-col space-y-2">
                        <EditReviewForm />
                        <EditReviewFormButtons
                            onSuccess={onSuccess}
                            onCancel={onCancel}
                        />
                    </div>
                </Provider>
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
                    <button className='btn btn-error absolute top-0 right-5' onClick={() => setIsDeleting(true)}>
                        <TrashIcon />
                    </button>
                }
            </div>
        </ThemeModal>
    )
}
