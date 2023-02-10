import {
   EntityType,
   ReviewDetailsFragment,
   useDetailedReviewQuery,
   useGetPlaylistQuery,
   useGetAlbumQuery,
   DetailedPlaylistFragment,
   DetailedAlbumFragment,
} from 'graphql/generated/schema'
import { useEffect } from 'react'
import { useSetAtom, useAtomValue, atom, useAtom } from 'jotai'
import { ShareReview } from './ShareReview'
import { CommentFormModalWrapper } from './commentForm/CommentFormModalWrapper'
import { ArrowRightLeftIcon, CommentIcon, MusicIcon } from 'component/Icons'
import Split from 'react-split'
import { nonNullable, findFirstImage, groupBy, classNames } from 'util/Utils'
import { useQueries, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { GroupedTrackTableWrapper } from './table/GroupedTrackTable'
import ReviewCommentSection from './CommentSection'
import { NotFound } from 'pages/NotFound'
import { Group, ReviewOverview } from './table/Helpers'
import { useSetCurrentReview } from 'state/CurrentReviewAtom'
import { Bars3BottomLeftIcon, PencilIcon, ShareIcon, UserIcon } from '@heroicons/react/20/solid'
import { useCurrentUserId } from 'state/CurrentUser'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'
import { EditReviewButton } from './editReview/EditReview'
import { OpenMobileMenuButton } from 'component/nav/OpenMobileMenuButton'

export interface DetailedReviewProps {
   reviewId: string
}

export type RenderOptions = 'tracks' | 'comments' | 'both'
const renderOptionAtom = atom<RenderOptions>('both')

export function DetailedReview({ reviewId }: DetailedReviewProps) {
   const { data, isLoading } = useDetailedReviewQuery(
      { reviewId },
      {
         suspense: true,
         staleTime: 5 * 60 * 1000,
         refetchOnWindowFocus: false,
      }
   )

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
         {/* For some reason I need a min-height? When doing flex-col in page. */}
         <div className='mx-1 min-h-0 grow bg-base-100'>
            <DetailedReviewBody rootReview={reviewId} reviews={allReviews} />
         </div>
         <CommentFormModalWrapper />
      </div>
   )
}

const ReviewHeader = ({ review }: { review: ReviewDetailsFragment }) => {
   const queryClient = useQueryClient()
   const reload = () => queryClient.invalidateQueries(useDetailedReviewQuery.getKey({ reviewId }))

   const reviewId = review.id
   const currentUserId = useCurrentUserId()

   const isReviewOwner = currentUserId === review?.creator?.id
   const collaborators = review?.collaborators ?? []
   const isPublic = review.isPublic
   const title = review.reviewName
   const entityName = review.entity?.name ?? 'No Entity Linked'
   const creator = review?.creator?.spotifyProfile?.displayName ?? review?.creator?.id
   const entity = review?.entity

   // Find first image!
   const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
   // Root review doesn't need an entity.
   const reviewEntityImage = findFirstImage(nonNullable(entity) ? [entity, ...childEntities] : childEntities)

   return (
      <div className='shadow-l mb-1 flex flex-row items-center justify-between bg-base-100'>
         <div className='flex flex-row items-center justify-start space-x-1 p-1'>
            <div className='min-w-0 flex-1'>
               <div className='flex items-center justify-between'>
                  <img
                     className='hidden h-20 w-20 object-scale-down object-center shadow-2xl md:flex'
                     src={reviewEntityImage}
                  />

                  <OpenMobileMenuButton>
                     {onClick => (
                        <button type='button' className='btn btn-primary mr-2 h-full px-4 md:hidden' onClick={onClick}>
                           <span className='sr-only'>Open sidebar</span>
                           <Bars3BottomLeftIcon className='h-6 w-6' aria-hidden='true' />
                        </button>
                     )}
                  </OpenMobileMenuButton>
                  <div>
                     <dl className='ml-1 flex flex-col items-start justify-center md:ml-3 md:space-y-1'>
                        <h1 className='text-base font-bold leading-7 sm:truncate sm:leading-9 md:text-2xl'>{title}</h1>
                        <dt className='sr-only'>Entity Details</dt>
                        <dd className='flex items-center text-sm font-medium'>
                           <div className='badge badge-secondary mr-1.5 overflow-hidden truncate whitespace-nowrap'>
                              {entity?.__typename}
                           </div>
                           {entityName}
                        </dd>
                        <dt className='sr-only'>Creator name</dt>
                        <dd className='mt-3 flex items-center text-sm font-medium capitalize sm:mr-6 sm:mt-0'>
                           <UserIcon className='mr-1.5 h-5 w-5 flex-shrink-0 text-primary' aria-hidden='true' />
                           {creator}
                        </dd>
                     </dl>
                  </div>
               </div>
            </div>
         </div>
         {isReviewOwner ? (
            <div className='grid grid-cols-2 place-content-evenly gap-1 lg:flex lg:space-x-1'>
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

               <div className='tabs col-span-2 flex flex-row items-center justify-center'>
                  <RenderOptionTabs />
               </div>
               {/* <LinkReviewButton reviewId={reviewId} alreadyLinkedIds={childReviewIds} />
                  <CreateReview
                     parentReviewIdAtom={parentReviewIdAtom}
                     title='create linked review'
                     className='btn btn-secondary btn-sm lg:btn-md'
                  /> */}
            </div>
         ) : null}
      </div>
   )
}

const tabStyle = 'tab tab-xs md:tab-md lg:tab-lg tab-boxed'
const RenderOptionTabs = () => {
   const [renderOption, setRenderOption] = useAtom(renderOptionAtom)
   return (
      <>
         <button
            className={classNames(tabStyle, renderOption === 'tracks' ? 'tab-active' : '')}
            onClick={() => setRenderOption('tracks')}
         >
            <MusicIcon />
         </button>
         <button
            className={classNames(
               tabStyle,
               // 'hidden md:tab',
               renderOption === 'both' ? 'tab-active' : ''
            )}
            onClick={() => setRenderOption('both')}
         >
            <ArrowRightLeftIcon />
         </button>
         <button
            className={classNames(tabStyle, renderOption === 'comments' ? 'tab-active' : '')}
            onClick={() => setRenderOption('comments')}
         >
            <CommentIcon />
         </button>
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
   const playlistIds = allIds.get(EntityType.Playlist) ?? []
   const albumIds = allIds.get(EntityType.Album) ?? []
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
      const allReviews = all.filter(r => r.entityType === EntityType.Album || r.entityType === EntityType.Playlist)
      // get all reviews that are not nullable
      const results: (DetailedAlbumFragment | DetailedPlaylistFragment)[] = [...albumResults, ...playlistResults]
         .map(r => r.data?.getAlbum ?? r.data?.getPlaylist)
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
      <div className='flex w-full'>
         {isLoading ? (
            <div className='grid w-full place-items-center'>
               <div className='h-56 w-56 animate-spin rounded-full border-8 border-solid border-primary border-t-transparent' />
            </div>
         ) : (
            <GroupedTrackTableWrapper results={matchedReviews} rootReview={rootReview} />
         )}
      </div>
   )
}

const areAllLoadingNoData = (results: UseQueryResult<any, unknown>[]) => {
   return results.some(r => r.isLoading) && results.every(r => r.data === undefined)
}
