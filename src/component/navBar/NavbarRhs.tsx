import { atom } from 'jotai'
import CreateReview from '../createReview/CreateReview'
import SearchBar from './SearchBar'
import { usePreferencesModal } from '../preferences/UserPreferencesForm'
import { useMemo } from 'react'
import { useCurrentUser } from '../playbackSDK/hooks'

export default function NavbarRhs({ className, createReviewTitle }: { className?: string, createReviewTitle?: string }) {
    const parentAtom = useMemo(() => atom(undefined), [])
    const { openPreferencesModal } = usePreferencesModal()
    const { data } = useCurrentUser({ suspense: true, staleTime: 1000 * 60 * 60 })

    const image = data?.images[0]?.url ?? ''

    return (
        <div className={`flex flex-row ${className} `}>
            <SearchBar />
            <CreateReview title={createReviewTitle} className="btn btn-base-300 btn-square" parentReviewIdAtom={parentAtom} />
            <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                        <img src={image} />
                    </div>
                </label>
                <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                        <a className="justify-between">
                            Profile
                            <span className="badge">New</span>
                        </a>
                    </li>
                    <li><a onClick={() => openPreferencesModal()}>Settings</a></li>
                    <li><a>Logout</a></li>
                </ul>
            </div>

        </div>
    )
}