import { Bars3BottomLeftIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { Alert, AlertTitle, AlertDescription } from 'platform/component/Alert'
import Hero from 'platform/component/Hero'
import { HeroLoading } from 'platform/component/HeroLoading'
import { Suspense, useRef } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Link, useParams } from 'react-router-dom'
import { NotFound } from './NotFound'
import { useGetPlaylistQuery } from 'graphql/generated/schema'
import { Separator } from 'platform/component/Seperator'
import { TrackRow } from 'component/detailedReview/table/Helpers'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ContextMenu, ContextMenuTrigger } from 'platform/component/ContextMenu'
import { useKeepMountedRangeExtractorSorted, useSmoothScroll } from 'component/detailedReview/table/TableHooks'
import { TrackContextMenuContent } from 'component/detailedReview/track/TrackContextMenu'
import { EitherTrackMemo } from 'component/detailedReview/table/EitherTrack'
import { OpenMobileMenuButton } from 'component/container/OpenMobileMenuButton'
import { Button } from 'platform/component/Button'
import { SelectedPlaylist, useSelectPlaylist } from 'component/MyPlaylists'
import { CreateReviewModal } from 'component/createReview/CreateReviewModal'

export const PlaylistPage = () => {
   const { playlistId } = useParams()

   if (playlistId) {
      return (
         // This happens more than it should because backend can't parse non-uuid.
         <ErrorBoundary
            fallback={
               <Hero>
                  <div className='h-10 w-full'>
                     <Alert variant='destructive'>
                        <ExclamationTriangleIcon className='h-4 w-4' />
                        <AlertTitle>Error Loading Review</AlertTitle>
                        <AlertDescription></AlertDescription>
                     </Alert>
                  </div>
               </Hero>
            }
         >
            <div className='flex grow bg-background'>
               <Suspense fallback={<HeroLoading />}>
                  <PlaylistPageContent playlistId={playlistId} />
               </Suspense>
            </div>
         </ErrorBoundary>
      )
   } else {
      return <NotFound label={'Go Back Home'} />
   }
}

const PlaylistPageContent = ({ playlistId }: { playlistId: string }) => {
   const { data } = useGetPlaylistQuery({ id: playlistId }, { suspense: true })

   const playlist = data?.getPlaylist!
   const image = playlist.images.slice(-2)[0]

   const creatorId = playlist.owner.id
   const creatorDisplayName = playlist.owner?.spotifyProfile?.displayName

   const { setSelectedPlaylist } = useSelectPlaylist()

   const openInfo = () => setSelectedPlaylist(playlistId)

   return (
      <>
         <div className='flex h-full w-full flex-col'>
            <div className='flex w-full items-center justify-between'>
               <div className='flex items-center gap-4'>
                  <OpenMobileMenuButton>
                     {onClick => (
                        <Button size='sm' className='md:hidden' onClick={onClick}>
                           <span className='sr-only'>Open sidebar</span>
                           <Bars3BottomLeftIcon className='h-6 w-6' aria-hidden='true' />
                        </Button>
                     )}
                  </OpenMobileMenuButton>
                  <div className='ml-2 hidden md:flex'>
                     <img
                        className='h-20 w-20 object-scale-down object-center shadow-2xl'
                        src={image}
                        alt='Review Image'
                     />
                  </div>
                  <div className='flex flex-col justify-center'>
                     <h1 className='truncate text-base font-bold md:text-xl'>{playlist.name}</h1>
                     <Link to={`/app/user/${creatorId}`}>
                        <Button variant='link' size='empty' className='text-sm text-muted-foreground'>
                           <span className='truncate'>{creatorDisplayName}</span>
                        </Button>
                     </Link>
                  </div>
               </div>
               <div className='mr-2'>
                  <Button variant='outline' onClick={openInfo}>
                     Info
                     <InformationCircleIcon className='ml-2 h-4 w-4' />
                  </Button>
               </div>
            </div>
            <Separator />
            <main className='mx-auto mt-4 min-h-0 w-full max-w-7xl border'>
               <TrackTable tracks={playlist.tracks!} />
            </main>
         </div>

         <CreateReviewModal />
         <SelectedPlaylist />
      </>
   )
}

const TrackTable = ({ tracks }: { tracks: TrackRow[] }) => {
   const parentRef = useRef<HTMLDivElement>(null)

   const scrollToFn = useSmoothScroll(parentRef)
   const rangeExtractor = useKeepMountedRangeExtractorSorted()

   const rowVirtualizer = useVirtualizer({
      overscan: 20,
      count: tracks.length,
      estimateSize: () => 60,
      getScrollElement: () => parentRef.current,
      scrollToFn,
      rangeExtractor,
   })

   return (
      <ContextMenu>
         <ContextMenuTrigger asChild>
            <div ref={parentRef} className='muse-scrollbar h-full w-full overflow-y-auto'>
               <div
                  className='muse-tracks relative w-full'
                  style={{
                     height: `${rowVirtualizer.getTotalSize()}px`,
                  }}
               >
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                     const index = virtualRow.index
                     return (
                        <div
                           key={virtualRow.index}
                           style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                           }}
                        >
                           <EitherTrackMemo reviewId={''} track={tracks[index]} index={index} />
                        </div>
                     )
                  })}
               </div>
            </div>
         </ContextMenuTrigger>

         <TrackContextMenuContent />
      </ContextMenu>
   )
}
