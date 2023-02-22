import {
   EntityType,
   ReviewDetailsFragment,
   useDetailedReviewQuery,
   useGetPlaylistQuery,
   useGetAlbumQuery,
   DetailedPlaylistFragment,
   DetailedAlbumFragment,
   GetAlbumQuery,
   GetPlaylistQuery,
} from 'graphql/generated/schema'
import { useEffect } from 'react'
import { useSetAtom, useAtomValue, atom, useAtom } from 'jotai'
import { ShareReview } from '../shareReview/ShareReview'
import { CommentFormModalWrapper } from './commentForm/CommentFormModalWrapper'
import { ArrowRightLeftIcon, CommentIcon, MusicIcon } from 'component/Icons'
import Split from 'react-split'
import { nonNullable, findFirstImage, groupBy, cn } from 'util/Utils'
import { useQueries, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { GroupedTrackTableWrapper } from './table/GroupedTrackTable'
import { NotFound } from 'pages/NotFound'
import { Group, ReviewOverview } from './table/Helpers'
import { useSetCurrentReview } from 'state/CurrentReviewAtom'
import { Bars3BottomLeftIcon, PencilIcon, QuestionMarkCircleIcon, ShareIcon } from '@heroicons/react/20/solid'
import { useCurrentUserId } from 'state/CurrentUser'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'
import { EditReviewButton } from './editReview/EditReview'
import { OpenMobileMenuButton } from 'component/nav/OpenMobileMenuButton'
import { HeroLoading } from 'platform/component/HeroLoading'
import { SearchInputKbdSuggestion } from 'platform/component/SearchInputKbdSuggestion'
import { useSearchAtom } from 'state/Atoms'
import { LinkReviewButton } from './LinkReview'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'platform/component/Tooltip'
import { Icon } from 'component/nav/NavConstants'
import { useOpenReviewTour, useOpenReviewTourFirstTime } from './DetailedReviewTour'
import ReviewCommentSection from './comment/CommentSection'
import { useDetailedReviewCacheQuery } from 'component/useDetailedReviewCacheQuery'
import { Link } from 'react-router-dom'

export interface DetailedReviewProps {
   reviewId: string
}

export const RenderOptionValues = ['tracks', 'comments', 'both'] as const
export type RenderOption = (typeof RenderOptionValues)[number]
const renderOptionAtom = atom<RenderOption>('both')

export function DetailedReview({ reviewId }: DetailedReviewProps) {
   useOpenReviewTourFirstTime()
   const { data, isLoading } = useDetailedReviewCacheQuery(reviewId, t => t, {
      suspense: true,
      staleTime: 5 * 60 * 1000,
   })

   if (data?.review) {
      return <DetailedReviewContent reviewId={reviewId} review={data.review} />
   } else if (!isLoading) {
      return <NotFound label='Home' redirect='/app' />
   }
}

interface DetailedReviewContentProps {
   reviewId: string
   review: ReviewDetailsFragment
}

const DetailedReviewContent = ({ reviewId, review }: DetailedReviewContentProps) => {
   useSetCurrentReview(reviewId)

   // Parent!
   const entityId = review.entity?.id ?? ''
   const parent = nonNullable(review?.entity)
      ? {
           reviewId,
           entityId,
           entityType: review.entity.__typename as EntityType,
           reviewName: review?.reviewName as string,
        }
      : undefined

   // Children!
   const children =
      review?.childReviews
         ?.filter(nonNullable)
         ?.filter(c => nonNullable(c.id))
         ?.filter(c => nonNullable(c.entity?.id))
         ?.filter(c => nonNullable(c.entity?.__typename))
         .map(child => ({
            reviewId: child.id,
            entityId: child.entity?.id as string,
            entityType: child.entity?.__typename as EntityType,
            reviewName: child?.reviewName as string,
         })) ?? []

   const allReviews = [parent, ...children].filter(nonNullable)

   return (
      <div className='relative flex grow flex-col'>
         <ReviewHeader review={review} />
         <div className='flex h-8 flex-none justify-evenly'>
            <RenderOptionTabs />
         </div>
         {/* For some reason I need a min-height? When doing flex-col in page. */}
         <div className='mx-1 min-h-0 grow'>
            <DetailedReviewBody rootReview={reviewId} reviews={allReviews} />
         </div>
         <CommentFormModalWrapper />
      </div>
   )
}

const ReviewHeader = ({ review }: { review: ReviewDetailsFragment }) => {
   const queryClient = useQueryClient()
   const reload = () => queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId }))
   const openTour = useOpenReviewTour()

   const reviewId = review.id
   const currentUserId = useCurrentUserId()

   const isReviewOwner = currentUserId === review?.creator?.id
   const collaborators = review?.collaborators ?? []
   const isPublic = review.isPublic
   const title = review.reviewName
   const entityName = review.entity?.name
   const creatorDisplayName = review?.creator?.spotifyProfile?.displayName ?? review?.creator?.id
   const creatorId = review?.creator?.id
   const entity = review?.entity

   // Find first image!
   const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
   // Root review doesn't need an entity.
   const reviewEntityImage = findFirstImage(nonNullable(entity) ? [entity, ...childEntities] : childEntities)

   const linkEnabled = review?.entity?.__typename === 'Artist'
   const childReviewIds = review?.childReviews?.map(child => child?.id).filter(nonNullable) ?? []

   return (
      <div className='shadow-l mb-1 flex items-center justify-between bg-base-100 lg:grid lg:grid-cols-3'>
         <div className='flex w-24 flex-1 items-center justify-start lg:w-full'>
            <img
               className='hidden h-20 w-20 object-scale-down object-center shadow-2xl md:flex'
               src={reviewEntityImage}
               alt='Review Image'
            />
            <OpenMobileMenuButton>
               {onClick => (
                  <button type='button' className='btn btn-primary btn-square mr-1 md:hidden' onClick={onClick}>
                     <span className='sr-only'>Open sidebar</span>
                     <Bars3BottomLeftIcon className='h-6 w-6' aria-hidden='true' />
                  </button>
               )}
            </OpenMobileMenuButton>
            <dl className='ml-1 flex flex-col items-start justify-center space-y-1 md:ml-3 '>
               <h1 className='truncate text-base font-bold md:text-xl'>{title}</h1>
               <dt className='sr-only'>Entity Details</dt>
               <dd className='flex items-center text-sm font-medium'>
                  <div className='badge badge-secondary mr-1.5 truncate whitespace-nowrap text-sm'>
                     {entity?.__typename}
                  </div>
                  {entityName ?? <div className='line-clamp-1'>{entityName}</div>}
               </dd>
               <dt className='sr-only'>Creator name</dt>
               <div className='flex flex-1 space-x-1'>
                  <Link to={`/app/user/${creatorId}`} className='text-sm font-medium text-base-content'>
                     {creatorDisplayName ?? creatorId}
                  </Link>
               </div>
            </dl>
         </div>
         <div className='m-auto hidden w-full max-w-xl lg:inline'>
            <SearchTracks />
         </div>
         <div className='mr-4 flex flex-none flex-col items-center justify-between space-y-1 md:flex-row md:justify-end md:space-y-0 md:space-x-1'>
            <button className='mr-3 hidden text-primary md:inline' onClick={openTour}>
               <QuestionMarkCircleIcon className='h-6 w-6' />
            </button>
            {isReviewOwner ? (
               <>
                  <EditReviewButton
                     reviewId={reviewId}
                     reviewName={title!}
                     onSuccess={() => {
                        reload()
                     }}
                     isPublic={isPublic === undefined ? false : isPublic}
                  >
                     {onClick => (
                        <button className='btn btn-primary btn-sm lg:btn-md' onClick={onClick}>
                           <PencilIcon className='h-6 w-6' />
                        </button>
                     )}
                  </EditReviewButton>

                  <ShareReview reviewId={reviewId} collaborators={collaborators} onChange={() => reload()}>
                     <ShareIcon className='h-6 w-6' />
                  </ShareReview>
                  {linkEnabled && <LinkReviewButton reviewId={reviewId} alreadyLinkedIds={childReviewIds} />}
               </>
            ) : null}
         </div>
      </div>
   )
}

const SearchTracks = () => {
   const [search, setSearch] = useSearchAtom()

   return (
      <SearchInputKbdSuggestion
         screenReaderLabel={'Search Tracks'}
         placeholder={'Search Tracks'}
         search={search}
         setSearch={setSearch as (search: string) => void}
      />
   )
}

const tabStyle = 'tab tab-xs md:tab-md tab-bordered h-8'
const RenderOptionTabs = () => {
   return (
      <>
         <RenderOptionTooltip renderOption='tracks' label='Tracks' icon={MusicIcon} />
         <RenderOptionTooltip renderOption='both' label='Split' icon={ArrowRightLeftIcon} />
         <RenderOptionTooltip renderOption='comments' label='Comments' icon={CommentIcon} />
      </>
   )
}
const RenderOptionTooltip = (props: { renderOption: RenderOption; label: string; icon: Icon; className?: string }) => {
   const { renderOption, label, className } = props
   const [currentRenderOption, setRenderOption] = useAtom(renderOptionAtom)

   return (
      <TooltipProvider delayDuration={500}>
         <Tooltip>
            <TooltipTrigger asChild>
               <button
                  className={cn(tabStyle, currentRenderOption === renderOption ? 'tab-active' : '', className)}
                  onClick={() => setRenderOption(renderOption)}
               >
                  <props.icon className='h-6 w-6' />
               </button>
            </TooltipTrigger>

            <TooltipContent side='top' align='center' className='bg-primary text-primary-content'>
               <p>{label}</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}

interface DetailedReviewBodyProps {
   rootReview: string
   reviews: ReviewAndEntity[]
}

export type ReviewAndEntity = ReviewOverview & {
   entityId: string
   entityType: EntityType
}

const DetailedReviewBody = ({ rootReview, reviews }: DetailedReviewBodyProps) => {
   const options = useAtomValue(renderOptionAtom)
   const trackSection = <TrackSectionTable rootReview={rootReview} all={reviews} />
   const commentSection = <ReviewCommentSection reviews={reviews} />
   const setSelectedTrack = useSetAtom(selectedTrackAtom)

   // Avoid scroll to track when changing tabs.
   useEffect(() => {
      setSelectedTrack(undefined)
   }, [options])

   return (
      <div className='h-full px-1'>
         {options == 'both' ? (
            <Split className='flex h-full space-x-1' sizes={[50, 50]} direction='horizontal'>
               {trackSection}
               {commentSection}
            </Split>
         ) : (
            <div className='flex h-full w-full'>{options == 'tracks' ? trackSection : commentSection}</div>
         )}
      </div>
   )
}

const TrackSectionTable = ({ all, rootReview }: { all: ReviewAndEntity[]; rootReview: string }) => {
   const allIds = groupBy(
      all,
      r => r.entityType,
      r => r.entityId
   )
   const playlistIds = allIds.get('Playlist') ?? []
   const albumIds = allIds.get('Album') ?? []
   const playlistResults = useQueries({
      queries: playlistIds.map(id => ({
         queryKey: useGetPlaylistQuery.getKey({ id }),
         queryFn: useGetPlaylistQuery.fetcher({ id }),
         staleTime: 1 * 60 * 1000,
      })),
   })

   const albumResults = useQueries({
      queries: albumIds.map(id => ({
         queryKey: useGetAlbumQuery.getKey({ id }),
         queryFn: useGetAlbumQuery.fetcher({ id }),
         staleTime: 60 * 60 * 1000,
      })),
   })

   // Ensure that indicies line up.
   const matchedReviews = (() => {
      const allReviews = all.filter(r => r.entityType === 'Album' || r.entityType === 'Playlist')
      // get all reviews that are not nullable
      const results: (DetailedAlbumFragment | DetailedPlaylistFragment)[] = [...albumResults, ...playlistResults]
         .map(r => (r.data as GetAlbumQuery)?.getAlbum ?? (r.data as GetPlaylistQuery)?.getPlaylist)
         .filter(nonNullable)
      return allReviews.reduce((acc, { entityId, reviewName, reviewId }) => {
         const data = results.find(r => r.id === entityId)
         if (data) {
            acc.push({ data, overview: { reviewName, reviewId } })
         }
         return acc
      }, new Array<Group>())
   })()

   const isLoading = areAllLoadingNoData([...playlistResults, ...albumResults])

   return (
      <div className='relative flex w-full'>
         {isLoading ? <HeroLoading /> : <GroupedTrackTableWrapper results={matchedReviews} rootReview={rootReview} />}
      </div>
   )
}

const areAllLoadingNoData = (results: UseQueryResult<any, unknown>[]) => {
   return results.some(r => r.isLoading) && results.every(r => r.data === undefined)
}
