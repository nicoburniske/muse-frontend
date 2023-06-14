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
import { atom, useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Link } from 'react-router-dom'
import Split from 'react-split'

import { MuseAvatar } from '@/component/avatar/MuseAvatar'
import { CommandButton, useExecuteAndClose, useSetExtraCommandGroups } from '@/component/command/Command'
import ReviewCommentSection from '@/component/comment/CommentSection'
import { MobileNavigation } from '@/component/container/MobileMenu'
import { useDeleteReview } from '@/component/deleteReview/DeleteReviewModal'
import { useEditReview } from '@/component/editReview/EditReview'
import { useSelectReview } from '@/component/SelectedReview'
import { useShareReview } from '@/component/shareReview/ShareReview'
import { AlbumTrackTable } from '@/component/trackTable/AlbumTrackTable'
import { ReviewOverview } from '@/component/trackTable/Helpers'
import { PlaylistTrackTable } from '@/component/trackTable/PlaylistTrackTable'
import { EntityType, ReviewDetailsFragment, useGetAlbumQuery, useGetPlaylistQuery } from '@/graphql/generated/schema'
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
import { allEntities, cn, findFirstImage, nonNullable, userDisplayNameOrId } from '@/util/Utils'

import { useOpenReviewTour, useOpenReviewTourFirstTime } from './DetailedReviewTour'

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
           reviewName: review.reviewName as string,
        }
      : undefined

   return (
      <div className='relative flex grow flex-col'>
         <ReviewHeader review={review} />
         <Separator />
         {/* For some reason I need a min-height? When doing flex-col in page. */}
         <div className='mx-1 min-h-0 grow'>
            <DetailedReviewBody review={parent!} />
         </div>
      </div>
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

   const { openShareReview } = useShareReview()
   const { openEditReview } = useEditReview()
   const { setSelectedReview } = useSelectReview()

   const setSelected = () => setSelectedReview(reviewId, creatorId)

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
                     </>
                  ) : (
                     <Button variant='outline' onClick={setSelected}>
                        <InformationCircleIcon className='mr-2 h-4 w-4' />
                        Info
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

type DetailedReviewBodyProps = {
   review: ReviewAndEntity
}

export type ReviewAndEntity = ReviewOverview & {
   entityId: string
   entityType: EntityType
}

const DetailedReviewBody = ({ review }: DetailedReviewBodyProps) => {
   const [options, setOption] = useAtom(renderOptionAtom)
   const trackSection = <TrackSectionTable review={review} />
   const commentSection = <ReviewCommentSection reviewId={review.reviewId} />
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

   const commonClass = 'muse-scrollbar h-full overflow-y-auto'
   return options == 'both' ? (
      <div className='flex h-full gap-1'>
         <div className={cn(commonClass, 'w-1/2')}>{trackSection}</div>
         <div className={cn(commonClass, 'w-1/2')}>{commentSection}</div>
      </div>
   ) : (
      <div className={commonClass}>{options == 'tracks' ? trackSection : commentSection}</div>
   )
}

const TrackSectionTable = ({ review: { reviewId, entityId, entityType } }: DetailedReviewBodyProps) => {
   const { data: playlist, isLoading: isPlaylistLoading } = useGetPlaylistQuery(
      { id: entityId },
      { enabled: entityType === 'Playlist' }
   )
   const { data: album, isLoading: isAlbumLoading } = useGetAlbumQuery(
      { id: entityId },
      { enabled: entityType === 'Album' }
   )
   const isLoading = entityType === 'Album' ? isAlbumLoading : isPlaylistLoading

   return (
      <div className='relative flex w-full'>
         {isLoading ? (
            <HeroLoading />
         ) : entityType === 'Playlist' ? (
            <PlaylistTrackTable tracks={playlist?.getPlaylist?.tracks ?? []} reviewId={reviewId} />
         ) : (
            <AlbumTrackTable tracks={album?.getAlbum?.tracks ?? []} reviewId={reviewId} />
         )}
      </div>
   )
}
