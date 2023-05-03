import {
   EntityType,
   ReviewDetailsFragment,
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
import { CommentFormModal } from './commentForm/CommentFormModal'
import Split from 'react-split'
import { nonNullable, findFirstImage, groupBy, cn } from 'util/Utils'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { GroupedTrackTableWrapper } from './table/GroupedTrackTable'
import { NotFound } from 'pages/NotFound'
import { Group, ReviewOverview } from './table/Helpers'
import { useSetCurrentReview } from 'state/CurrentReviewAtom'
import { Bars3BottomLeftIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { useCurrentUserId } from 'state/CurrentUser'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'
import { OpenMobileMenuButton } from 'component/container/OpenMobileMenuButton'
import { HeroLoading } from 'platform/component/HeroLoading'
import { SearchInputKbdSuggestion } from 'platform/component/SearchInputKbdSuggestion'
import { useSearchAtom } from 'state/Atoms'
import { LinkReviewButton } from './LinkReview'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'platform/component/Tooltip'
import { Icon } from 'component/container/NavConstants'
import { useOpenReviewTour, useOpenReviewTourFirstTime } from './DetailedReviewTour'
import ReviewCommentSection from './comment/CommentSection'
import { useDetailedReviewCacheQuery } from 'state/useDetailedReviewCacheQuery'
import { Link } from 'react-router-dom'
import { ArrowsRightLeftIcon, ChatBubbleBottomCenterIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'
import { ListenOnSpotifyIcon } from 'component/ListenOnSpotify'
import { EditReview } from './editReview/EditReview'
import { Button } from 'platform/component/Button'
import { Badge } from 'platform/component/Badge'
import { Separator } from 'platform/component/Seperator'

export interface DetailedReviewProps {
   reviewId: string
}

export const RenderOptionValues = ['tracks', 'comments', 'both'] as const
export type RenderOption = (typeof RenderOptionValues)[number]
const renderOptionAtom = atom<RenderOption>('both')

export function DetailedReview({ reviewId }: DetailedReviewProps) {
   useOpenReviewTourFirstTime()
   const { data } = useDetailedReviewCacheQuery(reviewId, t => t, {
      suspense: true,
      staleTime: 5 * 60 * 1000,
   })

   if (data?.review) {
      return <DetailedReviewContent reviewId={reviewId} review={data.review} />
   } else {
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
      <>
         <div className='relative flex grow flex-col'>
            <ReviewHeader review={review} />
            <Separator />
            <div className='m-auto inline-flex w-16 items-center justify-center space-x-10 rounded-md p-1 lg:hidden'>
               <RenderOptionTooltip renderOption='tracks' label='Tracks' icon={MusicalNoteIcon} />
               <RenderOptionTooltip renderOption='comments' label='Comments' icon={ChatBubbleBottomCenterIcon} />
            </div>
            <Separator />
            {/* For some reason I need a min-height? When doing flex-col in page. */}
            <div className='mx-1 min-h-0 grow'>
               <DetailedReviewBody rootReview={reviewId} reviews={allReviews} />
            </div>
         </div>
         <CommentFormModal />
      </>
   )
}

const ReviewHeader = ({ review }: { review: ReviewDetailsFragment }) => {
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
      <div className='shadow-l mb-1 grid grid-cols-2 lg:grid-cols-3'>
         <div className='flex w-full items-center justify-start'>
            <img
               className='hidden h-20 w-20 object-scale-down object-center shadow-2xl md:flex'
               src={reviewEntityImage}
               alt='Review Image'
            />
            <OpenMobileMenuButton>
               {onClick => (
                  <Button size='sm' className='md:hidden' onClick={onClick}>
                     <span className='sr-only'>Open sidebar</span>
                     <Bars3BottomLeftIcon className='h-6 w-6' aria-hidden='true' />
                  </Button>
               )}
            </OpenMobileMenuButton>
            <dl className='ml-1 grid grid-rows-3 items-start justify-evenly space-y-1 md:ml-3 '>
               <h1 className='truncate text-base font-bold md:text-xl'>{title}</h1>
               <dt className='sr-only'>Entity Details</dt>
               <dd className='flex items-center text-sm font-medium'>
                  <Badge variant='outline' className='mr-1.5 truncate whitespace-nowrap'>
                     {entity?.__typename}
                  </Badge>
                  <div className='line-clamp-1'>{entityName}</div>
               </dd>
               <dt className='sr-only'>Creator name</dt>
               <dd>
                  <Link to={`/app/user/${creatorId}`}>
                     <Button variant='link' size='empty' className='text-sm text-muted-foreground'>
                        <span className='truncate'>{creatorDisplayName ?? creatorId}</span>
                     </Button>
                  </Link>
               </dd>
               <div className='flex flex-1 space-x-1'></div>
            </dl>
         </div>

         <div className='m-auto hidden w-full max-w-xl flex-col items-center lg:flex'>
            <div className='w-full'>
               <SearchTracks />
            </div>
            <div className='inline-flex h-10 w-16 items-center justify-center rounded-md p-1 lg:w-24 lg:space-x-10'>
               <RenderOptionTooltip renderOption='tracks' label='Tracks' icon={MusicalNoteIcon} />
               <RenderOptionTooltip renderOption='both' label='Split' icon={ArrowsRightLeftIcon} />
               <RenderOptionTooltip renderOption='comments' label='Comments' icon={ChatBubbleBottomCenterIcon} />
            </div>
         </div>

         <div className='flex items-center justify-end'>
            <ListenOnSpotifyIcon entityId={entity?.id} entityType={entity?.__typename} />
            <div className='mr-4 flex flex-none flex-col items-center justify-between space-y-1 md:flex-row md:justify-end md:gap-1'>
               <button className='hidden text-primary md:inline' onClick={openTour}>
                  <QuestionMarkCircleIcon className='h-6 w-6' />
               </button>
               {isReviewOwner ? (
                  <>
                     <EditReview
                        reviewId={reviewId}
                        reviewName={title!}
                        isPublic={isPublic === undefined ? false : isPublic}
                     />

                     <ShareReview reviewId={reviewId} collaborators={collaborators}>
                        <Button variant='outline' className='muse-share'>
                           Share
                        </Button>
                     </ShareReview>
                     {linkEnabled && <LinkReviewButton reviewId={reviewId} alreadyLinkedIds={childReviewIds} />}
                  </>
               ) : null}
            </div>
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

const RenderOptionTooltip = (props: { renderOption: RenderOption; label: string; icon: Icon; className?: string }) => {
   const { renderOption, label, className } = props
   const [currentRenderOption, setRenderOption] = useAtom(renderOptionAtom)

   return (
      <TooltipProvider delayDuration={500}>
         <Tooltip>
            <TooltipTrigger asChild>
               <Button
                  variant='ghost'
                  size='sm'
                  className={cn(
                     currentRenderOption === renderOption ? 'bg-accent text-accent-foreground shadow-sm' : '',
                     className
                  )}
                  onClick={() => setRenderOption(renderOption)}
               >
                  <props.icon className='h-6 w-6' />
               </Button>
            </TooltipTrigger>

            <TooltipContent side='top' align='start' className='text-primary-content bg-primary'>
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
