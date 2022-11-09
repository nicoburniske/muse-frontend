import { atom } from 'jotai'
import CreateReview from './createReview/CreateReview'
import SearchBar from './SearchBar'
import { ThemeSetter } from './ThemeSetter'

export default function NavbarRhs({ className, createReviewTitle }: { className?: string, createReviewTitle?: string }) {
    const parentAtom = atom(undefined)

    return (
        <div className={`flex flex-row ${className} `}>
            <SearchBar />
            <CreateReview title={createReviewTitle} className="btn btn-base-300 btn-square" parentReviewIdAtom={parentAtom} />
            <ThemeSetter />
        </div>
    )
}