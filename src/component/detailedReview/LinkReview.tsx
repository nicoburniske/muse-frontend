import { useDetailedReviewQuery, useLinkReviewsMutation, useProfileAndReviewsQuery } from "graphql/generated/schema"
import { useState } from "react"
import { CheckIcon, CrossIcon, LinkIcon } from "component/Icons"
import { Virtuoso } from "react-virtuoso"
import { getReviewOverviewImage } from "util/Utils"
import { useQueryClient } from "@tanstack/react-query"
import toast from 'react-hot-toast'
import { Dialog } from "@headlessui/react"
import { ThemeModal } from "component/ThemeModal"

const searchTextResult = "select-none truncate text-sm lg:text-base p-0.5"

export const LinkReviewButton = ({ reviewId, alreadyLinkedIds }: { reviewId: string, alreadyLinkedIds: string[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const queryClient = useQueryClient()
    const { data, isLoading } = useProfileAndReviewsQuery({}, { onError: () => toast.error("Failed to load user reviews.") })
    const { mutateAsync: createReviewLink } = useLinkReviewsMutation({ onError: () => toast.error("Failed to link review.") })
    // We don't want to include any unlinkable reviews.
    const reviews = (data?.user?.reviews ?? [])
        .filter(r => !alreadyLinkedIds.includes(r.id))
        .filter(r => r.id !== reviewId)
    const [selectedReview, setSelectedReview] = useState<undefined | string>(undefined)

    const handleLinkReview = async () => {
        if (selectedReview) {
            await createReviewLink({ input: { parentReviewId: reviewId, childReviewId: selectedReview } })
            queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId }))
            onCancel()
        }
    }

    const canSubmit = selectedReview !== undefined

    const onCancel = () => {
        setIsModalOpen(false)
        setSelectedReview(undefined)
    }

    return (
        <div>
            <button className="btn btn-secondary btn-xs lg:btn-md" onClick={() => setIsModalOpen(true)} >
                <LinkIcon />
            </button>
            <ThemeModal open={isModalOpen} className="max-w-2xl h-[80%]">
                <div className="flex flex-col w-full h-full items-center justify-between space-y-5 p-3 " >
                    <Dialog.Title>
                        <h3 className="font-bold text-lg text-base-content flex-1"> link review </h3>
                    </Dialog.Title>

                    <Virtuoso
                        className="w-full overflow-y-auto space-y-1"
                        data={reviews}
                        overscan={200}
                        itemContent={(i, review) => {
                            const image = getReviewOverviewImage(review)
                            const [bgStyle, textStyle, hoverStyle] =
                                review.id === selectedReview ? ["bg-success", "text-success-content", ''] : ["bg-base-200", "text-base-content", 'hover:bg-base-focus']
                            return (
                                <div
                                    className={`w-full max-w-full h-24 card card-body flex flex-row justify-around items-center p-0.5 m-1 ${bgStyle} ${hoverStyle}`}
                                    key={i}
                                    onClick={() => setSelectedReview(review.id)}>
                                    <div className="avatar flex-none">
                                        <div className="w-8 md:w-16 rounded">
                                            <img src={image} />
                                        </div>
                                    </div>
                                    <div className="grow grid grid-cols-3 max-w-[75%] text-center">
                                        <div className={`${searchTextResult} ${textStyle}`}> {review.reviewName} </div>
                                        <div className={`${searchTextResult} ${textStyle}`}> {review.entity?.name} </div>
                                        <div className={`${searchTextResult} ${textStyle}`}> {review.creator.id} </div>
                                    </div>
                                </div>)
                        }} />
                    <div className="flex flex-row items-center justify-around w-full m-0" >
                        <button
                            className={`btn btn-success disabled:btn-outline ${isLoading ? 'loading' : ''}`}
                            disabled={!canSubmit}
                            onClick={handleLinkReview}
                        >
                            <CheckIcon />
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