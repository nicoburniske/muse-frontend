import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { nowPlayingTrackIdAtom } from 'state/NowPlayingAtom'
import { selectedTrackAtom } from 'state/SelectedTrackAtom'

// Only change styling if derived values are different.
export const useTrackColor = (trackId: string) =>
    useAtomValue(useMemo(() => atom(get => {
        const isPlaying = get(nowPlayingTrackIdAtom) === trackId
        const isSelected = get(selectedTrackAtom)?.trackId === trackId

        return isPlaying ? 'bg-success text-success-content' :
            isSelected ? 'bg-info text-info-content' :
                'bg-base-100 text-base-content active:bg-accent active:text-accent-content'
    }), [trackId]))


export const useLikeSvgStyle = (trackId: string) => (isLiked: boolean | undefined) => {
    return useAtomValue(useMemo(() => atom(get => {
        if (isLiked !== undefined) {
            const isPlaying = get(nowPlayingTrackIdAtom) === trackId
            if (isLiked && isPlaying) {
                return 'fill-success-content'
            } else if (isLiked) {
                return 'fill-success'
            } else if (isPlaying) {
                return 'stroke-success-content'
            } else {
                return 'stroke-base-content'
            }
        }
        return ''
    }), [trackId, isLiked]))
}
