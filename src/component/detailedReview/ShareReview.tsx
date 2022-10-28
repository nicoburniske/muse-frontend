import { useMemo, useState } from "react"
import { Dialog } from '@headlessui/react'
import { AccessLevel, CollaboratorFragment, useShareReviewMutation } from "graphql/generated/schema"
import { toast } from "react-toastify"
import { ThemeModal } from "component/ThemeModal"
import { CheckIcon, CrossIcon, ReplyIcon, ShareIcon } from "component/Icons"
import useStateWithSyncedDefault from "hook/useStateWithSyncedDefault"

export interface ShareReviewProps {
    reviewId: string
    collaborators: CollaboratorFragment[]
    onChange: () => void
}

const DEFAULT_ACCESS_LEVEL = AccessLevel.Viewer
// TODO: integrate markdown here!
export function ShareReview({ reviewId, onChange, collaborators: collabProp }: ShareReviewProps) {
    const [accessLevel, setAccessLevel] = useState(DEFAULT_ACCESS_LEVEL)
    const [username, setUsername] = useState("")
    const [isModalOpen, setModalOpen] = useState(false)
    const [collaborators, setCollaborators, resetCollaborators] = useStateWithSyncedDefault(collabProp)

    const [shareReview, { loading }] = useShareReviewMutation(
        {
            onError: () => toast.error("Failed to update review sharing."),
            onCompleted: () => onChange()
        }
    )

    const onSubmit = async () => {
        const addCollaborator = (() => {
            if (username.length !== 0) {
                const variables = { input: { reviewId, accessLevel, userId: username } }
                return shareReview({ variables })
            } else {
                return Promise.resolve(null)
            }
        })()

        // Delete all removed collaborators.
        const removeCollaborators = collabProp
            .filter(c => !collaborators.find(c2 => c2.user.id === c.user.id))
            .map(c => ({ input: { reviewId, userId: c.user.id } }))
            .map(variables => shareReview({ variables }))

        try {
            await Promise.all([addCollaborator, ...removeCollaborators])
        } catch (e) {

        }
        onCancel()
    }

    const onCancel = () => {
        setModalOpen(false)
        setUsername("")
        setAccessLevel(DEFAULT_ACCESS_LEVEL)
        resetCollaborators()
    }

    const disabledUndo = useMemo(() => collaborators.length === collabProp.length, [collaborators, collabProp])

    const disabled = useMemo(() =>
        loading || username.length === 0 && disabledUndo
        , [username, disabledUndo])

    return (
        <div>
            <button className="btn btn-primary btn-xs lg:btn-md" onClick={() => setModalOpen(true)} >
                <ShareIcon />
            </button>

            <ThemeModal open={isModalOpen} className="max-w-md">
                <div className="flex flex-col items-center justify-between space-y-5 p-3">
                    <Dialog.Title>
                        <h3 className="font-bold text-lg text-neutral-content"> share review </h3>
                    </Dialog.Title>
                    <div className="form-control w-full items-center">
                        <label className="label">
                            <span className="label-text text-neutral-content">who do you want to share with?</span>
                        </label>
                        <input type="text" placeholder="spotify username" className="input input-bordered w-full"
                            onChange={(e) => setUsername(e.target.value as string)}
                            value={username}
                        />
                    </div>
                    <div className="form-control w-full items-center">
                        <label className="label">
                            <span className="label-text text-neutral-content">access level</span>
                        </label>
                        <select value={accessLevel}
                            onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                            className="select select-bordered w-full">
                            {Object.values(AccessLevel).map((a) =>
                                <option key={a} value={a}>{a.toLowerCase()}</option>)
                            }
                        </select>
                    </div>
                    {
                        collabProp.length > 0 &&
                        <div className="form-control w-full items-center">
                            <label className="label">
                                <span className="label-text text-neutral-content"> collaborators </span>
                            </label>
                            <ul className="menu bg-base-100 w-full">
                                {collaborators.map((c) =>
                                    <li key={c.user.id}>
                                        <div className="flex flex-row justify-between">
                                            <p>{c.user.id}</p>
                                            <button
                                                className="btn btn-error"
                                                onClick={() => setCollaborators(collaborators.filter((c2) => c2.user.id !== c.user.id))}
                                            >
                                                <CrossIcon />
                                            </button>
                                        </div>
                                    </li>
                                )
                                }
                            </ul>
                        </div>
                    }
                    <div className="flex flex-row items-center justify-around w-full lg:w-1/2" >
                        <button className="btn btn-success disabled:btn-outline"
                            onClick={onSubmit}
                            disabled={disabled}>
                            <CheckIcon />
                        </button>
                        <button className="btn btn-info" disabled={disabledUndo} onClick={() => setCollaborators(collabProp)}>
                            <ReplyIcon />
                        </button>
                        <button className="btn btn-info" onClick={onCancel}>
                            <CrossIcon />
                        </button>
                    </div>
                </div>
            </ThemeModal>
        </div>
    )
}