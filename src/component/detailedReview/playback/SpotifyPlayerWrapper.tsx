import { useIsPlayerReady, useLatestPlaybackState, useResetSpotifySdk } from 'component/sdk/PlaybackSDK'
import { useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { nonNullable } from 'util/Utils'
import { SpotifyPlayerFallback } from './SpotifyPlayer'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Alert, AlertTitle, AlertDescription } from 'platform/component/Alert'
import { nowPlayingTrackAtom } from 'state/NowPlayingAtom'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Progress } from 'platform/component/progress'
import { useTransferPlaybackOnMount } from './TransferPlayback'
import { Button } from 'platform/component/Button'

export const SpotifyPlayerWrapper = () => {
   const ready = useIsPlayerReady()

   return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
         {ready ? (
            <SpotifyPlayerSync />
         ) : (
            <div className='w-full bg-card p-5'>
               <IndeterminateProgress />
            </div>
         )}
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
   const [progress, setProgress] = useState(0)
   useEffect(() => {
      const execute = () =>
         setProgress(p => {
            if (p >= 100) return 0
            else return p + 5
         })
      const interval = setInterval(execute, 100)
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
