import { useMutation } from '@tanstack/react-query'
import { useDeviceId, useNeedsReconnect, useSpotifyClient, useSpotifyPlayer } from 'component/playbackSDK/PlaybackSDK'
import { useEffect } from 'react'

export const useTransferPlayback = () => {
    const deviceId = useDeviceId()
    const client = useSpotifyClient()
    const needsReconnect = useNeedsReconnect()

    const { mutate, isLoading } = useMutation(['TransferPlayback'],
        async () => client.transferPlayback({ deviceId })
    )

    return { transfer: mutate, isLoading, needsReconnect }
}

export const useTransferPlaybackOnMount = () => {
    const { transfer, needsReconnect } = useTransferPlayback()
    const player = useSpotifyPlayer()

    useEffect(() => {
        if (needsReconnect) {
            try {
                player.activateElement()
            } catch { /* empty */ }
            transfer()
        }
    }, [])
}
