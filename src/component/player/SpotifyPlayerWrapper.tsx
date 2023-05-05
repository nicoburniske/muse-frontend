import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

import { useIsPlayerReady, useLatestPlaybackState, useResetSpotifySdk } from '@/component/sdk/PlaybackSDK'
import { Alert, AlertDescription, AlertTitle } from '@/lib/component/Alert'
import { Button } from '@/lib/component/Button'
import { Skeleton } from '@/lib/component/Skeleton'
import { nowPlayingTrackAtom } from '@/state/NowPlayingAtom'
import { nonNullable } from '@/util/Utils'

import { SpotifyPlayerFallback } from './SpotifyPlayer'
import { useTransferPlaybackOnMount } from './TransferPlayback'

export const SpotifyPlayerWrapper = () => {
   const ready = useIsPlayerReady()

   return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
         {ready ? <SpotifyPlayerSync /> : <IndeterminateProgress />}
      </ErrorBoundary>
   )
}

const ErrorFallback = (props: FallbackProps) => {
   const resetSdk = useResetSpotifySdk()
   const reset = () => {
      resetSdk()
      props.resetErrorBoundary()
   }
   return (
      <div className='p-4'>
         <Alert variant='destructive' className='flex justify-center'>
            <ExclamationTriangleIcon className='h-4 w-4' />
            <div className='flex gap-4'>
               <div>
                  <AlertTitle>Error Starting Playback</AlertTitle>
                  <AlertDescription>Please make sure you have an active Spotify Session.</AlertDescription>
               </div>
               <Button onClick={reset}>Retry</Button>
            </div>
         </Alert>
      </div>
   )
}

const IndeterminateProgress = () => {
   return (
      <div className='flex items-center justify-between gap-10 px-4 py-2'>
         <div className='flex items-center space-x-4 '>
            <Skeleton className='h-12 w-12 rounded-md' />
            <div className='w-48 space-y-2'>
               <Skeleton className='h-4 w-full' />
               <Skeleton className='h-4 w-3/4' />
            </div>
         </div>
         <div className='flex	w-80 max-w-2xl flex-1 flex-col items-center justify-center gap-4 justify-self-center'>
            <div className='flex w-full justify-evenly gap-1'>
               {Array(9)
                  .fill(0)
                  .map((_, i) => (
                     <Skeleton key={i} className='h-8 w-8 rounded-md' />
                  ))}
            </div>
            <Skeleton className='h-3 w-full' />
         </div>

         <div className='hidden h-4 w-48 items-center gap-4 md:flex'>
            <Skeleton className='h-8 w-8 rounded-md' />
            <Skeleton className='h-4 flex-1' />
         </div>
      </div>
   )
}

const SpotifyPlayerSync = () => {
   useSyncNowPlaying()
   useTransferPlaybackOnMount()

   return <SpotifyPlayerFallback />
}

const useSyncNowPlaying = () => {
   const playbackState = useLatestPlaybackState()
   const nowPlaying = playbackState?.track_window?.current_track?.id
   const setNowPlaying = useSetAtom(nowPlayingTrackAtom)

   useEffect(() => {
      if (nonNullable(nowPlaying)) {
         setNowPlaying({ trackId: nowPlaying })
      } else {
         setNowPlaying(undefined)
      }
   }, [nowPlaying, setNowPlaying])
}
