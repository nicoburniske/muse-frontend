import { useMemo, useState } from "react"
import { Dialog } from '@headlessui/react'
import { AccessLevel, useShareReviewMutation } from "graphql/generated/schema"
import { toast } from "react-toastify"

export interface ShareReviewProps {
    reviewId: string
}

const DEFAULT_ACCESS_LEVEL = AccessLevel.Viewer
// TODO: integrate markdown here!
export function ShareReview({ reviewId }: ShareReviewProps) {
    const [accessLevel, setAccessLevel] = useState(DEFAULT_ACCESS_LEVEL)
    const [username, setUsername] = useState("")
    const [shareReview,] = useShareReviewMutation({ variables: { input: { reviewId, access: accessLevel, userId: username } } })
    const [isModalOpen, setModalOpen] = useState(false)

    const onSubmit = () => {
        shareReview().then(success =>
            success.data?.shareReview ?
                setModalOpen(false) :
                toast.error("User does not exist.")
        ).catch(() => toast.error("Failed to share review."))
    }

    const onCancel = () => {
        setModalOpen(false)
        setUsername("")
        setAccessLevel(DEFAULT_ACCESS_LEVEL)
    }

    const modal = useMemo(() => {
        return (
            <Dialog open={isModalOpen} onClose={() => null}>
                <div className="fixed inset-0 bg-base-100/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4 w-full z-50">
                    <Dialog.Panel className="w-1/4 max-w-4xl rounded bg-neutral border-primary">
                        <Dialog.Title>Share Review</Dialog.Title>
                        <div className="flex flex-col items-center justify-between space-y-5 p-3" >
                            <div className="form-control w-full max-w-xs">
                                <label className="label">
                                    <span className="label-text">Who do you want to share with?</span>
                                </label>
                                <input type="text" placeholder="Spotify Username" className="input input-bordered w-full max-w-xs"
                                    onChange={(e) => setUsername(e.target.value as string)}
                                    value={username}
                                />
                            </div>
                            <select value={accessLevel}
                                onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                                className="select select-bordered w-full max-w-xs">
                                <option disabled selected>Access Level</option>
                                <option>{AccessLevel.Collaborator}</option>
                                <option>{AccessLevel.Viewer}</option>
                            </select>
                            <div className="flex flex-row items-center justify-around w-1/2" >
                                <button className="btn btn-primary space-w-5"
                                    onClick={onSubmit}
                                    disabled={username.length === 0}>
                                    Share
                                </button>
                                <button className="btn btn-neutral-content" onClick={onCancel}>
                                    cancel
                                </button>
                            </div>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>)
    }, [isModalOpen, username, accessLevel])

    return (
        <div>
            <button className="btn btn-primary btn-square" onClick={() => setModalOpen(true)} >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                </svg>
            </button>
            {modal}
        </div>
    )
}