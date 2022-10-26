import { useEffect, useMemo, useState } from 'react'
import { EntityType, useCreateReviewMutation } from 'graphql/generated/schema'
import { toast } from 'react-toastify'
import { Dialog } from '@headlessui/react'
import { refreshOverviewAtom } from 'state/Atoms'
import { useSetAtom } from 'jotai'
import { BoolNum } from 'util/Utils'
import { PlusIcon } from 'component/Icons'
import { ThemeModal } from 'component/ThemeModal'

export default function CreateReview() {
    const [name, setReviewName] = useState("")
    const [entityType, setEntityType] = useState<EntityType>(EntityType.Album)
    const [entityId, setEntityId] = useState("")
    const [isPublic, setIsPublic] = useState<BoolNum>(0)
    const [isModalOpen, setModalOpen] = useState(false)
    const updateReviews = useSetAtom(refreshOverviewAtom)

    // Converts URL to Entity id.
    const convertedEntityId = useMemo(() => {
        const start = entityId.lastIndexOf("/")
        if (start !== -1) {
            const index = entityId.lastIndexOf("?")
            const last = index === -1 ? entityId.length : index
            return entityId.substring(start + 1, last)
        } else {
            return entityId
        }
    }, [entityId])

    // Have we detected a URL? 
    const shouldUpdate = useMemo(() => convertedEntityId !== entityId, [convertedEntityId, entityId])

    // If we have detected a URL, updated EntityType and EntityId accordingly. 
    useEffect(() => {
        const eType: EntityType | null = Object.values(EntityType)
            .filter(t => entityId.includes(EntityType[t].toLowerCase()))?.[0]
        if (eType) {
            setEntityType(eType)
        }
        setEntityId(convertedEntityId)
    }, [shouldUpdate])

    const input = { entityType, entityId, isPublic: isPublic ? true : false, name }
    const [createReviewMutation, { loading }] = useCreateReviewMutation({
        variables: { input },
        onError: () => toast.error(`Failed to create ${entityType} review.`),
        onCompleted: () => {
            toast.success(`Successfully created ${entityType} review.`)
            setModalOpen(false)
            setEntityId("")
            setIsPublic(0)
            setReviewName("")
            updateReviews()
        }
    })

    const canSubmit = useMemo(() => !loading && name.length > 0 && entityId.length > 0, [loading, name, entityId])

    const onCancel = () => {
        setModalOpen(false)
        setEntityId("")
        setReviewName("")
        setEntityType(EntityType.Album)
    }

    return (
        <div>
            <ThemeModal open={isModalOpen}>
                <Dialog.Panel className="w-1/4 max-w-4xl rounded bg-neutral">
                    <div className="flex flex-col items-center justify-between space-y-5 p-3" >
                        <Dialog.Title>
                            <h3 className="font-bold text-lg text-neutral-content"> create review </h3>
                        </Dialog.Title>
                        <input type="text" placeholder="review name" className="input input-bordered w-full max-w-xs"
                            onChange={(e) => setReviewName(e.target.value as string)}
                            value={name}
                        />
                        <input type="text" placeholder="spotify url or id" className="input input-bordered w-full max-w-xs"
                            onChange={e => setEntityId(e.target.value as string)}
                            value={entityId}
                        />
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text text-neutral-content">type</span>
                            </label>
                            <select
                                value={entityType}
                                onChange={(e) => setEntityType(e.target.value as EntityType)}
                                className="select select-bordered w-full max-w-xs">
                                {Object.values(EntityType).map((e) =>
                                    <option key={e} value={e}>{e.toLowerCase()}</option>)
                                }
                            </select>
                        </div>
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text text-neutral-content">is public</span>
                            </label>
                            <select
                                value={isPublic} onChange={(e) => setIsPublic(+e.target.value as BoolNum)}
                                className="select select-bordered w-full max-w-xs">
                                <option value={0}>false</option>
                                <option value={1}>true</option>
                            </select>
                        </div>
                        <div className="flex flex-row items-center justify-around w-1/2" >
                            <button
                                className="btn btn-success disabled:btn-outline"
                                disabled={!canSubmit}
                                onClick={() => createReviewMutation()}
                            >
                                create
                            </button>
                            <button className="btn btn-error" onClick={onCancel}> cancel </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </ThemeModal>

            <button className="btn btn-base-300 btn-square" onClick={() => setModalOpen(true)} >
                <PlusIcon />
            </button>
        </div>
    )
}