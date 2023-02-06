import {
   HeartOutlineIcon,
   MutedSpeakerIcon,
   NextTrackIcon,
   PauseIcon,
   PlayIcon,
   PowerIcon,
   PreviousTrackIcon,
   RepeatIcon,
   SearchIcon,
   ShuffleIcon,
   SkipBackwardIcon,
   SkipForwardIcon,
   SpeakerIcon,
} from 'component/Icons'
import LikeButton from 'component/LikeButton'
import { EntityType, useCreateCommentMutation, useDetailedReviewCommentsQuery } from 'graphql/generated/schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ChangeEvent, useEffect, useState } from 'react'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { classNames, msToTime, msToTimeStr } from 'util/Utils'
import * as Slider from '@radix-ui/react-slider'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrentTrack, useVolume, useExistsPlaybackState, useCurrentPosition } from 'component/sdk/PlaybackSDK'
import { useTransferPlayback } from './TransferPlayback'
import { useCommentModal } from '../commentForm/CommentFormModalWrapper'
import { useTransientAtom } from 'platform/hook/useTransientAtom'
import { MuseTransition } from 'platform/component/MuseTransition'
import { currentReviewAtom, useCurrentReview } from 'state/CurrentReviewAtom'
import { useDrag } from 'react-dnd'
import { usePlayerActions } from 'component/sdk/PlayerActions'
import { isPlayingAtom, nowPlayingEnabledAtom, nowPlayingTrackIdAtom } from 'state/NowPlayingAtom'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'

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
      <div className='flex h-20 w-full justify-between rounded border border-accent bg-neutral'>
         <NowPlayingItem />
         <div className='flex grow basis-1/2 flex-col items-end justify-center rounded-lg'>
            <div className='flex w-full flex-row items-center justify-evenly text-neutral-content'>
               <PlayerButtons />
            </div>
            <PlaybackProgress />
         </div>
         <div className='m-2 hidden basis-1/4 place-items-center lg:grid'>
            <VolumeSlider />
         </div>
      </div>
   )
}
const NowPlayingItem = () => {
   const { album, artists, id: trackId, name: trackName } = useCurrentTrack()

   const { getCurrentPositionMs } = usePlayerActions()

   // get largest image.
   const nowPlayingImage = album.images.slice().reverse()[0].url
   const nowPlayingArtist = artists.map(a => a.name).join(', ')

   const { openCommentModal, closeCommentModal } = useCommentModal()

   const { mutateAsync: createComment } = useCreateCommentMutation({
      onSuccess: () => {
         toast.success('comment created')
         closeCommentModal()
      },
      onError: () => toast.error('failed to create comment'),
   })

   const queryClient = useQueryClient()
   const reviewId = useCurrentReview()
   const onSubmit = async (comment: string) => {
      if (reviewId) {
         await createComment({
            input: { comment, entities: [{ entityType: EntityType.Track, entityId: trackId! }], reviewId },
         })
         queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
      }
   }

   const showModal = () => {
      const { minutes, seconds } = msToTimeStr(getCurrentPositionMs())
      const initialValue = `<Stamp at="${minutes}:${seconds}" />`
      const values = {
         title: 'Create Comment',
         onCancel: () => closeCommentModal(),
         onSubmit,
         initialValue,
         trackId: trackId!,
      }
      openCommentModal(values)
   }

   const nowPlayingEnabled = useAtomValue(
      useMemo(() => atom(get => get(nowPlayingEnabledAtom) && get(currentReviewAtom) !== undefined), [])
   )
   const tooltipContent = useAtomValue(
      useMemo(() => atom(get => (get(nowPlayingEnabledAtom) ? 'Comment at timestamp' : '')), [])
   )

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
      <div
         ref={drag}
         className={classNames(
            'flex max-w-sm basis-1/4 select-none flex-row items-center justify-start lg:max-w-lg ',
            isDragging ? 'opacity-20' : 'bg-neutral'
         )}
      >
         <button
            className={classNames(
               'hidden place-items-center p-1 sm:grid',
               nowPlayingEnabled ? 'tooltip tooltip-right tooltip-primary' : ''
            )}
            data-tip={tooltipContent}
            onClick={showModal}
            disabled={!nowPlayingEnabled}
         >
            <div className='avatar'>
               <div className='w-16 rounded'>
                  <img src={nowPlayingImage} />
               </div>
            </div>
         </button>
         <div className={'flex flex-col justify-around overflow-hidden'}>
            <div className='truncate text-left text-xs text-neutral-content md:p-0.5 lg:text-base'>{trackName}</div>
            <div className='lg:text-md prose truncate text-left text-xs text-neutral-content md:p-0.5'>
               {nowPlayingArtist}
            </div>
         </div>
      </div>
   )
}

const commonBtnClass = 'btn btn-sm lg:btn-md p-0'

const svgStyle = (isLiked: boolean | undefined) => (isLiked ? 'fill-success text-success' : '')

const LikeNowPlaying = () => {
   const nowPlaying = useAtomValue(isPlayingAtom)
   const [getNowPlayingId] = useTransientAtom(nowPlayingTrackIdAtom)

   if (nowPlaying) {
      return (
         <LikeButton
            trackId={getNowPlayingId()!}
            svgStyle={svgStyle}
            options={{ refetchInterval: 10 * 1000 }}
            className={classNames(commonBtnClass, 'btn-ghost')}
         />
      )
   } else {
      return (
         <button className={commonBtnClass} disabled={true}>
            <HeartOutlineIcon />
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
            <span style={{ '--value': minDuration }}></span>:<span style={{ '--value': secDuration }}></span>
         </span>
      </div>
   )
}

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
   const successButton = classNames(commonBtnClass, 'btn-success')
   const shuffleButtonClass = isShuffled ? successButton : commonBtnClass

   const repeatModeClass = repeatMode !== 0 ? successButton : commonBtnClass
   const nextRepeatMode = repeatMode !== 0 ? 'off' : 'context'
   const cycleRepeatMode = () => setRepeatMode(nextRepeatMode)

   return (
      <>
         <LikeNowPlaying />
         <button className={classNames(commonBtnClass)} onClick={selectNowPlaying} disabled={!nowPlayingEnabled}>
            <SearchIcon />
         </button>
         <button className={commonBtnClass} onClick={previousTrack} disabled={prevTrackDisabled}>
            <PreviousTrackIcon />
         </button>
         <button
            className={classNames(commonBtnClass, 'hidden sm:inline-flex ')}
            onClick={seekBackward}
            disabled={seekDisabled}
         >
            <SkipBackwardIcon />
         </button>
         <PlayOrTransferButton />
         <button
            className={classNames(commonBtnClass, 'hidden sm:inline-flex ')}
            onClick={seekForward}
            disabled={seekDisabled}
         >
            <SkipForwardIcon />
         </button>
         <button className={commonBtnClass} onClick={nextTrack} disabled={nextTrackDisabled}>
            <NextTrackIcon />
         </button>
         <button
            className={classNames(shuffleButtonClass, 'hidden sm:inline-flex ')}
            onClick={toggleShuffle}
            disabled={toggleShuffleDisabled}
         >
            <ShuffleIcon />
         </button>
         <button
            className={classNames(repeatModeClass, 'hidden sm:inline-flex ')}
            onClick={cycleRepeatMode}
            disabled={repeatModeDisabled}
         >
            <RepeatIcon />
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
   const className = classNames(
      commonBtnClass,
      needsReconnect ? 'btn-success tooltip tooltip-accent' : undefined,
      isLoading ? 'loading' : undefined
   )

   return (
      <button className={className} disabled={!needsReconnect} onClick={() => mutate()} data-tip='start'>
         <PowerIcon />
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
         {isPlaying ? <PauseIcon /> : <PlayIcon />}
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
