import { HeartOutlineIcon, NextTrackIcon, PauseIcon, PlayIcon, PreviousTrackIcon, RepeatIcon, SearchIcon, ShuffleIcon, SkipBackwardIcon, SkipForwardIcon } from 'component/Icons'
import LikeButton from 'component/LikeButton'
import { EntityType, useCreateCommentMutation, useDetailedReviewCommentsQuery } from 'graphql/generated/schema'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { nowPlayingEnabledAtom, nowPlayingTrackAtom, openCommentModalAtom, selectedTrackAtom } from 'state/Atoms'
import { msToTime } from 'util/Utils'
import * as Slider from '@radix-ui/react-slider'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrentTrack, useVolume, usePlayerActions } from 'component/playbackSDK/PlaybackSDK'

interface PlaybackTimeProps {
    reviewId: string
}

const commonBtnClass = 'btn btn-sm lg:btn-md neutral-focus p-0'

export function PlaybackTime({ reviewId }: PlaybackTimeProps) {
    const {
        album,
        artists,
        id: trackId,
        name: trackName,
    } = useCurrentTrack()

    // get largest image.
    const nowPlayingImage = album.images.slice().reverse()[0].url
    const nowPlayingArtist = artists.map(a => a.name).join(', ')

    const setCommentModal = useSetAtom(openCommentModalAtom)
    const { mutateAsync: createComment } = useCreateCommentMutation({
        onSuccess: () => { toast.success('comment created'); setCommentModal(undefined) },
        onError: () => toast.error('failed to create comment')
    })

    const queryClient = useQueryClient()
    const onSubmit = async (comment: string) => {
        await createComment({ input: { comment, entities: [{ entityType: EntityType.Track, entityId: trackId! }], reviewId } })
        queryClient.invalidateQueries({ queryKey: useDetailedReviewCommentsQuery.getKey({ reviewId }) })
    }

    const { positionMs } = usePlayerActions()
    const { minutes, seconds } = msToTime(positionMs)
    const showModal = () => {
        const initialValue = `<Stamp at="${minutes}:${seconds}" />`
        const values = { title: 'create comment', onCancel: () => setCommentModal(undefined), onSubmit, initialValue, trackId: trackId! }
        setCommentModal(values)
    }

    const nowPlayingEnabled = useAtomValue(nowPlayingEnabledAtom)
    const tooltipContent = useMemo(() => nowPlayingEnabled ? 'Comment at timestamp' : 'Not part of this review', [nowPlayingEnabled])

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 rounded-xl w-full h-full border-accent border bg-neutral">
            <div className='flex flex-row px-1 items-center h-full'>
                <button className="hidden sm:grid place-items-center tooltip tooltip-right p-1" data-tip={tooltipContent} onClick={showModal} disabled={!nowPlayingEnabled} >
                    <div className="avatar" >
                        <div className="w-12 md:w-16 lg:w-20 rounded">
                            <img loading='lazy' src={nowPlayingImage} />
                        </div>
                    </div>
                </button>
                <div className={'flex flex-col justify-around'}>
                    <div className="text-left truncate md:p-0.5 prose text-neutral-content text-xs lg:text-md"> {trackName} </div>
                    <div className="text-left truncate md:p-0.5 prose text-neutral-content text-xs lg:text-md"> {nowPlayingArtist} </div>
                </div>
            </div>
            <div className="sm:col-span-2 flex flex-col justify-center items-center rounded-lg w-full">
                <div className="flex flex-row justify-evenly items-center text-neutral-content w-full">
                    <PlayerButtons reviewId={reviewId} />
                </div>
                <PlaybackProgress />
            </div>
            <div className="hidden lg:grid lg:col-span-1 place-items-center m-1">
                <VolumeSlider />
            </div>
        </div >
    )
}

const LikeNowPlaying = () => {
    const nowPlaying = useAtomValue(nowPlayingTrackAtom)
    const calculateSvgStyle = (isLiked: boolean) => isLiked ? 'fill-success' : ''
    if (nowPlaying) {
        const likeAtom = atom(nowPlaying.isLiked!)
        return (
            <LikeButton
                trackId={nowPlaying.trackId}
                likeAtom={likeAtom}
                className={commonBtnClass}
                getSvgClassName={calculateSvgStyle}
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
    const { positionMs, durationMs, seekTo } = usePlayerActions()
    const progress = (positionMs / durationMs) * 1000
    const [progressState, setProgressState] = useState<[number] | undefined>([progress])
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


const PlayerButtons = ({ reviewId }: { reviewId: string }) => {
    const {
        isPlaying,
        isShuffled,
        togglePlayDisabled,
        togglePlay,
        seekDisabled,
        seekBackward,
        seekForward,
        prevTrackDisabled,
        previousTrack,
        nextTrackDisabled,
        nextTrack
    } = usePlayerActions()
    const { id: trackId } = useCurrentTrack()

    const toggleShuffle = () => { }
    const shuffleButtonClass = isShuffled ? commonBtnClass + ' btn btn-success' : commonBtnClass

    const setSelectedTrack = useSetAtom(selectedTrackAtom)
    const selectNowPlaying = () => {
        setSelectedTrack(undefined)
        setTimeout(() => setSelectedTrack({ trackId: trackId!, reviewId }), 1)
    }

    const nowPlayingEnabled = useAtomValue(nowPlayingEnabledAtom)

    return (
        <>
            <LikeNowPlaying />
            <button className={commonBtnClass} onClick={selectNowPlaying} disabled={!nowPlayingEnabled}>
                <SearchIcon />
            </button>
            <button className={commonBtnClass} onClick={previousTrack} disabled={prevTrackDisabled}><PreviousTrackIcon /></button>
            <button className={commonBtnClass} onClick={seekBackward} disabled={seekDisabled}><SkipBackwardIcon /></button>
            <button className={commonBtnClass} onClick={togglePlay} disabled={togglePlayDisabled}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button className={commonBtnClass} onClick={seekForward} disabled={seekDisabled}><SkipForwardIcon /></button>
            <button className={commonBtnClass} onClick={nextTrack} disabled={nextTrackDisabled}><NextTrackIcon /></button>
            <button className={shuffleButtonClass} onClick={() => toggleShuffle()} ><ShuffleIcon /></button>
            <button className={commonBtnClass}><RepeatIcon /></button>
        </>
    )
}

const VolumeSlider = () => {
    const [volume, setVolume] = useVolume()

    const asInt = Math.floor(volume * 100)

    const convertAndSetVolume = (newVolumeInt: number) => {
        setVolume(newVolumeInt / 100)
    }

    return (
        <input type="range" className="range range-primary"
            min={1} max={100} value={asInt} step={1}
            onChange={e => { convertAndSetVolume(parseInt(e.currentTarget.value)) }}
        />
    )
}
