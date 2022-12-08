import { useDeviceId, useMaybeCurrentTrack } from 'component/playbackSDK/PlaybackSDK'
import { useTransferPlaybackMutation } from 'graphql/generated/schema'
import { useEffect } from 'react'

export const useTransferPlayback = () => {
    const deviceId = useDeviceId()
    const maybePlaying = useMaybeCurrentTrack()

    const { mutate, isLoading } = useTransferPlaybackMutation()
    const transfer = () => {
        mutate({ input: { deviceId } })
    }
    return { transfer, isLoading, isActive: maybePlaying !== null }
}

export const useTransferPlaybackOnMount = () => {
    const { transfer, isActive } = useTransferPlayback()
    useEffect(() => {
        if (!isActive) {
            transfer()
        }
    }, [])
}
