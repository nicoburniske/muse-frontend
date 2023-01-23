import { useQueryClient } from '@tanstack/react-query'
import { ArrowTopRightIcon, HazardIcon, ReplyIcon, TrashIcon } from 'component/Icons'
import { useDeleteReviewLinkMutation, useDetailedReviewQuery } from 'graphql/generated/schema'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { HeaderData, ReviewOverview } from './Helpers'
import { useDrag, useDrop } from 'react-dnd'
import { useSwapReviews } from './TableAtoms'

/**
 * REVIEW HEADER
 */
export type ReviewGroupHeaderProps = {
    parentReviewId: string
    onClick: () => void
    entity: HeaderData
} & ReviewOverview

export const ReviewGroupHeader = ({ reviewId, parentReviewId, reviewName, entity, onClick }: ReviewGroupHeaderProps) => {
    const { name: entityName, __typename: entityType } = entity

    const isChild = reviewId !== parentReviewId
    const [isDeleting, setIsDeletingRaw] = useState(false)
    const nav = useNavigate()
    const queryClient = useQueryClient()
    const linkToReviewPage = () => nav(`/reviews/${reviewId}`)
    const { mutateAsync: deleteReviewLink } = useDeleteReviewLinkMutation({
        onError: () => toast.error('Failed to delete review link'),
    })

    const handleDeleteReviewLink = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation()
        await deleteReviewLink({ input: { childReviewId: reviewId, parentReviewId } })
        queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId: parentReviewId }))
        setIsDeletingRaw(false)
    }

    const setIsDeleting = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => (isDeleting: boolean) => {
        e.stopPropagation()
        setIsDeletingRaw(isDeleting)
    }

    const isPlaylist = entityType === 'Playlist'

    const gridStyle = isChild ?
        isPlaylist ? 'grid-cols-5' : 'grid-cols-5' :
        isPlaylist ? 'grid-cols-3' : 'grid-cols-4'
    const nameStyle = isChild ? 'col-span-2' : 'col-span-1'

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'ReviewId',
        item: { reviewId },
        canDrag: isChild,
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [isChild, reviewId])

    const swapReviews = useSwapReviews(reviewId)
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'ReviewId',
        canDrop: (item: { reviewId: string }) => isChild && item.reviewId !== reviewId,
        drop: (item: { reviewId: string }) => {
            // TODO: Persist this into backend.
            swapReviews(item.reviewId)
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), [isChild, reviewId])


    const dragClass = isDragging ? 'opacity-20' : isOver ? 'card-bordered border-primary' : ''

    const albumImage = entity.images.at(-1)

    return (
        <div className={`card py-0 w-full bg-secondary ${dragClass}`}
            ref={(el) => { drop(el); drag(el) }}
            onClick={onClick}>
            <div className={`grid ${gridStyle} card-body p-1 justify-around w-full items-center`}>
                <div className={`${nameStyle}`}>
                    <h2 className={'text-md md:text-xl text-secondary-content truncate'}>{reviewName}</h2>
                </div>
                <div className={`${nameStyle} flex flex-row justify-start items-center m-auto`}>
                    <div className="badge badge-accent text-accent-content text-center">{entityType}</div>
                    <div className="divider divider-horizontal m-0" />
                    {
                        isPlaylist ? null : (
                            <div className="avatar">
                                <div className="w-12 rounded">
                                    <img src={albumImage} />
                                </div>
                            </div>
                        )
                    }
                    <div className="badge badge-primary text-primary-content text-center truncate">{entityName}</div>
                </div>
                {isChild ?
                    <div className="justify-self-center flex flex-row md:space-x-5">
                        <button className="btn btn-sm btn-square btn-secondary" onClick={() => linkToReviewPage()} >
                            <ArrowTopRightIcon />
                        </button>
                        {isDeleting ?
                            <div className="btn-group justify-center" >
                                <button className="btn btn-sm btn-error tooltip tooltip-error tooltip-left" data-tip="remove review link" onClick={e => handleDeleteReviewLink(e)}>
                                    <HazardIcon />
                                </button>
                                <button className="btn btn-sm btn-info" onClick={(e) => setIsDeleting(e)(false)}>
                                    <ReplyIcon />
                                </button>
                            </div>
                            :
                            <button className="btn btn-sm btn-square btn-secondary" onClick={(e) => setIsDeleting(e)(true)}>
                                <TrashIcon />
                            </button>
                        }
                    </div>
                    : null
                }
            </div>
        </div>
    )
}
