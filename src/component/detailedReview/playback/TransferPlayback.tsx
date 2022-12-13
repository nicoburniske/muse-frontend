import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { useDeviceId, useNeedsReconnect, useSpotifyClient, useSpotifyPlayer } from 'component/playbackSDK/PlaybackSDK'
import { useEffect } from 'react'
import { useShouldTransferPlaybackOnMountValue } from 'state/UserPreferences'

export const useTransferPlayback = (options?: UseMutationOptions) => {
    const deviceId = useDeviceId()
    const client = useSpotifyClient()
    const needsReconnect = useNeedsReconnect()

    const transfer = useMutation(['TransferPlayback'],
        () => client.player.transferPlayback(deviceId),
        options
    )

    return { transfer, needsReconnect }
}

export const useTransferPlaybackOnMount = () => {
    const { transfer, needsReconnect } = useTransferPlayback()
    const transferPlayback = useShouldTransferPlaybackOnMountValue()

    const player = useSpotifyPlayer()

    useEffect(() => {
        if (needsReconnect) {
            try {
                player.activateElement()
            } catch { /* empty */ }
            if (transferPlayback) {
                transfer.mutate()
            }
        }
    }, [])
}
