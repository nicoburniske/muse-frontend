import {
   ChevronRightIcon,
   CodeBracketIcon,
   MagnifyingGlassCircleIcon,
   MusicalNoteIcon,
   QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { atom, useAtom, useAtomValue } from 'jotai'
import toast from 'react-hot-toast'

import { MuseAvatar } from '@/component/avatar/MuseAvatar'
import { CommandButton, Pages, useOpenCommandPage } from '@/component/command/Command'
import { MobileNavigation } from '@/component/container/MobileMenu'
import { useNavAction } from '@/component/container/NavConstants'
import { useSelectReview } from '@/component/SelectedReview'
import { ProfileAndReviewsQuery, ReviewDetailsFragment, useProfileAndReviewsQuery } from '@/graphql/generated/schema'
import { Tabs, TabsList, TabsTrigger } from '@/lib/component/Tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/lib/component/Tooltip'
import { BrowseCard } from '@/pages/myReviews/BrowseCard'
import { searchLoweredAtom } from '@/state/Atoms'
import { useCurrentUserId } from '@/state/CurrentUser'
import { useViewHistory } from '@/state/ViewHistory'
import { cn } from '@/util/Utils'

import { useOpenReviewsTour, useOpenReviewsTourFirstTime } from './ReviewsTour'

export default function ReviewsPage() {
   const needsReviews = useNeedsReviews()
   const reviews = useProfileAndReviews()

   const { setSelectedReview } = useSelectReview()

   useOpenReviewsTourFirstTime(!needsReviews)
   const openTour = useOpenReviewsTour()

   return (
      <div className='flex flex-1 flex-col bg-background'>
         <header className='w-full'>
            <div className='relative flex h-16 flex-shrink-0 items-center border-b p-1 shadow-sm'>
               <MobileNavigation />

               <div className='align-center flex flex-1 justify-center px-4 py-2'>
                  <CommandButton />
               </div>
               <MuseAvatar className='mx-1 flex h-8 w-8 md:hidden' />
            </div>
         </header>

         {/* Main content */}
         <div className='flex flex-1 items-stretch overflow-hidden'>
            {needsReviews ? (
               <NoReviewsState />
            ) : (
               <main className='muse-scrollbar flex-1 overflow-y-auto'>
                  <div className='mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8'>
                     <div className='flex'>
                        <h1 className='flex-1 text-2xl font-bold text-foreground'>Reviews</h1>
                        {/* <IconToggle
                           toggleAtom={viewToggleAtom}
                           iconLeft={<Bars4Icon className='h-5 w-5' aria-hidden='true' />}
                           iconRight={<Squares2X2IconMini className='h-5 w-5' aria-hidden='true' />}
                           className='sm:hidden'
                        /> */}
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
                           <div className='flex items-center'>
                              <SortTabs className='-mb-px flex flex-1 space-x-6 xl:space-x-8' />

                              <TooltipProvider delayDuration={200}>
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                       <button className='mr-3 hidden text-primary md:inline' onClick={openTour}>
                                          <QuestionMarkCircleIcon className='h-6 w-6' />
                                       </button>
                                    </TooltipTrigger>
                                    <TooltipContent> Open page tour </TooltipContent>
                                 </Tooltip>
                              </TooltipProvider>
                              {/* <IconToggle
                                 toggleAtom={viewToggleAtom}
                                 iconLeft={<Bars4Icon className='h-5 w-5' aria-hidden='true' />}
                                 iconRight={<Squares2X2IconMini className='h-5 w-5' aria-hidden='true' />}
                                 className='sm:flex'
                              /> */}
                           </div>
                        </div>
                     </div>

                     {/* Gallery */}
                     <section className='mt-8 pb-16' aria-labelledby='review-gallery'>
                        <ul
                           role='list'
                           className='grid grid-cols-3 gap-x-2 gap-y-8 animate-in fade-in duration-300 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-8'
                        >
                           {reviews.map(review => (
                              <BrowseCard
                                 key={review.id}
                                 review={review}
                                 onClick={() => setSelectedReview(review.id)}
                              />
                           ))}
                        </ul>
                     </section>
                  </div>
               </main>
            )}
         </div>
      </div>
   )
}

const ReviewSorts = {
   'recently viewed': 'Recently Viewed',
   owned: 'Your Reviews',
   shared: 'Shared With You',
} as const

type ReviewFilter = keyof typeof ReviewSorts

const sortOrderAtom = atom<ReviewFilter>('owned')

const SortTabs = ({ className }: { className?: string }) => {
   const [sortOrder, setSortOrder] = useAtom(sortOrderAtom)

   return (
      <Tabs value={sortOrder} className={className} onValueChange={v => setSortOrder(v as ReviewFilter)}>
         <TabsList>
            {Object.entries(ReviewSorts).map(([key, value]) => (
               <TabsTrigger key={key} value={key as ReviewFilter} className='text-xs sm:text-sm'>
                  {value}
               </TabsTrigger>
            ))}
         </TabsList>
      </Tabs>
   )
}

const selectNeedsReviews = (data: ProfileAndReviewsQuery) => data.user.reviews?.length === 0
const useNeedsReviews = () => {
   // Don't need to account for loading bc suspense.
   const { data } = useProfileAndReviewsQuery(
      {},
      {
         suspense: true,
         staleTime: Infinity,
         select: selectNeedsReviews,
      }
   )
   return data
}

const CreateFirstReviewOptions = [
   {
      name: 'Command',
      description: 'This is the quickest option!',
      action: () =>
         (() => {
            const openPage = useOpenCommandPage()
            return () => openPage(Pages.createReview)
         })(),
      iconColor: 'bg-primary text-primary-foreground',
      icon: CodeBracketIcon,
   },
   {
      name: 'From Your Playlists',
      description: "Well curated tunes don't review themselves.",
      action: () => useNavAction('/app/playlists'),
      iconColor: 'bg-primary text-primary-foreground',
      icon: MusicalNoteIcon,
   },
   {
      name: 'Browse Spotify',
      description: 'Always more music to explore.',
      action: () => useNavAction('/app/search'),
      iconColor: 'bg-secondary text-secondary-foreground',
      icon: MagnifyingGlassCircleIcon,
   },
]

const NoReviewsState = () => {
   return (
      <div className='mx-auto max-w-lg pt-10'>
         <h2 className='text-lg font-medium text-foreground'>Create your first review </h2>
         {/* <p className='mt-1 text-sm text-gray-500'>Share some</p> */}
         <ul role='list' className='mt-6 '>
            {CreateFirstReviewOptions.map((item, itemIdx) => {
               const action = item.action()
               return (
                  <li key={itemIdx}>
                     <div className='group relative flex items-start space-x-3 border-b border-t border-foreground/10 py-4'>
                        <div className='flex-shrink-0'>
                           <span
                              className={cn(
                                 item.iconColor,
                                 'inline-flex h-10 w-10 items-center justify-center rounded-lg'
                              )}
                           >
                              <item.icon className='h-6 w-6' aria-hidden='true' />
                           </span>
                        </div>
                        <div className='min-w-0 flex-1'>
                           <div className='text-sm font-medium text-foreground'>
                              <button onClick={action}>
                                 <span className='absolute inset-0' aria-hidden='true' />
                                 {item.name}
                              </button>
                           </div>
                           <p className='text-sm text-foreground/50'>{item.description}</p>
                        </div>
                        <div className='flex-shrink-0 self-center'>
                           <ChevronRightIcon
                              className='h-5 w-5 text-foreground/50 group-hover:text-foreground'
                              aria-hidden='true'
                           />
                        </div>
                     </div>
                  </li>
               )
            })}
         </ul>
      </div>
   )
}

export const useProfileAndReviews = () => {
   // TODO: Have to account for viewed reviews.
   const currentUserId = useCurrentUserId()
   const { data } = useProfileAndReviewsQuery(
      { userId: currentUserId },
      {
         suspense: true,
         onError: () => toast.error('Failed to load profile.'),
         staleTime: 30 * 1000,
      }
   )

   const search = useAtomValue(searchLoweredAtom)
   const reviews = data?.user.reviews ?? []
   const searchedReviews = searchReviews(reviews, search)

   const sortOrder = useAtomValue(sortOrderAtom)
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
   sortOrder: ReviewFilter,
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
