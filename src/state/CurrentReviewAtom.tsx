import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

export const currentReviewAtom = atom<string | undefined>(undefined)

export const useCurrentReview = () => useAtomValue(currentReviewAtom)

export const useSetCurrentReview = (reviewId: string) => {
    const setReviewId = useSetAtom(currentReviewAtom)

    useEffect(() => {
        setReviewId(reviewId)
        return () => { setReviewId(undefined) }
    }, [reviewId])

}
