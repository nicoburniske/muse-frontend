import { useAtomValue, useSetAtom } from "jotai"
import { currentReviewNameAtom, debouncedReviewNameAtom } from "./createReviewAtoms"

export const EditReviewName = () => {
    const setReviewName = useSetAtom(debouncedReviewNameAtom)
    const reviewName = useAtomValue(currentReviewNameAtom)

    return (
        <input type="text" placeholder="review name" className="input input-bordered w-full"
            onChange={(e) => setReviewName(e.target.value as string)}
            value={reviewName}
        />
    )
}