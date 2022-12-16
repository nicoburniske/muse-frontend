// Seperating these out is better for performance. 
// Single derived atom is an array therefore it will be recomputed every time the list changes.

import { Atom, atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { nowPlayingTrackIdAtom, selectedTrackAtom } from 'state/Atoms'

// Only change styling if derived values are different.
export const useTrackColor = (trackId: string) => {
    const isSelected = useAtomValue(useMemo(() => atom(get =>
        get(selectedTrackAtom)?.trackId === trackId), [trackId]))

    const isPlaying = useAtomValue(useMemo(() => atom(get =>
        get(nowPlayingTrackIdAtom) === trackId), [trackId]))

    return useMemo(() =>
        isPlaying ? ['bg-success', 'text-success-content', ''] :
            isSelected ? ['bg-info', 'text-info-content', ''] :
                ['bg-base-100', 'text-base-content', 'active:bg-accent active:text-accent-content'],
    [isSelected, isPlaying])
}

export const useLikeSvgStyle = (trackId: string, isLikedAtom: Atom<boolean>) => {
    return useMemo(() => atom(get => {
        const isPlaying = get(nowPlayingTrackIdAtom) === trackId
        const isLiked = get(isLikedAtom)

        if (isLiked && isPlaying) {
            return 'fill-success-content'
        } else if (isLiked) {
            return 'fill-success'
        } else if (isPlaying) {
            return 'stroke-success-content'
        } else {
            return 'stroke-base-content'
        }
    }), [trackId])
}