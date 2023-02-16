import { MutedSpeakerIcon, SpeakerIcon } from 'component/Icons'
import LikeButton from 'component/LikeButton'
import { useAtomValue, useSetAtom } from 'jotai'
import { ChangeEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { cn, msToTime } from 'util/Utils'
import * as Slider from '@radix-ui/react-slider'
import { useCurrentTrack, useVolume, useExistsPlaybackState, useCurrentPosition } from 'component/sdk/PlaybackSDK'
import { useTransferPlayback } from './TransferPlayback'
import { useTransientAtom } from 'platform/hook/useTransientAtom'
import { MuseTransition } from 'platform/component/MuseTransition'
import { useCurrentReview } from 'state/CurrentReviewAtom'
import { useDrag } from 'react-dnd'
import { usePlayerActions } from 'component/sdk/PlayerActions'
import { isPlayingAtom, nowPlayingEnabledAtom, nowPlayingTrackIdAtom } from 'state/NowPlayingAtom'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'
import {
   BackwardIcon,
   ChevronLeftIcon,
   ChevronRightIcon,
   ForwardIcon,
   PauseIcon,
   PlayIcon,
   HeartIcon,
   PowerIcon,
   ArrowsUpDownIcon,
   MagnifyingGlassIcon,
   ArrowPathRoundedSquareIcon,
} from '@heroicons/react/24/outline'
import { ListenOnSpotifyTooltip } from 'component/ListenOnSpotify'

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
         <div className='grid w-full place-items-center rounded border border-accent bg-neutral'>
            <div className='py-2'>
               <TransferPlaybackButton />
            </div>
         </div>
      )
   }
}

export function SpotifyPlayer() {
   return (
      <div className='grid h-20 w-full grid-cols-3 justify-between bg-neutral md:grid-cols-5'>
         <NowPlayingItem />
         <div className='col-span-2 flex w-full min-w-0 max-w-md grow flex-col items-end justify-center justify-self-center md:col-span-3 lg:max-w-3xl'>
            <div className='flex w-full flex-row items-center justify-evenly text-neutral-content'>
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

   // const nowPlayingEnabled = useAtomValue(
   //    useMemo(() => atom(get => get(nowPlayingEnabledAtom) && get(currentReviewAtom) !== undefined), [])
   // )

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
      <div className={cn('col-span-1 flex select-none items-center justify-start lg:max-w-lg ')}>
         <div ref={drag} className={cn('flex min-w-0', isDragging ? 'opacity-20' : 'bg-neutral')}>
            <div className='avatar p-1'>
               <div className='w-16'>
                  <img src={nowPlayingImage} />
               </div>
            </div>
            <div className={'flex min-w-0 flex-col justify-center'}>
               <div className='truncate text-left text-xs text-neutral-content md:p-0.5 lg:text-base'>{trackName}</div>
               <div className='lg:text-md prose truncate text-left text-xs text-neutral-content md:p-0.5'>
                  {nowPlayingArtist}
               </div>
            </div>
         </div>

         <ListenOnSpotifyTooltip entityType='Track' entityId={trackId ?? undefined} className='ml-2 flex-none' />
      </div>
   )
}

const commonBtnClass = 'btn btn-md btn-square'

const svgStyle = (isLiked: boolean | undefined) => cn(isLiked ? 'fill-success text-success' : '', iconClass)

const LikeNowPlaying = () => {
   const nowPlaying = useAtomValue(isPlayingAtom)
   const [getNowPlayingId] = useTransientAtom(nowPlayingTrackIdAtom)

   if (nowPlaying) {
      return (
         <LikeButton
            trackId={getNowPlayingId()!}
            svgStyle={svgStyle}
            options={{ refetchInterval: 10 * 1000 }}
            className={'transition-all duration-500 hover:scale-125'}
         />
      )
   } else {
      return (
         <button className={commonBtnClass} disabled={true}>
            <HeartIcon className='h-6 w-6' />
         </button>
      )
   }
}

const PlaybackProgress = () => {
   // Convert to percentage.
   const { durationMs, seekTo, seekDisabled } = usePlayerActions()
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
      <div className='flex w-full flex-row items-center justify-center space-x-1 p-1 text-neutral-content'>
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
            <Slider.Track className='relative h-3 grow rounded-full bg-neutral-focus'>
               <Slider.Range className='absolute h-full rounded-full bg-success' />
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
   const {
      isShuffled,
      toggleShuffleDisabled,
      setShuffle,

      repeatMode,
      repeatModeDisabled,
      setRepeatMode,

      seekDisabled,
      seekBackward,
      seekForward,

      prevTrackDisabled,
      previousTrack,
      nextTrackDisabled,
      nextTrack,
   } = usePlayerActions()
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
   const successButton = cn(commonBtnClass, 'btn-success')
   const shuffleButtonClass = isShuffled ? successButton : commonBtnClass

   const repeatModeClass = repeatMode !== 0 ? successButton : commonBtnClass
   // This isn't working as intended.
   // Spotify Playback SDK is not receiving the change, so I am going to disable it for now.
   // const repeatModeText = repeatMode === 0 ? '' : repeatMode === 1 ? '' : '1'
   // const nextRepeatMode = repeatMode === 0 ? 'context' : repeatMode === 1 ? 'track' : 'off'
   const nextRepeatMode = repeatMode === 0 ? 'context' : 'off'
   const cycleRepeatMode = () => setRepeatMode(nextRepeatMode)

   return (
      <>
         <LikeNowPlaying />
         <button className={cn(commonBtnClass)} onClick={selectNowPlaying} disabled={!nowPlayingEnabled}>
            <MagnifyingGlassIcon className={iconClass} />
         </button>
         <button className={commonBtnClass} onClick={previousTrack} disabled={prevTrackDisabled}>
            <BackwardIcon className={iconClass} />
         </button>
         <button
            className={cn(commonBtnClass, 'hidden sm:inline-flex ')}
            onClick={seekBackward}
            disabled={seekDisabled}
         >
            <ChevronLeftIcon className={iconClass} />
         </button>
         <PlayOrTransferButton />
         <button className={cn(commonBtnClass, 'hidden sm:inline-flex ')} onClick={seekForward} disabled={seekDisabled}>
            <ChevronRightIcon className={iconClass} />
         </button>
         <button className={commonBtnClass} onClick={nextTrack} disabled={nextTrackDisabled}>
            <ForwardIcon className={iconClass} />
         </button>
         <button
            className={cn(shuffleButtonClass, 'hidden sm:inline-flex ')}
            onClick={toggleShuffle}
            disabled={toggleShuffleDisabled}
         >
            <ArrowsUpDownIcon className={iconClass} />
         </button>
         <button
            className={cn(repeatModeClass, 'hidden sm:inline-flex ')}
            onClick={cycleRepeatMode}
            disabled={repeatModeDisabled}
         >
            <ArrowPathRoundedSquareIcon className={iconClass} />
         </button>
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
   const className = cn(
      commonBtnClass,
      needsReconnect ? 'btn-success tooltip tooltip-accent' : undefined,
      isLoading ? 'loading' : undefined,
      'grid place-items-center'
   )

   // Buffer time for playback sdk to be setup.
   const [isReady, setIsReady] = useState(false)
   useEffect(() => {
      setTimeout(() => setIsReady(true), 1000)
   }, [setIsReady])

   const disabled = !isReady || isLoading

   return (
      <button className={className} disabled={disabled} onClick={() => mutate()} data-tip='start playback'>
         <PowerIcon className={iconClass} />
      </button>
   )
}

const PlayOrTransferButton = () => {
   const { isPlaying, togglePlayDisabled, togglePlay } = usePlayerActions()
   const { needsReconnect } = useTransferPlayback()

   return needsReconnect ? (
      <TransferPlaybackButton />
   ) : (
      <button className={commonBtnClass} onClick={togglePlay} disabled={togglePlayDisabled}>
         {isPlaying ? <PauseIcon className={iconClass} /> : <PlayIcon className={iconClass} />}
      </button>
   )
}

const VolumeSlider = () => {
   const { disabled, volume, setVolume, toggleMute } = useVolume()

   const asInt = Math.floor(volume * 100)

   const convertAndSetVolume = (e: ChangeEvent<HTMLInputElement>) => {
      const newVolumeInt = parseInt(e.currentTarget.value)
      setVolume(newVolumeInt / 100)
   }

   const isMuted = volume === 0
   const onClick = () => toggleMute(undefined)
   return (
      <div className='flex w-full grow flex-row items-center'>
         <button onClick={onClick} className={commonBtnClass} disabled={disabled}>
            {isMuted ? <MutedSpeakerIcon /> : <SpeakerIcon />}
         </button>

         <input
            type='range'
            className='range range-primary bg-primary/50'
            disabled={disabled}
            min={0}
            max={100}
            step={1}
            value={asInt}
            onChange={e => convertAndSetVolume(e)}
         />
      </div>
   )
}
