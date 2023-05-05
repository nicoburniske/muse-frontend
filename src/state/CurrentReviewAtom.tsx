import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { nowPlayingEnabledAtom } from './NowPlayingAtom'
import { selectedTrackAtom } from './SelectedTrackAtom'
import { useAddToHistory } from './ViewHistory'

export const currentReviewAtom = atom<string | undefined>(undefined)

export const useCurrentReview = () => useAtomValue(currentReviewAtom)

export const useSetCurrentReview = (reviewId: string) => {
   const addToHistory = useAddToHistory()
   const setReviewId = useSetAtom(currentReviewAtom)
   const setSelectedTrack = useSetAtom(selectedTrackAtom)
   const setNowPlayingEnabled = useSetAtom(nowPlayingEnabledAtom)

   useEffect(() => {
      addToHistory(reviewId)
      setReviewId(reviewId)

      return () => {
         setSelectedTrack(undefined)
         setReviewId(undefined)
         setNowPlayingEnabled(false)
      }
   }, [reviewId, addToHistory, setReviewId, setNowPlayingEnabled])
}
