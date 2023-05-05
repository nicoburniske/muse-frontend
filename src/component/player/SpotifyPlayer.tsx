import {
   ArrowPathIcon,
   ArrowPathRoundedSquareIcon,
   ArrowsUpDownIcon,
   BackwardIcon,
   ChevronLeftIcon,
   ChevronRightIcon,
   EllipsisVerticalIcon,
   ForwardIcon,
   HeartIcon,
   MagnifyingGlassIcon,
   PauseIcon,
   PlayIcon,
   PowerIcon,
   SpeakerWaveIcon,
   SpeakerXMarkIcon,
} from '@heroicons/react/24/outline'
import * as Slider from '@radix-ui/react-slider'
import LikeButton from 'component/LikeButton'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useDrag } from 'react-dnd'
import toast from 'react-hot-toast'

import { getLink, useSpotifyIcon } from '@/component/ListenOnSpotify'
import {
   useCurrentPosition,
   useCurrentTrack,
   useExistsPlaybackState,
   useResetSpotifySdk,
   useVolume,
} from '@/component/sdk/PlaybackSDK'
import { usePlayerActions } from '@/component/sdk/usePlayerActions'
import { usePlayerState } from '@/component/sdk/usePlayerState'
import { Button } from '@/lib/component/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/lib/component/DropdownMenu'
import { MuseTransition } from '@/lib/component/MuseTransition'
import { Slider as LibSlider } from '@/lib/component/Slider'
import { Toggle } from '@/lib/component/Toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/lib/component/Tooltip'
import { useTransientAtom } from '@/lib/hook/useTransientAtom'
import { useCurrentReview } from '@/state/CurrentReviewAtom'
import { isPlayingAtom, nowPlayingEnabledAtom, nowPlayingTrackIdAtom } from '@/state/NowPlayingAtom'
import { selectedTrackAtom } from '@/state/SelectedTrackAtom'
import { cn, msToTime } from '@/util/Utils'

import { useTransferPlayback } from './TransferPlayback'

export function SpotifyPlayerFallback() {
   const exists = useExistsPlaybackState()
   if (exists) {
      return (
         <MuseTransition option={'BottomFlyIn'}>
            <SpotifyPlayer />
         </MuseTransition>
      )
   } else {
      return (
         <div className='grid w-full place-items-center rounded border border-accent bg-card text-card-foreground'>
            <div className='py-2'>
               <TransferPlaybackButton />
            </div>
         </div>
      )
   }
}

export function SpotifyPlayer() {
   return (
      <div className='grid h-20 w-full grid-cols-3 justify-between border-t bg-card text-card-foreground md:grid-cols-5'>
         <NowPlayingItem />
         <div className='col-span-2 flex w-full min-w-0 max-w-md grow flex-col items-end justify-center justify-self-center md:col-span-3 lg:max-w-3xl'>
            <div className='flex w-full flex-row items-center justify-evenly'>
               <PlayerButtons />
            </div>
            <PlaybackProgress />
         </div>
         <div className='m-2 hidden place-items-center md:grid'>
            <VolumeSlider />
         </div>
      </div>
   )
}
const NowPlayingItem = () => {
   const { album, artists, id: trackId, name: trackName } = useCurrentTrack()

   // get largest image.
   const nowPlayingImage = album.images.slice().reverse()[0].url
   const nowPlayingArtist = artists.map(a => a.name).join(', ')

   const [{ isDragging }, drag] = useDrag(
      () => ({
         type: 'Track',
         item: { trackId },
         canDrag: true,
         collect: monitor => ({
            isDragging: !!monitor.isDragging(),
         }),
      }),
      [trackId]
   )

   return (
      <div className={cn(' col-span-1 flex select-none items-center justify-start lg:max-w-lg')}>
         <div ref={drag} className={cn('flex min-w-0', isDragging ? 'opacity-20' : '')}>
            <div className='avatar p-1'>
               <div className='w-16'>
                  <img src={nowPlayingImage} />
               </div>
            </div>
            <div className={'flex min-w-0 flex-col justify-center'}>
               <div className='truncate text-left text-xs md:p-0.5 lg:text-base'>{trackName}</div>
               <div className='lg:text-md truncate text-left text-xs md:p-0.5'>{nowPlayingArtist}</div>
            </div>
         </div>
         <NowPlayingMenu />
      </div>
   )
}
const NowPlayingMenu = () => {
   const { id: trackId } = useCurrentTrack()

   const spotifyLink = getLink(trackId ?? undefined, 'Track')
   const spotifyIcon = useSpotifyIcon()
   const resetPlayer = useResetSpotifySdk()

   return (
      <DropdownMenu>
         <DropdownMenuTrigger>
            <div className='ml-2 p-1 hover:bg-accent hover:text-accent-foreground'>
               <EllipsisVerticalIcon className='h-6 w-6' />
            </div>
         </DropdownMenuTrigger>
         <DropdownMenuContent className='text-base'>
            <DropdownMenuItem>
               <a href={spotifyLink} rel='noreferrer' target='_blank' className={cn('flex')}>
                  <img src={spotifyIcon} className={'mr-2 h-4 w-4'} />
                  Listen on Spotify
               </a>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={resetPlayer}>
               <ArrowPathIcon className='mr-2 h-4 w-4' />
               <span>Reset Player</span>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}

const commonBtnClass = ''

const svgStyle = (isLiked: boolean | undefined) => cn(isLiked ? 'fill-primary text-primary' : '', iconClass)

const LikeNowPlaying = () => {
   const nowPlaying = useAtomValue(isPlayingAtom)
   const [getNowPlayingId] = useTransientAtom(nowPlayingTrackIdAtom)

   if (nowPlaying) {
      return (
         <LikeButton
            trackId={getNowPlayingId()!}
            svgStyle={svgStyle}
            options={{ refetchInterval: 10 * 1000 }}
            className={cn(
               commonBtnClass
               // We want the same padding as btn but no border/background.
               // 'border-0 bg-transparent hover:bg-transparent',
               // 'transition-all duration-500 hover:scale-125'
            )}
         />
      )
   } else {
      return (
         <Button variant='svg' size='empty' disabled>
            <HeartIcon className='h-6 w-6' />
         </Button>
      )
   }
}

const PlaybackProgress = () => {
   // Convert to percentage.
   const { seekTo } = usePlayerActions()
   const { durationMs, seekDisabled } = usePlayerState()
   const positionMs = useCurrentPosition(100)
   const progress = Math.min((positionMs / durationMs) * 1000, 1000)
   const [progressState, setProgressState] = useState<[number]>([progress])
   const [isSeeking, setIsSeeking] = useState(false)

   useEffect(() => {
      if (!isSeeking) {
         setProgressState([progress])
      }
   }, [progress, isSeeking])

   const commitChange = async (value: [number]) => {
      const asMillis = Math.floor((value.at(0)! / 1000) * durationMs)
      await seekTo(asMillis)
      // Don't sync with current progress until change has gone through.
      setTimeout(() => setIsSeeking(false), 10)
   }

   // TODO: tooltip with time to change to.
   const handleSeek = (value: number[]) => {
      setIsSeeking(true)
      setProgressState(value as [number])
   }

   const { minutes: minProgress, seconds: secProgress } = msToTime(positionMs)
   const { minutes: minDuration, seconds: secDuration } = msToTime(durationMs)

   return (
      <div className='mt-3 flex w-full flex-row items-center justify-center space-x-1'>
         <span className='countdown font-mono text-sm lg:text-lg'>
            {/* @ts-ignore */}
            <span style={{ '--value': minProgress }}></span>:<span style={{ '--value': secProgress }}></span>
         </span>
         <Slider.Root
            disabled={seekDisabled}
            onValueCommit={commitChange}
            defaultValue={progressState}
            value={progressState}
            onValueChange={handleSeek}
            max={1000}
            step={10}
            aria-label='value'
            className='relative flex h-5 w-5/6 touch-none items-center'
         >
            <Slider.Track className='relative h-3 grow rounded-lg bg-secondary'>
               <Slider.Range className='absolute h-full rounded-lg bg-primary' />
            </Slider.Track>
         </Slider.Root>
         <span className='countdown font-mono text-sm lg:text-lg'>
            {/* @ts-ignore */}
            <span style={{ '--value': minDuration }}></span>:<span style={{ '--value': secDuration }}></span>
         </span>
      </div>
   )
}

const iconClass = 'h-5 w-5 lg:h-6 lg:w-6'
const PlayerButtons = () => {
   const { setShuffle, setRepeatMode, seekBackward, seekForward, previousTrack, nextTrack } = usePlayerActions()

   const {
      isShuffled,
      toggleShuffleDisabled,
      repeatMode,
      repeatModeDisabled,
      seekDisabled,
      prevTrackDisabled,
      nextTrackDisabled,
   } = usePlayerState()

   const { id: trackId } = useCurrentTrack()

   const nowPlayingEnabled = useAtomValue(nowPlayingEnabledAtom)
   // TODO: Need to account for multiple reviews!!
   const setSelectedTrack = useSetAtom(selectedTrackAtom)
   const reviewId = useCurrentReview()
   const selectNowPlaying = () => {
      if (reviewId) {
         setSelectedTrack(undefined)
         setTimeout(() => setSelectedTrack({ trackId: trackId!, reviewId }), 1)
      }
   }

   const toggleShuffle = () => setShuffle(!isShuffled)

   // Spotify Playback SDK is not receiving the change, so I am going to disable it for now.
   // const repeatModeText = repeatMode === 0 ? '' : repeatMode === 1 ? '' : '1'
   // const nextRepeatMode = repeatMode === 0 ? 'context' : repeatMode === 1 ? 'track' : 'off'
   const nextRepeatMode = repeatMode === 0 ? 'context' : 'off'
   const cycleRepeatMode = () => setRepeatMode(nextRepeatMode)

   return (
      <>
         <LikeNowPlaying />
         <Button
            variant='svg'
            size='empty'
            className={cn('muse-finder', commonBtnClass)}
            onClick={selectNowPlaying}
            disabled={!nowPlayingEnabled}
         >
            <MagnifyingGlassIcon className={iconClass} />
         </Button>
         <Button
            variant='svg'
            size='empty'
            onClick={previousTrack}
            disabled={prevTrackDisabled}
            className={cn(commonBtnClass)}
         >
            <BackwardIcon className={iconClass} />
         </Button>
         <Button
            variant='svg'
            size='empty'
            className={cn(commonBtnClass, 'hidden sm:inline-flex ')}
            onClick={seekBackward}
            disabled={seekDisabled}
         >
            <ChevronLeftIcon className={iconClass} />
         </Button>
         <PlayOrTransferButton />
         <Button
            variant='svg'
            size='empty'
            className={cn(commonBtnClass, 'hidden sm:inline-flex ')}
            onClick={seekForward}
            disabled={seekDisabled}
         >
            <ChevronRightIcon className={iconClass} />
         </Button>
         <Button variant='svg' size='empty' onClick={nextTrack} disabled={nextTrackDisabled}>
            <ForwardIcon className={iconClass} />
         </Button>
         <Toggle
            className={cn('hidden sm:inline-flex')}
            onPressedChange={toggleShuffle}
            pressed={isShuffled}
            disabled={toggleShuffleDisabled}
         >
            <ArrowsUpDownIcon className={iconClass} />
         </Toggle>
         <Toggle
            className={cn('hidden sm:inline-flex')}
            onPressedChange={cycleRepeatMode}
            pressed={repeatMode !== 0}
            disabled={repeatModeDisabled}
         >
            <ArrowPathRoundedSquareIcon className={iconClass} />
         </Toggle>
      </>
   )
}

const TransferPlaybackButton = () => {
   const {
      transfer: { mutate, isLoading },
      needsReconnect,
   } = useTransferPlayback({
      onError: () => toast.error('Failed to transfer playback'),
   })

   // Buffer time for playback sdk to be setup.
   const [isReady, setIsReady] = useState(false)
   useEffect(() => {
      setTimeout(() => setIsReady(true), 1000)
   }, [setIsReady])

   const disabled = !isReady || isLoading

   return (
      <TooltipProvider delayDuration={300}>
         <Tooltip>
            <TooltipTrigger asChild>
               <Button
                  size='empty'
                  className={cn('muse-power-on-button p-2', needsReconnect ? 'animate-pulse' : '')}
                  disabled={disabled}
                  onClick={() => mutate()}
               >
                  <PowerIcon className={iconClass} />
               </Button>
            </TooltipTrigger>
            <TooltipContent className='bg-primary text-primary-foreground'>
               <p> Start Player </p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}

const PlayOrTransferButton = () => {
   const { isPlaying, togglePlayDisabled } = usePlayerState()
   const { togglePlay } = usePlayerActions()
   const { needsReconnect } = useTransferPlayback()

   return needsReconnect ? (
      <TransferPlaybackButton />
   ) : (
      <Button
         variant='svg'
         size='empty'
         className={cn('muse-play-button')}
         onClick={togglePlay}
         disabled={togglePlayDisabled}
      >
         {isPlaying ? <PauseIcon className={iconClass} /> : <PlayIcon className={iconClass} />}
      </Button>
   )
}

const VolumeSlider = () => {
   const { disabled, volume, setVolume, toggleMute } = useVolume()

   const asInt = Math.floor(volume * 100)

   const convertAndSetVolume = (newVolume: number[]) => {
      if (newVolume.length > 0) {
         setVolume(newVolume[0] / 100)
      }
   }

   const isMuted = volume === 0
   const onClick = () => toggleMute(undefined)
   return (
      <div className='flex w-full grow flex-row items-center'>
         <Button
            variant='svg'
            size='empty'
            onClick={onClick}
            className={cn(commonBtnClass, 'mr-1')}
            disabled={disabled}
         >
            {isMuted ? <SpeakerXMarkIcon className='h-6 w-6' /> : <SpeakerWaveIcon className='h-6 w-6' />}
         </Button>
         <LibSlider
            disabled={disabled}
            defaultValue={[asInt]}
            max={100}
            step={1}
            onValueChange={e => convertAndSetVolume(e)}
         />
      </div>
   )
}
