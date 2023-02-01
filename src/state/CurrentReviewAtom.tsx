import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useAddToHistory } from './ViewHistory'

export const currentReviewAtom = atom<string | undefined>(undefined)

export const useCurrentReview = () => useAtomValue(currentReviewAtom)

export const useSetCurrentReview = (reviewId: string) => {
    const addToHistory = useAddToHistory()
    const setReviewId = useSetAtom(currentReviewAtom)

    useEffect(() => {
        addToHistory(reviewId)
        setReviewId(reviewId)
        return () => { setReviewId(undefined) }
    }, [reviewId])

}
