import { useQueryClient } from '@tanstack/react-query'
import { ArrowTopRightIcon, HazardIcon, ReplyIcon, TrashIcon } from 'component/Icons'
import { EntityType, useDeleteReviewLinkMutation, useDetailedReviewQuery } from 'graphql/generated/schema'
import { memo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'

/**
 * REVIEW HEADER
 */
interface ReviewGroupHeaderProps {
    reviewId: string
    parentReviewId: string
    name: string
    entityName: string
    entityType: EntityType
    handleClick: (reviewId: string) => void
}

export const MemoizedGroupHeader = memo((props: ReviewGroupHeaderProps) => (<ReviewGroupHeader {...props} />),
    (prevProps, nextProps) =>
        prevProps.reviewId === nextProps.reviewId &&
        prevProps.parentReviewId === nextProps.parentReviewId &&
        prevProps.handleClick === nextProps.handleClick
)

const ReviewGroupHeader = ({ reviewId, parentReviewId, name, entityName, entityType, handleClick }: ReviewGroupHeaderProps) => {
    const isChild = reviewId !== parentReviewId
    const [isDeleting, setIsDeletingRaw] = useState(false)
    const nav = useNavigate()
    const queryClient = useQueryClient()
    const linkToReviewPage = () => nav(`/reviews/${reviewId}`)
    const { mutateAsync: deleteReviewLink } = useDeleteReviewLinkMutation({
        onError: () => toast.error('Failed to delete review link'),
    })

    const handleDeleteReviewLink = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        await deleteReviewLink({ input: { childReviewId: reviewId, parentReviewId } })
        e.stopPropagation()
        e.preventDefault()
        queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId: parentReviewId }))
        setIsDeletingRaw(false)
    }

    const setIsDeleting = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => (isDeleting: boolean) => {
        setIsDeletingRaw(isDeleting)
        e.stopPropagation()
    }

    const gridStyle = isChild ? 'grid-cols-5' : 'grid-cols-2'
    const nameStyle = isChild ? 'col-span-2' : 'col-span-1'

    const onClick = () => handleClick(reviewId)

    return (
        <div className='card py-0 w-full bg-secondary'
            onClick={onClick}>
            <div className={`grid ${gridStyle} card-body p-1 justify-around w-full items-center`}>
                <div className={`${nameStyle}`}>
                    <h2 className={'text-md md:text-xl text-secondary-content truncate'}>{name}</h2>
                </div>
                <div className={`${nameStyle} flex flex-row justify-start w-full m-auto`}>
                    <div className="badge badge-accent text-accent-content text-center">{entityType}</div>
                    <div className="divider divider-horizontal"/> 
                    <div className="badge badge-primary text-primary-content text-center truncate">{entityName}</div>
                </div>
                {isChild ?
                    <div className="justify-self-center	btn-group flex flex-row md:space-x-5">
                        <button className="btn btn-sm btn-square btn-ghost" onClick={() => linkToReviewPage()} >
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
                            <button className="btn btn-sm btn-square btn-ghost" onClick={(e) => setIsDeleting(e)(true)}>
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
