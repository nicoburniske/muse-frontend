import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Stores the last 10 review IDs that the user has viewed.
const viewHistoryAtom = atomWithStorage<string[]>('MuseReviewViewHistory', [])

const addToHistoryAtom = atom(null, (get, set, reviewId: string) => {
   const history = get(viewHistoryAtom)
   const newHistory = [reviewId, ...history.filter(id => id !== reviewId)].slice(0, 20)
   set(viewHistoryAtom, newHistory)
})

export const useAddToHistory = () => useSetAtom(addToHistoryAtom)
export const useViewHistory = () => useAtomValue(viewHistoryAtom)
