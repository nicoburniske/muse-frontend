import { HeartOutlineIcon, MutedSpeakerIcon, NextTrackIcon, PauseIcon, PlayIcon, PowerIcon, PreviousTrackIcon, RepeatIcon, SearchIcon, ShuffleIcon, SkipBackwardIcon, SkipForwardIcon, SpeakerIcon } from 'component/Icons'
import LikeButton from 'component/LikeButton'
import { EntityType, useCreateCommentMutation, useDetailedReviewCommentsQuery } from 'graphql/generated/schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ChangeEvent, useEffect, useState } from 'react'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { isPlayingAtom, nowPlayingEnabledAtom, nowPlayingTrackAtom, nowPlayingTrackIdAtom, selectedTrackAtom } from 'state/Atoms'
import { classNames, msToTime, msToTimeStr } from 'util/Utils'
import * as Slider from '@radix-ui/react-slider'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrentTrack, useVolume, usePlayerActions, useExistsPlaybackState, useCurrentPosition } from 'component/playbackSDK/PlaybackSDK'
import { useTransferPlayback } from './TransferPlayback'
import { useCommentModal } from '../commentForm/CommentFormModalWrapper'
import { useTransientAtom } from 'hook/useTransientAtom'
import { MuseTransition } from 'component/transitions/MuseTransition'
import { currentReviewAtom, useCurrentReview } from 'state/CurrentReviewAtom'
import { useDrag } from 'react-dnd'


export function SpotifyPlayerFallback() {
    const exists = useExistsPlaybackState()
    if (exists) {
        return (
            <MuseTransition option={'BottomFlyIn'} >
                <SpotifyPlayer />
            </MuseTransition>
        )
    } else {
        return (
            <div className="grid place-items-center w-full border border-accent rounded bg-neutral">
                <div className="py-2">
                    <TransferPlaybackButton />
                </div>
            </div>
        )
    }
}

export function SpotifyPlayer() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 rounded w-full border border-accent bg-neutral">
            <NowPlayingItem />
            <div className="sm:col-span-2 flex flex-col justify-center items-center rounded-lg w-full">
                <div className="flex flex-row justify-evenly items-center text-neutral-content w-full">
                    <PlayerButtons />
                </div>
                <PlaybackProgress />
            </div>
            <div className="hidden lg:grid lg:col-span-1 place-items-center m-1">
                <VolumeSlider />
            </div>
        </div >
    )
}
const NowPlayingItem = () => {
    const {
        album,
        artists,
        id: trackId,
        name: trackName,
    } = useCurrentTrack()

    const { getCurrentPositionMs } = usePlayerActions()

    // get largest image.
    const nowPlayingImage = album.images.slice().reverse()[0].url
    const nowPlayingArtist = artists.map(a => a.name).join(', ')

    const { openCommentModal, closeCommentModal } = useCommentModal()

    const { mutateAsync: createComment } = useCreateCommentMutation({
        onSuccess: () => { toast.success('comment created'); closeCommentModal() },
        onError: () => toast.error('failed to create comment')
    })

    const queryClient = useQueryClient()
    const reviewId = useCurrentReview()
    const onSubmit = async (comment: string) => {
        if (reviewId) {
            await createComment({ input: { comment, entities: [{ entityType: EntityType.Track, entityId: trackId! }], reviewId } })
            queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
        }
    }

    const showModal = () => {
        const { minutes, seconds } = msToTimeStr(getCurrentPositionMs())
        const initialValue = `<Stamp at="${minutes}:${seconds}" />`
        const values = { title: 'create comment', onCancel: () => closeCommentModal(), onSubmit, initialValue, trackId: trackId! }
        openCommentModal(values)
    }

    const nowPlayingEnabled = useAtomValue(useMemo(() => atom(get => get(nowPlayingEnabledAtom) && get(currentReviewAtom) !== undefined), []))
    const tooltipContent = useAtomValue(useMemo(() => atom(get => get(nowPlayingEnabledAtom) ? 'Comment at timestamp' : ''), []))

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'Track',
        item: { trackId },
        canDrag: true,
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [trackId])

    return (
        <div
            ref={drag}
            className={classNames(
                'flex flex-row px-1 items-center select-none',
                isDragging ? 'opacity-20' : 'bg-neutral'
            )}
        >
            <button
                className={classNames('hidden sm:grid place-items-center p-1', nowPlayingEnabled ? 'tooltip tooltip-right' : '')}
                data-tip={tooltipContent} onClick={showModal} disabled={!nowPlayingEnabled} >
                <div className="avatar" >
                    <div className="w-12 md:w-16 lg:w-20 rounded">
                        <img loading='lazy' src={nowPlayingImage} />
                    </div>
                </div>
            </button>
            <div className={'flex flex-col justify-around overflow-hidden'}>
                <div className="text-left truncate md:p-0.5 prose text-neutral-content text-xs lg:text-md"> {trackName} </div>
                <div className="text-left truncate md:p-0.5 prose text-neutral-content text-xs lg:text-md"> {nowPlayingArtist} </div>
            </div>
        </div >
    )
}

const commonBtnClass = 'btn btn-sm lg:btn-md neutral-focus p-0'
const commonBtnClassExtra = (extraClasses?: (string | undefined)[]) => {
    const valid = extraClasses?.filter(c => c !== undefined)
    return valid ? `${commonBtnClass} ${valid.join(' ')}` : commonBtnClass
}

const LikeNowPlaying = () => {
    const likeAtom = useMemo(() => atom(get => {
        const nowPlaying = get(nowPlayingTrackAtom)
        if (nowPlaying) {
            return nowPlaying.isLiked
        }
        return false
    }, (_get, _set, newValue) => newValue),
    [])

    const svgClassAtom = useMemo(() => atom(get => get(likeAtom) ? 'fill-success' : ''), [])
    const nowPlaying = useAtomValue(isPlayingAtom)
    const [getNowPlayingId] = useTransientAtom(nowPlayingTrackIdAtom)

    if (nowPlaying) {
        return (
            <LikeButton
                trackId={getNowPlayingId()!}
                likeAtom={likeAtom}
                className={commonBtnClassExtra(['btn-ghost'])}
                svgClass={svgClassAtom}
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
    const positionMs = useCurrentPosition(1000)
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
        <div className="flex flex-row text-neutral-content items-center justify-center space-x-1 p-1 w-full">
            <span className="countdown font-mono text-sm lg:text-lg">
                <span style={{ '--value': minProgress }}></span>:
                <span style={{ '--value': secProgress }}></span>
            </span>
            <Slider.Root
                disabled={seekDisabled}
                onValueCommit={commitChange}
                defaultValue={progressState}
                value={progressState}
                onValueChange={handleSeek}
                max={1000}
                step={10}
                aria-label="value"
                className="relative flex h-5 w-5/6 touch-none items-center"
            >
                <Slider.Track className="relative h-3 grow rounded-full bg-neutral-focus">
                    <Slider.Range className="absolute h-full rounded-full bg-success" />
                </Slider.Track>
            </Slider.Root>
            <span className="countdown font-mono text-sm lg:text-lg">
                <span style={{ '--value': minDuration }}></span>:
                <span style={{ '--value': secDuration }}></span>
            </span>
        </div>)
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
        nextTrack
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
    const successButton = commonBtnClassExtra(['btn-success'])
    const shuffleButtonClass = isShuffled ? successButton : commonBtnClass

    const repeatModeColor = repeatMode !== 0 ? successButton : commonBtnClass
    const nextRepeatMode = repeatMode !== 0 ? 'off' : 'context'
    const cycleRepeatMode = () => setRepeatMode(nextRepeatMode)

    return (
        <>
            <LikeNowPlaying />
            <button className={commonBtnClass} onClick={selectNowPlaying} disabled={!nowPlayingEnabled}><SearchIcon /></button>
            <button className={commonBtnClass} onClick={previousTrack} disabled={prevTrackDisabled}><PreviousTrackIcon /></button>
            <button className={commonBtnClass} onClick={seekBackward} disabled={seekDisabled}><SkipBackwardIcon /></button>
            <PlayOrTransferButton />
            <button className={commonBtnClass} onClick={seekForward} disabled={seekDisabled}><SkipForwardIcon /></button>
            <button className={commonBtnClass} onClick={nextTrack} disabled={nextTrackDisabled}><NextTrackIcon /></button>
            <button className={shuffleButtonClass} onClick={toggleShuffle} disabled={toggleShuffleDisabled}><ShuffleIcon /></button>
            <button className={repeatModeColor} onClick={cycleRepeatMode} disabled={repeatModeDisabled}><RepeatIcon /></button>
        </>
    )
}

const TransferPlaybackButton = () => {
    const { transfer: { mutate, isLoading }, needsReconnect } = useTransferPlayback({
        onError: () => toast.error('Failed to transfer playback')
    })
    const extraClasses = [needsReconnect ? 'btn-success tooltip tooltip-accent' : undefined, isLoading ? 'loading' : undefined]
    const className = commonBtnClassExtra(extraClasses)

    return (
        <button className={className} disabled={!needsReconnect} onClick={() => mutate()} data-tip="start">
            <PowerIcon />
        </button>
    )
}

const PlayOrTransferButton = () => {
    const {
        isPlaying,
        togglePlayDisabled,
        togglePlay,
    } = usePlayerActions()
    const { needsReconnect } = useTransferPlayback()

    return (
        needsReconnect ?
            <TransferPlaybackButton />
            :
            <button className={commonBtnClass} onClick={togglePlay} disabled={togglePlayDisabled}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button >
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
        <div className="flex flex-row items-center w-full">
            <button onClick={onClick} className={commonBtnClass} disabled={disabled}>
                {isMuted ? <MutedSpeakerIcon /> : <SpeakerIcon />}
            </button>

            <input
                type="range"
                className="range range-primary bg-primary/50"
                disabled={disabled}
                min={0} max={100} step={1}
                value={asInt}
                onChange={e => convertAndSetVolume(e)}
            />
        </div>
    )
}
