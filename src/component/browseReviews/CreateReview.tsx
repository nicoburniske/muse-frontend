import { useEffect, useMemo, useState } from 'react'
import { EntityType, useCreateReviewMutation } from 'graphql/generated/schema'
import { toast } from 'react-toastify'
import { Dialog } from '@headlessui/react'
import { themeAtom } from 'state/Atoms'
import { useAtomValue } from 'jotai'

type BoolNum = 0 | 1

export default function CreateReview() {
    const [name, setReviewName] = useState("")
    const [entityType, setEntityType] = useState<EntityType>(EntityType.Album)
    const [entityId, setEntityId] = useState("")
    const [isPublic, setIsPublic] = useState<BoolNum>(0)
    const [isModalOpen, setModalOpen] = useState(false)
    const theme = useAtomValue(themeAtom)

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
        onCompleted: () => toast.success(`Successfully created ${entityType} review.`)
    })

    const canSubmit = useMemo(() => !loading && name.length > 0 && entityId.length > 0, [loading, name, entityId])

    const onCancel = () => {
        setModalOpen(false)
        setEntityId("")
        setEntityType(EntityType.Album)
    }

    return (
        <div>
            <Dialog open={isModalOpen} onClose={() => null} data-theme={theme}>
                <div className="fixed inset-0 bg-base-100/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4 w-full z-50">
                    <Dialog.Panel className="w-1/4 max-w-4xl rounded bg-neutral border-primary">
                        <div className="flex flex-col items-center justify-between space-y-5 p-3" >
                            <Dialog.Title>
                                <h3 className="font-bold text-lg text-primary-content"> Create Review </h3>
                            </Dialog.Title>
                            <input type="text" placeholder="Review Name" className="input input-bordered w-full max-w-xs"
                                onChange={(e) => setReviewName(e.target.value as string)}
                                value={name}
                            />
                            <select
                                value={entityType}
                                onChange={(e) => setEntityType(e.target.value as EntityType)}
                                className="select select-bordered w-full max-w-xs">
                                <option disabled selected>Access Level</option>
                                {Object.values(EntityType).map((e) => <option value={e}>{e}</option>)}
                            </select>
                            <input type="text" placeholder="Spotify URL / Entity Id" className="input input-bordered w-full max-w-xs"
                                onChange={e => setEntityId(e.target.value as string)}
                                value={entityId}
                            />
                            <select
                                value={isPublic} onChange={(e) => setIsPublic(e.target.value as unknown as BoolNum)}
                                className="select select-bordered w-full max-w-xs">
                                <option disabled selected>Is Public</option>
                                <option selected value={0}>False</option>
                                <option selected value={1}>True</option>

                            </select>
                            <div className="flex flex-row items-center justify-around w-1/2" >
                                <button
                                    className="btn btn-secondary"
                                    disabled={!canSubmit}
                                    onClick={() => createReviewMutation()}
                                >
                                    create
                                </button>
                                <button className="btn btn-secondary" onClick={onCancel}> cancel </button>
                            </div>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>

            <button className="btn btn-base-300 btn-square" onClick={() => setModalOpen(true)} >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </div>
    )
}