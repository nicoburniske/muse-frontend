import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import {
   ArrowsRightLeftIcon,
   ChatBubbleBottomCenterIcon,
   InformationCircleIcon,
   ListBulletIcon,
   PencilIcon,
   ShareIcon,
   TrashIcon,
} from '@heroicons/react/24/outline'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Link } from 'react-router-dom'
import Split from 'react-split'

import { MuseAvatar } from '@/component/avatar/MuseAvatar'
import { CommandButton, useExecuteAndClose, useSetExtraCommandGroups } from '@/component/command/Command'
import ReviewCommentSection from '@/component/comment/CommentSection'
import { CommentFormModal } from '@/component/commentForm/CommentFormModal'
import { MobileNavigation } from '@/component/container/MobileMenu'
import { useDeleteReview } from '@/component/deleteReview/DeleteReviewModal'
import { useEditReview } from '@/component/editReview/EditReview'
import { SelectedReviewModal, useSelectReview } from '@/component/SelectedReview'
import { useShareReview } from '@/component/shareReview/ShareReview'
import { GroupedTrackTableWrapper } from '@/component/trackTable/GroupedTrackTable'
import { Group, ReviewOverview } from '@/component/trackTable/Helpers'
import {
   DetailedAlbumFragment,
   DetailedPlaylistFragment,
   EntityType,
   GetAlbumQuery,
   GetPlaylistQuery,
   ReviewDetailsFragment,
   useGetAlbumQuery,
   useGetPlaylistQuery,
} from '@/graphql/generated/schema'
import { Badge } from '@/lib/component/Badge'
import { Button } from '@/lib/component/Button'
import { HeroLoading } from '@/lib/component/HeroLoading'
import { Separator } from '@/lib/component/Seperator'
import { useWindowSizeAtom } from '@/lib/hook/useWindowSize'
import { NotFound } from '@/pages/NotFound'
import { useSetCurrentReview } from '@/state/CurrentReviewAtom'
import { useCurrentUserId } from '@/state/CurrentUser'
import { selectedTrackAtom } from '@/state/SelectedTrackAtom'
import { useDetailedReviewCacheQuery } from '@/state/useDetailedReviewCacheQuery'
import { allEntities, findFirstImage, groupBy, nonNullable, userDisplayNameOrId } from '@/util/Utils'

import { useOpenReviewTour, useOpenReviewTourFirstTime } from './DetailedReviewTour'
import { LinkReviewButton } from './LinkReview'

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
            {/* For some reason I need a min-height? When doing flex-col in page. */}
            <div className='mx-1 min-h-0 grow'>
               <DetailedReviewBody rootReview={reviewId} reviews={allReviews} />
            </div>
         </div>
         <SelectedReviewModal />
         <CommentFormModal />
      </>
   )
}

const useAddCommands = (review: ReviewDetailsFragment) => {
   const reviewId = review.id
   const executeWrapper = useExecuteAndClose()

   // Help.
   const tour = useOpenReviewTour()
   const openTour = executeWrapper(tour)

   // Edit.
   // Share.
   const { openShareReview } = useShareReview()
   const openShare = executeWrapper(() => openShareReview(reviewId))
   const { openEditReview } = useEditReview()
   const openEdit = executeWrapper(() => openEditReview(reviewId))

   const deleteReview = useDeleteReview()
   const openDelete = executeWrapper(() => deleteReview(reviewId))

   const commandGroup = {
      header: `Review Actions: ${review.reviewName}`,
      items: [
         {
            id: 'Share Review',
            label: 'Share Review',
            onSelect: openShare,
            icon: ShareIcon,
         },
         {
            id: 'Edit Review',
            label: 'Edit Review',
            onSelect: openEdit,
            icon: PencilIcon,
         },
         {
            id: 'Delete Review',
            label: 'Delete Review',
            onSelect: openDelete,
            icon: TrashIcon,
         },
         {
            id: 'Help',
            label: 'Help',
            onSelect: openTour,
            icon: QuestionMarkCircleIcon,
         },
      ],
   }

   // Render options
   const setRenderOption = useSetAtom(renderOptionAtom)
   const setRender = (option: RenderOption) => executeWrapper(() => setRenderOption(option))

   // Select review.
   const { setSelectedReview } = useSelectReview()
   const openInfo = executeWrapper(() => setSelectedReview(reviewId, review.creator.id))

   const quickActions = {
      header: 'Quick Actions',
      items: [
         {
            id: 'Show View Tracks',
            label: 'Show Tracks',
            onSelect: setRender('tracks'),
            icon: ListBulletIcon,
            shortcut: {
               modifier: '⌥',
               key: 'J',
            },
         },
         {
            id: 'View Show Comments Tracks Both',
            label: 'Show Comments & Tracks',
            onSelect: setRender('both'),
            icon: ArrowsRightLeftIcon,
            shortcut: {
               modifier: '⌥',
               key: 'K',
            },
         },
         {
            id: 'View Show Comments',
            label: 'Show Comments',
            onSelect: setRender('comments'),
            icon: ChatBubbleBottomCenterIcon,
            shortcut: {
               modifier: '⌥',
               key: 'L',
            },
         },
         {
            id: 'Review info',
            label: 'Review info',
            onSelect: openInfo,
            icon: InformationCircleIcon,
         },
      ],
   }
   useSetExtraCommandGroups([quickActions, commandGroup])
}

const ReviewHeader = ({ review }: { review: ReviewDetailsFragment }) => {
   useAddCommands(review)

   const reviewId = review.id
   const currentUserId = useCurrentUserId()

   const isReviewOwner = currentUserId === review?.creator?.id
   const title = review.reviewName
   const entityName = review.entity?.name
   const creatorDisplayName = userDisplayNameOrId(review.creator)
   const creatorId = review.creator.id
   const entity = review.entity

   // Root review doesn't need an entity.
   const reviewEntityImage = findFirstImage(allEntities(review))

   const linkEnabled = review.entity?.__typename === 'Artist'
   const childReviewIds = review?.childReviews?.map(child => child?.id).filter(nonNullable) ?? []

   const { openShareReview } = useShareReview()
   const { openEditReview } = useEditReview()

   return (
      <>
         {/* Desktop Header */}
         <div className='shadow-l mb-1 hidden grid-cols-3 md:grid'>
            <div className='flex w-full items-center justify-start'>
               <div className='ml-2 flex'>
                  <img
                     className='h-20 w-20 object-scale-down object-center shadow-2xl'
                     src={reviewEntityImage}
                     alt='Review Image'
                  />
               </div>
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
                           <span className='truncate'>{creatorDisplayName}</span>
                        </Button>
                     </Link>
                  </dd>
                  <div className='flex flex-1 space-x-1'></div>
               </dl>
            </div>

            <div className='m-auto flex w-full max-w-xl flex-col items-center '>
               <CommandButton />
            </div>

            <div className='flex items-center justify-end'>
               <div className='mr-4 flex flex-none items-center justify-end gap-1'>
                  {isReviewOwner ? (
                     <>
                        <Button variant='outline' onClick={() => openEditReview(reviewId)}>
                           Edit
                        </Button>
                        <Button variant='outline' className='muse-share' onClick={() => openShareReview(reviewId)}>
                           Share
                        </Button>
                        {linkEnabled && <LinkReviewButton reviewId={reviewId} alreadyLinkedIds={childReviewIds} />}
                     </>
                  ) : (
                     <Button variant='outline'>
                        Info
                        <InformationCircleIcon className='ml-2 h-4 w-4' />
                     </Button>
                  )}
               </div>
            </div>
         </div>
         {/* Mobile Header */}
         <div className='relative flex h-16 flex-shrink-0 items-center border-b p-1 shadow-sm md:hidden'>
            <MobileNavigation />

            <div className='align-center flex flex-1 justify-center px-4 py-2'>
               <CommandButton />
            </div>
            <MuseAvatar className='mx-1 flex h-8 w-8 md:hidden' />
         </div>
      </>
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
   const [options, setOption] = useAtom(renderOptionAtom)
   const trackSection = <TrackSectionTable rootReview={rootReview} all={reviews} />
   const commentSection = <ReviewCommentSection reviews={reviews} />
   const setSelectedTrack = useSetAtom(selectedTrackAtom)

   // both cannot be selected on mobile.
   const isMd = useWindowSizeAtom(useCallback(size => size.height === 0 || size.width === 0 || size.isMd, []))
   useEffect(() => {
      if (!isMd && options === 'both') {
         setOption('tracks')
      }
   }, [setOption, isMd, options])

   // Avoid scroll to track when changing tabs.
   useEffect(() => {
      setSelectedTrack(undefined)
   }, [options])

   useHotkeys(['alt+j'], () => setOption('tracks'))
   useHotkeys(['alt+k'], () => setOption('both'))
   useHotkeys(['alt+l'], () => setOption('comments'))

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
