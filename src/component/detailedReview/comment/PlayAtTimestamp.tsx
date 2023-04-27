import { usePlayMutation } from 'component/sdk/ClientHooks'
import { Button } from 'platform/component/Button'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { padTime } from 'util/Utils'

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
   // Timestamp converted to millis if valid.
   const [timestamp, formattedTime] = useMemo(() => {
      const timeSplit = time.split(':')
      if (timeSplit.length === 2) {
         const mins = parseInt(timeSplit[0])
         const seconds = parseInt(timeSplit[1])
         if (isNaN(mins) || mins > 60 || mins < 0 || isNaN(seconds) || seconds > 60 || seconds < 0) {
            return [undefined, undefined]
         }
         return [(mins * 60 + seconds) * 1000, `${mins}:${padTime(seconds)}`]
      } else if (timeSplit.length === 1) {
         const seconds = parseInt(timeSplit[0])
         if (!isNaN(seconds) || seconds < 60 || seconds >= 0) {
            return [seconds * 1000, `0:${padTime(seconds)}`]
         }
      }
      return [undefined, undefined]
   }, [time])

   const { playTrackOffset } = usePlayMutation({
      onError: () => toast.error('Failed to play at timestamp.'),
   })

   // TODO: Eventually we want to play WITH CONTEXT.
   // It's hard for playlists because we need to check if it is still contained in the playlist
   const onClick = () => playTrackOffset(trackId, timestamp)

   // Only want to include tooltip if there is a comment.
   const text = comment !== undefined ? comment : timestamp !== undefined ? `@${formattedTime}` : formattedTime

   return (
      <Button type='button' variant='link' size='empty' className='text-foreground' onClick={onClick}>
         {text}
      </Button>
   )
}
