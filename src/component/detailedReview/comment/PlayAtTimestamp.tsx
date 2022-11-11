import { usePlayTracksMutation } from 'graphql/generated/schema'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

interface PlayAtTimestampProps {
    time: string
    trackId: string
    comment?: string
}

interface StampProps {
    at: string
    comment?: string
}

export const createStamp =
    (trackId: string) =>
        ({ at, comment }: StampProps) =>
            PlayAtTimestamp({ time: at, comment, trackId: trackId })

export function PlayAtTimestamp({ trackId, time, comment }: PlayAtTimestampProps) {
    const padSeconds = (num: number) => num.toString().padStart(2, '0')
    // Timestamp converted to millis if valid.
    const [timestamp, formattedTime] = useMemo(() => {
        const timeSplit = time.split(':')
        if (timeSplit.length === 2) {
            const mins = parseInt(timeSplit[0])
            const seconds = parseInt(timeSplit[1])
            if (isNaN(mins) || mins > 60 || mins < 0 || isNaN(seconds) || seconds > 60 || seconds < 0) {
                return [undefined, undefined]
            }
            return [(mins * 60 + seconds) * 1000, `${mins}:${padSeconds(seconds)}`]
        } else if (timeSplit.length === 1) {
            const seconds = parseInt(timeSplit[0])
            if (!isNaN(seconds) || seconds < 60 || seconds >= 0) {
                return [seconds * 1000, `0:${padSeconds(seconds)}`]
            }
        }
        return [undefined, undefined]
    }, [time])

    const handleError = () => {
        toast.error('Failed to start playback. Please start a playback session and try again.')
    }

    const onSuccess = () => {
        if (timestamp === undefined) {
            toast.error('Successfully started playback from start. Invalid timestamp.')
        }
    }

    const { mutate: playTrack } = usePlayTracksMutation({ onError: handleError, onSuccess })

    // TODO: Eventually we want to play WITH CONTEXT. 
    // It's hard for playlists because we need to check if it is still contained in the playlist
    const onClick = () => {
        playTrack({ input: { trackIds: [trackId], positionMs: timestamp } })
    }

    const text = comment !== undefined ? comment : timestamp ? `@${formattedTime}` : formattedTime
    const internal = (
        <a
            className="link link-base-content link-hover"
            onClick={onClick}
        >
            {text}
        </a>)
    return comment !== undefined ?
        (<a className="tooltip tooltip-bottom link link-base-content link-hover" data-tip={`@${time}`}>
            {internal}
        </a>) :
        internal
}