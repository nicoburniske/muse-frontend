import { useLatestPlaybackState } from 'component/sdk/PlaybackSDK'
import { useSetAtom } from 'jotai'
import { Suspense, useEffect, useState } from 'react'
import { nonNullable } from 'util/Utils'
import { SpotifyPlayerFallback } from './SpotifyPlayer'
import { useTransferPlaybackOnMount } from './TransferPlayback'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, AlertTitle, AlertDescription } from 'platform/component/Alert'
import { nowPlayingTrackAtom } from 'state/NowPlayingAtom'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Progress } from 'platform/component/progress'

export const SpotifyPlayerWrapper = () => {
   return (
      <ErrorBoundary
         fallback={
            <div className='p-4'>
               <Alert variant='destructive'>
                  <ExclamationTriangleIcon className='h-4 w-4' />
                  <AlertTitle>Error Starting Playback</AlertTitle>
                  <AlertDescription>
                     Please make sure you have an active Spotify Session and refresh the page.
                  </AlertDescription>
               </Alert>
            </div>
         }
      >
         <Suspense
            fallback={
               <div className='w-full bg-card p-5'>
                  <IndeterminateProgress />
               </div>
            }
         >
            <SpotifyPlayerSync />
         </Suspense>
      </ErrorBoundary>
   )
}

const IndeterminateProgress = () => {
   const [progress, setProgress] = useState(0)
   useEffect(() => {
      const execute = () =>
         setProgress(p => {
            if (p >= 100) return 0
            else return p + 5
         })
      const interval = setInterval(execute, 50)
      return () => clearInterval(interval)
   }, [setProgress])

   return <Progress value={progress} />
}

const SpotifyPlayerSync = () => {
   useSyncNowPlayingLiked()
   useTransferPlaybackOnMount()

   return <SpotifyPlayerFallback />
}

const useSyncNowPlayingLiked = () => {
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
