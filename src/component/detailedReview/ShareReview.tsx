import { useMemo, useState } from "react"
import { Dialog } from '@headlessui/react'
import { AccessLevel, useShareReviewMutation } from "graphql/generated/schema"
import { toast } from "react-toastify"
import { ThemeModal } from "component/ThemeModal"
import { ShareIcon } from "component/Icons"

export interface ShareReviewProps {
    reviewId: string
}

const DEFAULT_ACCESS_LEVEL = AccessLevel.Viewer
// TODO: integrate markdown here!
export function ShareReview({ reviewId }: ShareReviewProps) {
    const [accessLevel, setAccessLevel] = useState(DEFAULT_ACCESS_LEVEL)
    const [username, setUsername] = useState("")
    const [isModalOpen, setModalOpen] = useState(false)

    const [shareReview,] = useShareReviewMutation({ variables: { input: { reviewId, access: accessLevel, userId: username } } })

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

    return (
        <div>
            <button className="btn btn-primary btn-md" onClick={() => setModalOpen(true)} >
                <ShareIcon />
            </button>

            <ThemeModal open={isModalOpen} >
                <Dialog.Panel className="w-1/4 max-w-4xl rounded bg-neutral border-primary">
                    <div className="flex flex-col items-center justify-between space-y-5 p-3 " >
                        <Dialog.Title>
                            <h3 className="font-bold text-lg text-neutral-content"> share review </h3>
                        </Dialog.Title>
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text text-neutral-content">who do you want to share with?</span>
                            </label>
                            <input type="text" placeholder="spotify username" className="input input-bordered w-full max-w-xs"
                                onChange={(e) => setUsername(e.target.value as string)}
                                value={username}
                            />
                        </div>
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text text-neutral-content">access level</span>
                            </label>
                            <select value={accessLevel}
                                onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                                className="select select-bordered w-full max-w-xs">
                                {Object.values(AccessLevel).map((a) =>
                                    <option key={a} value={a}>{a.toLowerCase()}</option>)
                                }
                            </select>
                        </div>
                        <div className="flex flex-row items-center justify-around w-1/2" >
                            <button className="btn btn-success disabled:btn-outline"
                                onClick={onSubmit}
                                disabled={username.length === 0}>
                                Share
                            </button>
                            <button className="btn btn-error" onClick={onCancel}>
                                cancel
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </ThemeModal>
        </div>
    )
}