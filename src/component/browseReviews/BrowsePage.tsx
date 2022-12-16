import { EntityType, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { HeroLoading } from 'component/HeroLoading'
import { currentUserIdAtom, searchLoweredAtom } from 'state/Atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import useWindowSize from 'hook/useWindowSize'
import { atomWithStorage } from 'jotai/utils'
import { NavBar } from 'component/navBar/NavBar'
import { BrowseCard } from './BrowseCard'
import { MuseTransition } from 'component/transitions/MuseTransition'

const gridSizeAtom = atomWithStorage<number>('muse-browse-grid-cols', 3)

export default function BrowsePage() {
    const search = useAtomValue(searchLoweredAtom)
    const { data, isLoading } = useProfileAndReviewsQuery({},
        {
            onError: () => toast.error('Failed to load profile.'),
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        }
    )

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

    // Set current user name.
    const setCurrentUserId = useSetAtom(currentUserIdAtom)
    useEffect(() => {
        const maybeUser = data?.user?.id
        if (maybeUser !== undefined) {
            setCurrentUserId(maybeUser)
        }
    }, [data])

    const { isSm } = useWindowSize()
    useEffect(() => isSm ? setNumPerRow(2) : undefined, [isSm])

    const [numPerRow, setNumPerRow] = useAtom(gridSizeAtom)
    const gridStyle = useMemo(() => `grid gap-4 pt-2 px-2 bg-base-300 ${styles.get(numPerRow)}`, [numPerRow])

    if (isLoading && data === undefined) {
        return <HeroLoading />
    } else {
        return (
            <div className="flex flex-col w-full items-center h-10">
                <NavBar />
                <div className="min-h-fit w-full flex flex-row justify-center">
                    <input type="range" min={1} max={8} value={numPerRow} className="range range-primary max-w-xl " step={1}
                        onChange={e => { setNumPerRow(parseInt(e.currentTarget.value)) }} />
                </div>
                <MuseTransition option={'Grow'} >
                    <div className={gridStyle}>
                        {
                            reviews.map(review =>
                                <BrowseCard key={review.id} review={review} />
                            )
                        }
                    </div>
                </MuseTransition>
            </div>
        )
    }
}

// Would be great to have macros for tailwind.
const styles = new Map([
    [1, 'grid-cols-1'],
    [2, 'grid-cols-2'],
    [3, 'grid-cols-3'],
    [4, 'grid-cols-4'],
    [5, 'grid-cols-5'],
    [6, 'grid-cols-6'],
    [7, 'grid-cols-7'],
    [8, 'grid-cols-8'],
])