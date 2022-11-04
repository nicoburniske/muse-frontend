import { CheckIcon, CrossIcon } from "component/Icons"
import { entityIdAtom } from "component/searchSpotify/SearchSpotify"
import { EntityType, useCreateReviewMutation, useDetailedReviewQuery } from "graphql/generated/schema"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useMemo } from "react"
import { refreshOverviewAtom } from "state/Atoms"
import { createReviewModalOpenAtom, debouncedReviewNameAtom, entityTypeAtom, isPublicAtom, parentReviewIdAtom } from "./createReviewAtoms"
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query'

export const CreateReviewButtons = () => {
    const [entityType, setEntityType] = useAtom(entityTypeAtom)
    const [isPublic, setIsPublic] = useAtom(isPublicAtom)
    const [entityId, setEntityId] = useAtom(entityIdAtom)
    const parentReviewId = useAtomValue(parentReviewIdAtom)
    const queryClient = useQueryClient()

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
                setEntityId(undefined)
                setIsPublic(0)
                setReviewName("")
                updateReviews()
                if (parentReviewId !== undefined) {
                    queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId: parentReviewId }))
                }
            }
        })

    const parentLink = parentReviewId === undefined ? undefined : { parentReviewId }
    const entity = entityId !== undefined ? { entityId, entityType } : undefined
    const input = { isPublic: isPublic ? true : false, name, entity, link: parentLink }

    const createReviewMutation = () => mutate({ input });

    const canSubmit = useMemo(() => !isLoading && name.length > 0, [isLoading, name])

    const onCancel = () => {
        setModalOpen(false)
        setEntityId(undefined)
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
