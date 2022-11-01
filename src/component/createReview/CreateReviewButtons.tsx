import { CheckIcon, CrossIcon } from "component/Icons"
import { entityIdAtom } from "component/SearchSpotify"
import { EntityType, useCreateReviewMutation } from "graphql/generated/schema"
import { useAtom, useSetAtom } from "jotai"
import { useMemo } from "react"
import { refreshOverviewAtom } from "state/Atoms"
import { createReviewModalOpenAtom, debouncedReviewNameAtom, entityTypeAtom, isPublicAtom } from "./createReviewAtoms"
import toast from 'react-hot-toast';

export const CreateReviewButtons = () => {
    const [entityType, setEntityType] = useAtom(entityTypeAtom)
    const [isPublic, setIsPublic] = useAtom(isPublicAtom)
    const [entityId, setEntityId] = useAtom(entityIdAtom)

    const [name, setReviewName] = useAtom(debouncedReviewNameAtom)
    const setModalOpen = useSetAtom(createReviewModalOpenAtom)

    // Invalidate cache.
    const updateReviews = useSetAtom(refreshOverviewAtom)

    const { isLoading, mutate } = useCreateReviewMutation(
        {
            onError: () => toast.error(`Failed to create ${entityType} review.`),
            onSuccess: () => {
                toast.success(`Successfully created ${entityType} review.`)
                setModalOpen(false)
                setEntityId("")
                setIsPublic(0)
                setReviewName("")
                updateReviews()
            }
        })

    const input = { isPublic: isPublic ? true : false, name, entity: { entityType, entityId } }
    const createReviewMutation = () => mutate({ input });

    const canSubmit = useMemo(() => !isLoading && name.length > 0 && entityId.length > 0, [isLoading, name, entityId])

    const onCancel = () => {
        setModalOpen(false)
        setEntityId("")
        setReviewName("")
        setEntityType(EntityType.Album)
    }

    return (
        <div className="flex flex-row items-center justify-around w-full m-0" >
            <button
                className="btn btn-success disabled:btn-outline"
                disabled={!canSubmit}
                onClick={() => createReviewMutation()}
            >
                <CheckIcon />
            </button>
            <button className="btn btn-info" onClick={onCancel}>
                <CrossIcon />
            </button>
        </div>
    )
}
