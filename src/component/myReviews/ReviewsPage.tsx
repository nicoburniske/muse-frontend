import { atom, useAtom, useAtomValue } from 'jotai'
import { SelectedReview, useSelectReview } from './SelectedReview'
import { ReviewDetailsFragment, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { searchLoweredAtom, useSearchAtom } from 'state/Atoms'
import { OpenMobileMenuButton } from 'component/nav/OpenMobileMenuButton'
import toast from 'react-hot-toast'
import { MuseTransition } from 'platform/component/MuseTransition'
import { BrowseCard } from 'component/myReviews/BrowseCard'
import IconToggle from 'platform/component/IconToggle'
import { Bars3BottomLeftIcon, Bars4Icon, Squares2X2Icon as Squares2X2IconMini } from '@heroicons/react/20/solid'
import { cn } from 'util/Utils'
import { useViewHistory } from 'state/ViewHistory'
import { useCurrentUserId } from 'state/CurrentUser'
import { SearchInputKbdSuggestion } from 'platform/component/SearchInputKbdSuggestion'

const viewToggleAtom = atom(false)

const ReviewSorts = {
   'recently viewed': 'Recently Viewed',
   owned: 'Your Reviews',
   shared: 'Shared With You',
} as const

type ReviewSort = keyof typeof ReviewSorts

const sortOrderAtom = atom<ReviewSort>('owned')

const SortTabs = ({ className }: { className?: string }) => {
   const [sortOrder, setSortOrder] = useAtom(sortOrderAtom)

   return (
      <div id='tabs' className={cn('tabs', className)}>
         {Object.entries(ReviewSorts).map(([key, value]) => (
            <a
               key={key}
               className={cn('tab tab-bordered', sortOrder === key ? 'tab-active' : '')}
               onClick={() => setSortOrder(key as ReviewSort)}
            >
               {value}
            </a>
         ))}
      </div>
   )
}

export default function ReviewsPage() {
   const reviews = useProfileAndReviews()

   const { setSelectedReview } = useSelectReview()

   return (
      <div className='flex flex-1 flex-col bg-base-100'>
         <header className='w-full'>
            <div className='relative z-10 flex h-16 flex-shrink-0 shadow-sm'>
               <OpenMobileMenuButton>
                  {onClick => (
                     <button type='button' className='btn btn-primary m-auto h-full px-4 md:hidden' onClick={onClick}>
                        <span className='sr-only'>Open sidebar</span>
                        <Bars3BottomLeftIcon className='h-6 w-6' aria-hidden='true' />
                     </button>
                  )}
               </OpenMobileMenuButton>
               <div className='align-center flex flex-1 justify-center py-2 px-4'>
                  <SearchBar />
               </div>
            </div>
         </header>

         {/* Main content */}
         <div className='flex flex-1 items-stretch overflow-hidden'>
            <main className='muse-scrollbar flex-1 overflow-y-auto'>
               <div className='mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8'>
                  <div className='flex'>
                     <h1 className='flex-1 text-2xl font-bold text-base-content'>Reviews</h1>
                     <IconToggle
                        toggleAtom={viewToggleAtom}
                        iconLeft={<Bars4Icon className='h-5 w-5' aria-hidden='true' />}
                        iconRight={<Squares2X2IconMini className='h-5 w-5' aria-hidden='true' />}
                        className='sm:hidden'
                     />
                  </div>

                  {/* Tabs */}
                  <div className='mt-3 sm:mt-2'>
                     <div className='sm:hidden'>
                        <label htmlFor='tabs' className='sr-only'>
                           Select a tab
                        </label>
                        <SortTabs />
                     </div>
                     <div className='hidden sm:block'>
                        <div className='flex items-center border-b border-gray-200'>
                           <SortTabs className='-mb-px flex flex-1 space-x-6 xl:space-x-8' />

                           <IconToggle
                              toggleAtom={viewToggleAtom}
                              iconLeft={<Bars4Icon className='h-5 w-5' aria-hidden='true' />}
                              iconRight={<Squares2X2IconMini className='h-5 w-5' aria-hidden='true' />}
                              className='sm:flex'
                           />
                        </div>
                     </div>
                  </div>

                  {/* Gallery */}
                  <section className='mt-8 pb-16' aria-labelledby='gallery-heading'>
                     <h2 id='gallery-heading' className='sr-only'>
                        Recently viewed
                     </h2>
                     <MuseTransition option={'Simple'} duration='duration-300'>
                        <ul
                           role='list'
                           className='grid grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-8'
                        >
                           {reviews.map(review => (
                              <BrowseCard
                                 key={review.id}
                                 review={review}
                                 onClick={() => setSelectedReview(review.id)}
                              />
                           ))}
                        </ul>
                     </MuseTransition>
                  </section>
               </div>
            </main>
         </div>
         <SelectedReview />
      </div>
   )
}

const SearchBar = () => {
   // TODO: Fix centering!
   const [search, setSearch] = useSearchAtom()

   return (
      <div className='max-w-3xl flex-1'>
         <SearchInputKbdSuggestion
            screenReaderLabel='Search Reviews'
            placeholder={'Search Reviews'}
            search={search}
            setSearch={setSearch as (s: string) => void}
         />
      </div>
   )
}

const useProfileAndReviews = () => {
   // TODO: Have to account for viewed reviews.
   const { data } = useProfileAndReviewsQuery(
      {},
      {
         onError: () => toast.error('Failed to load profile.'),
         staleTime: 30 * 1000,
      }
   )

   const search = useAtomValue(searchLoweredAtom)
   const reviews = data?.user.reviews ?? []
   const searchedReviews = searchReviews(reviews, search)

   const sortOrder = useAtomValue(sortOrderAtom)
   const currentUserId = useCurrentUserId()
   const reviewIdHistory = useViewHistory()

   return transformFunction(searchedReviews, sortOrder, currentUserId, reviewIdHistory)
}

const searchReviews = (reviews: ReviewDetailsFragment[], search: string) => {
   return reviews.filter(
      r =>
         // Titles.
         r.reviewName.toLowerCase().includes(search) ||
         r.creator?.id.toLowerCase().includes(search) ||
         r.entity?.name.toLowerCase().includes(search) ||
         // playlist owner.
         (r.entity?.__typename === 'Playlist' &&
            (r.entity?.owner?.id.toLowerCase().includes(search) ||
               r.entity.owner?.spotifyProfile?.displayName?.toLowerCase().includes(search))) ||
         // review owner.
         r.creator?.spotifyProfile?.displayName?.toLowerCase().includes(search)
   )
}

const transformFunction = (
   reviews: ReviewDetailsFragment[],
   sortOrder: ReviewSort,
   currentUserId: string,
   reviewIdHistory: string[]
): ReviewDetailsFragment[] => {
   if (sortOrder === 'shared') {
      return reviews
         .filter(r => r?.collaborators?.some(c => c.user.id === currentUserId) || false)
         .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   } else if (sortOrder === 'owned') {
      return reviews
         .filter(r => r.creator.id === currentUserId)
         .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   } else if (sortOrder === 'recently viewed') {
      return reviews
         .filter(r => reviewIdHistory.includes(r.id))
         .sort((a, b) => {
            const aView = reviewIdHistory.indexOf(a.id)
            const bView = reviewIdHistory.indexOf(b.id)
            return aView - bView
         })
   }
   // Typescript is dumb.
   return reviews
}
