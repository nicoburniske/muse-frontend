import { Atom, PrimitiveAtom, useAtomValue, useSetAtom } from 'jotai'

export const EditReviewName = ({
    debouncedReviewNameAtom, currentReviewNameAtom }: { debouncedReviewNameAtom: PrimitiveAtom<string>, currentReviewNameAtom: Atom<string> }) => {
    const setReviewName = useSetAtom(debouncedReviewNameAtom)
    const reviewName = useAtomValue(currentReviewNameAtom)

    return (
        <input type="text" placeholder="review name" className="input input-bordered w-full"
            onChange={(e) => setReviewName(e.target.value as string)}
            value={reviewName}
        />
    )
}