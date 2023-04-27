import { useLatestPlaybackState } from 'component/sdk/PlaybackSDK'
import { useSetAtom } from 'jotai'
import { Suspense, useEffect } from 'react'
import { nonNullable } from 'util/Utils'
import { SpotifyPlayerFallback } from './SpotifyPlayer'
import { useTransferPlaybackOnMount } from './TransferPlayback'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, AlertSeverity } from 'platform/component/Alert'
import { nowPlayingTrackAtom } from 'state/NowPlayingAtom'

export const SpotifyPlayerWrapper = () => {
   return (
      <ErrorBoundary
         fallback={
            <div className='bg-neutral h-full w-full'>
               <Alert severity={AlertSeverity.Error} className='m-auto w-52'>
                  <span> Error Starting Playback </span>
               </Alert>
            </div>
         }
      >
         <Suspense
            fallback={
               <div className='bg-neutral h-full w-full'>
                  <progress className='progress progress-primary bg-neutral' />
               </div>
            }
         >
            <SpotifyPlayerSync />
         </Suspense>
      </ErrorBoundary>
   )
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
