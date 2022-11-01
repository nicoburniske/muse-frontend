import React, { useCallback, useMemo, useState } from 'react'
import { EntityType, useCreateReviewMutation } from 'graphql/generated/schema'
import toast from 'react-hot-toast';
import { refreshOverviewAtom } from 'state/Atoms'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { BoolNum } from 'util/Utils'
import SearchSpotify, { entityIdAtom } from 'component/SearchSpotify';
import { CheckIcon, CrossIcon, PlusIcon } from 'component/Icons';
import { ThemeModal } from 'component/ThemeModal';
import { Dialog } from '@headlessui/react';
import atomWithDebounce from 'state/atomWithDebounce';

export const entityTypeAtom = atom<EntityType>(EntityType.Playlist)
const isPublicAtom = atom<BoolNum>(0)
const {
    isDebouncingAtom: isReviewNameDebouncing,
    debouncedValueAtom: debouncedReviewNameAtom,
    currentValueAtom: currentReviewNameAtom
} = atomWithDebounce("");
const createReviewModalOpenAtom = atom(false)

export default function CreateReview() {
    const [isModalOpen, setModalOpen] = useAtom(createReviewModalOpenAtom)

    return (
        <div>
            <ThemeModal open={isModalOpen} className="max-w-2xl">
                <div className="flex flex-col w-full items-center justify-between space-y-5 p-3 " >
                    <Dialog.Title>
                        <h3 className="font-bold text-lg text-base-content flex-1"> create review </h3>
                    </Dialog.Title>
                    <EditReviewName />
                    <ReviewProperties />
                    <SearchSpotify />
                    <CreateReviewButton />
                </div>
            </ThemeModal>

            <button className="btn btn-base-300 btn-square" onClick={() => setModalOpen(true)} >
                <PlusIcon />
            </button>
        </div>
    )
}

const EditReviewName = () => {
    const setReviewName = useSetAtom(debouncedReviewNameAtom)
    const reviewName = useAtomValue(currentReviewNameAtom)

    return (
        <input type="text" placeholder="review name" className="input input-bordered w-full"
            onChange={(e) => setReviewName(e.target.value as string)}
            value={reviewName}
        />
    )
}

const CreateReviewButton = () => {
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


const ReviewProperties = () => {
    const [entityType, setEntityType] = useAtom(entityTypeAtom)
    const [isPublic, setIsPublic] = useAtom(isPublicAtom)

    return (<div className="flex flex-row w-full space-x-1">
        <div className="form-control w-1/2">
            <label className="label">
                <span className="label-text text-base-content">type</span>
            </label>
            <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="select select-bordered w-full">
                {Object.values(EntityType).map((e) =>
                    <option key={e} value={e}>{e.toLowerCase()}</option>)
                }
            </select>
        </div>
        <div className="form-control w-1/2">
            <label className="label">
                <span className="label-text text-base-content">is public</span>
            </label>
            <select
                value={isPublic} onChange={(e) => setIsPublic(+e.target.value as BoolNum)}
                className="select select-bordered w-full">
                <option value={0}>false</option>
                <option value={1}>true</option>
            </select>
        </div>
    </div>)
}
