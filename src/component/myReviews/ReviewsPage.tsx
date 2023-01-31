import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { SelectedReview, useSelectReview } from './SelectedReview'
import { EntityType, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { currentUserIdAtom, searchAtom, searchLoweredAtom } from 'state/Atoms'
import { OpenMobileMenuButton } from 'component/nav/OpenMobileMenuButton'
import { PlusIcon as PlusIconOutline } from '@heroicons/react/24/outline'
import CreateReview from 'component/createReview/CreateReview'
import toast from 'react-hot-toast'
import { MuseTransition } from 'platform/component/MuseTransition'
import { BrowseCard } from 'component/myReviews/BrowseCard'
import IconToggle from 'platform/component/IconToggle'
import {
    Bars4Icon,
    MagnifyingGlassIcon,
    Squares2X2Icon as Squares2X2IconMini,
} from '@heroicons/react/20/solid'
import { classNames } from 'util/Utils'

const tabs = [
    { name: 'Recently Viewed', href: '#', current: true },
    { name: 'Recently Added', href: '#', current: false },
    { name: 'Favorites', href: '#', current: false },
]

const viewToggleAtom = atom(false)
const useProfileAndReviews = () => {
    const { data } = useProfileAndReviewsQuery({},
        {
            onError: () => toast.error('Failed to load profile.'),
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: true
        }
    )
    // Set current user name.
    const setCurrentUserId = useSetAtom(currentUserIdAtom)
    useEffect(() => {
        const maybeUser = data?.user?.id
        if (maybeUser !== undefined) {
            setCurrentUserId(maybeUser)
        }
    }, [data])

    const search = useAtomValue(searchLoweredAtom)
    const reviews = useMemo(() =>
        data?.user?.reviews?.filter(r =>
            // Titles.
            r.reviewName.toLowerCase().includes(search) ||
            r.creator?.id.toLowerCase().includes(search) ||
            r.entity?.name.toLowerCase().includes(search) ||
            // playlist owner.
            (r.entity?.__typename === EntityType.Playlist &&
                (r.entity?.owner?.id.toLowerCase().includes(search) ||
                    r.entity.owner?.spotifyProfile?.displayName?.toLowerCase().includes(search)))
            // review owner.
            || r.creator?.spotifyProfile?.displayName?.toLowerCase().includes(search)
        ) ?? [], [search, data])

    return reviews
}

export default function ReviewsPage() {
    const reviews = useProfileAndReviews()
    const parentAtom = useMemo(() => atom(undefined), [])

    const { setSelectedReview } = useSelectReview()

    return (
        <div className="flex flex-1 flex-col bg-base-100">
            <header className="w-full">
                <div className="relative z-10 flex h-16 flex-shrink-0 shadow-sm">
                    <OpenMobileMenuButton />
                    <div className="flex flex-1 justify-between px-4 sm:px-6">
                        <SearchBar />
                        <div className="ml-2 flex flex-row items-center justify-center space-x-4 sm:ml-6 sm:space-x-6">
                            <CreateReview
                                title={'Create Review'}
                                className="flex items-center justify-center btn btn-square btn-primary"
                                parentReviewIdAtom={parentAtom}
                                icon={<PlusIconOutline className="h-6 w-6" aria-hidden="true" />}
                            />

                            {/* <button
                                type="button"
                                className="flex items-center justify-center btn btn-sm btn-square btn-primary"
                            >
                                <PlusIconOutline className="h-6 w-6" aria-hidden="true" />
                                <span className="sr-only">Add file</span>
                            </button> */}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="flex flex-1 items-stretch overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
                        <div className="flex">
                            <h1 className="flex-1 text-2xl font-bold text-base-content">Reviews</h1>
                            <IconToggle
                                toggleAtom={viewToggleAtom}
                                iconLeft={<Bars4Icon className="h-5 w-5" aria-hidden="true" />}
                                iconRight={
                                    <Squares2X2IconMini className="h-5 w-5" aria-hidden="true" />
                                }
                                className="sm:hidden"
                            />
                        </div>

                        {/* Tabs */}
                        <div className="mt-3 sm:mt-2">
                            <div className="sm:hidden">
                                <label htmlFor="tabs" className="sr-only">
                                    Select a tab
                                </label>
                                {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                                <div id="tabs" className="tabs">
                                    <a className="tab tab-bordered">Recently Viewed</a>
                                    <a className="tab tab-bordered tab-active">Recently Added</a>
                                    <a className="tab tab-bordered">Favorites</a>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <div className="flex items-center border-b border-gray-200">
                                    <div className="tabs -mb-px flex flex-1 space-x-6 xl:space-x-8" aria-label="Tabs">
                                        {
                                            tabs.map((tab) => (
                                                <a
                                                    key={tab.name}
                                                    href={tab.href}
                                                    aria-current={tab.current ? 'page' : undefined}
                                                    className={classNames(
                                                        tab.current
                                                            ? 'tab-active'
                                                            : '',
                                                        'tab tab-bordered'
                                                    )}
                                                >
                                                    {tab.name}
                                                </a>
                                            ))}
                                    </div>

                                    <IconToggle
                                        toggleAtom={viewToggleAtom}
                                        iconLeft={<Bars4Icon className="h-5 w-5" aria-hidden="true" />}
                                        iconRight={
                                            <Squares2X2IconMini className="h-5 w-5" aria-hidden="true" />
                                        }
                                        className="sm:flex"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Gallery */}
                        <section className="mt-8 pb-16" aria-labelledby="gallery-heading">
                            <h2 id="gallery-heading" className="sr-only">
                                Recently viewed
                            </h2>
                            <MuseTransition option={'BottomFlyIn'} >
                                <ul
                                    role="list"
                                    className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 xl:gap-x-8"
                                >


                                    {
                                        reviews.map(review =>
                                            <BrowseCard key={review.id} review={review} onClick={() => setSelectedReview(review)} />
                                        )
                                    }
                                </ul>
                            </MuseTransition>
                        </section>
                    </div>
                </main>

                {/* Details sidebar */}
                <SelectedReview />
            </div >
        </div >
    )
}

const SearchBar = () => {
    // TODO: Consider atomWithDebounce!
    const [search, setSearch] = useAtom(searchAtom)
    return (
        <div className="flex flex-1">
            <form className="flex w-full md:ml-0">
                <label htmlFor="desktop-search-field" className="sr-only">
                    Search reviews
                </label>
                <label htmlFor="mobile-search-field" className="sr-only">
                    Search reviews
                </label>
                <div className="flex flex-row space-x-5 justify-between items-center w-full text-base-content">
                    <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <input
                        name="mobile-search-field"
                        id="mobile-search-field"
                        className="sm:hidden h-full w-full input placeholder-base-content/50"
                        placeholder="Search"
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value as string)}
                    />
                    <input
                        name="desktop-search-field"
                        id="desktop-search-field"
                        className="hidden sm:block w-full input placeholder-base-content/50"
                        placeholder="Search"
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value as string)}
                    />
                </div>
            </form>
        </div>
    )
}