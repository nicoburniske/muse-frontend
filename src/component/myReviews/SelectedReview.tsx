import { Transition } from '@headlessui/react'
import { ArrowTopRightOnSquareIcon, ChevronRightIcon, HeartIcon , PlusIcon as PlusIconMini, TrashIcon} from '@heroicons/react/20/solid'
import { ReviewDetailsFragment } from 'graphql/generated/schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Fragment, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { nonNullable , findFirstImage, classNames} from 'util/Utils'

const selectedReviewOpenAtom = atom(false)
const selectedReviewAtom = atom<ReviewDetailsFragment | null>(null)
const openSelectedReview = atom(null, (_get, set, review: ReviewDetailsFragment) => {
    set(selectedReviewOpenAtom, true)
    set(selectedReviewAtom, review)
})
const closeSelectedReviewAtom = atom(null, (_get, set) => {
    set(selectedReviewOpenAtom, false)
    setTimeout(() => set(selectedReviewAtom, null), 500)
})
export const useSelectReview = () => {
    const setSelectedReview = useSetAtom(openSelectedReview)
    const closeSelectedReview = useSetAtom(closeSelectedReviewAtom)
    return {
        setSelectedReview,
        closeSelectedReview,
    }
}


export const SelectedReview = () => {
    const { closeSelectedReview } = useSelectReview()
    // Close review details after going to new page.
    useEffect(() => () => closeSelectedReview(), [closeSelectedReview])
    const selectedReviewOpen = useAtomValue(selectedReviewOpenAtom)

    const review = useAtomValue(selectedReviewAtom)
    return (
        <Transition
            show={selectedReviewOpen}
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
        >
            <div className="fixed right-0 flex flex-col z-10 h-full">
                <div className="absolute top-1 left-0 -mr-14 p-1 z-15">
                    <button
                        type="button"
                        className="flex btn btn-primary btn-sm btn-square btn-ghost stroke-primary-content"
                        onClick={() => closeSelectedReview()}
                    >
                        <ChevronRightIcon className="h-8 w-8" aria-hidden="true" />
                        <span className="sr-only">Close sidebar</span>
                    </button>
                </div>

                <aside className="hidden w-96 overflow-y-auto bg-secondary text-secondary-content p-8 md:block">
                    {
                        review && <SidebarContent review={review} />
                    }
                </aside>
            </div>
        </Transition>
    )
}

const SidebarContent = ({ review }: { review: ReviewDetailsFragment }) => {
    const nav = useNavigate()
    const linkToReviewPage = () => nav(`/app/reviews/${review.id}`)

    const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
    const allEntities = nonNullable(review?.entity) ? [review?.entity, ...childEntities] : childEntities
    const image = findFirstImage(allEntities)
    const entityType = review?.entity?.__typename
    const info = (() => ({
        'Review Owner': review?.creator?.id,
        'Created': new Date(review?.createdAt).toLocaleDateString(),
        'Public': review?.isPublic ? 'True' : 'False',
        'Links': childEntities?.length ?? 0,

        // Include playlist owner, popularity / num followers, num tracks.
        [`${entityType} Name`]: review?.entity?.name,
    }))()

    const collaborators = review?.collaborators
        ?.map(collaborator => (
            {
                userId: collaborator?.user?.id,
                accessLevel: collaborator?.accessLevel,
                image: collaborator?.user?.spotifyProfile?.images?.at(-1),
            }))
        .filter(nonNullable) ?? []

    const textColorSecondary = 'text-secondary-content/50'

    return (
        <div className="space-y-6 pb-16">
            <div>
                <div className="group relative aspect-square block w-full overflow-hidden rounded-lg">
                    <img src={image} alt="" className="object-cover" />
                    <button
                        className="z-10 absolute top-0 right-0 btn btn-lg btn-square btn-ghost"
                        onClick={linkToReviewPage}
                    >
                        <ArrowTopRightOnSquareIcon className="h-10 w-10 stroke-accent transition-all ease-out opacity-0 group-hover:opacity-100 hover:scale-125 duration-300" />
                    </button>
                </div>
                <div className="mt-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-medium">
                            <span className="sr-only">Details for </span>
                            {review.reviewName}
                        </h2>
                        <p className={classNames('text-sm font-medium', textColorSecondary)}>{entityType}</p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-square"
                    >
                        <HeartIcon className="h-6 w-6" aria-hidden="true" />
                        <span className="sr-only">Favorite</span>
                    </button>
                </div>
            </div>
            <div>
                <h3 className="font-medium">Information</h3>
                <dl className="mt-2 divide-y divide-secondary-content/50">
                    {Object.keys(info).map((key) => (
                        <div key={key} className="flex justify-between py-3 text-sm font-medium">
                            <dt className={classNames(textColorSecondary)}>{key}</dt>
                            <dd className="whitespace-nowrap">{info[key]}</dd>
                        </div>
                    ))}
                </dl>
            </div>
            {
                /* <div>
                    <h3 className="font-medium text-gray-900">Description</h3>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm italic text-gray-500">Add a description to this image.</p>
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Add description</span>
                        </button>
                    </div>
                </div> */
            }
            <div>
                <h3 className="font-medium">Shared with</h3>
                <ul role="list" className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                    {collaborators.map(({ userId, accessLevel, image }) => (
                        <li key={userId} className="flex items-center justify-between py-3">
                            <div className="flex items-center">
                                <img src={image} alt="" className="h-8 w-8 rounded-full" />
                                <p className="ml-4 text-sm font-medium text-gray-900">{userId}</p>
                            </div>
                            <span className="badge">{accessLevel}</span>
                            <button
                                type="button"
                                className="ml-6 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Remove<span className="sr-only"> {userId}</span>
                            </button>
                        </li>
                    ))}
                    <li className="flex items-center justify-between py-2 m-auto">
                        <button
                            type="button"
                            className="group flex items-center btn btn-primary"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed">
                                <PlusIconMini className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span className="ml-4">
                                Share
                            </span>
                        </button>
                    </li>
                </ul>
            </div>
            <div className="flex justify-center">
                <button
                    type="button"
                    className="btn btn-error"
                >
                    <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="ml-4">
                        Delete
                    </span>
                </button>
            </div>
        </div >
    )
}