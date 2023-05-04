import { Bars3BottomLeftIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { Alert, AlertTitle, AlertDescription } from 'lib/component/Alert'
import Hero from 'lib/component/Hero'
import { HeroLoading } from 'lib/component/HeroLoading'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Link, useParams } from 'react-router-dom'
import { NotFound } from './NotFound'
import { useGetPlaylistQuery } from 'graphql/generated/schema'
import { Separator } from 'lib/component/Seperator'

import { OpenMobileMenuButton } from 'component/container/OpenMobileMenuButton'
import { Button } from 'lib/component/Button'
import { SelectedPlaylist, useSelectPlaylist } from 'pages/MyPlaylists'
import { CreateReviewModal } from 'component/createReview/CreateReviewModal'
import { TrackTable } from 'component/trackTable/TrackTable'

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
                        <AlertTitle>Error Loading Playlist</AlertTitle>
                        <AlertDescription>Please refresh the page</AlertDescription>
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
   const image = playlist?.images?.slice(-2)[0]

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
