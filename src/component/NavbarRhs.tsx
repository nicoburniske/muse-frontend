import { useAtom } from "jotai"
import { Theme, themeAtom } from "state/Atoms"
import CreateReview from "./browseReviews/CreateReview"
import SearchBar from "./SearchBar"

export default function NavbarRhs({className}: {className?: string}) {
    const [theme, setTheme] = useAtom(themeAtom)

    return (
        <div className={`flex flex-row ${className} `}>
            <SearchBar />
            <CreateReview />
            <div className="tooltip tooltip-bottom" data-tip="Theme">
                <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                    className="select select-bordered w-full max-w-xs">
                    {Object.values(Theme)
                        .sort((a, b) => a.localeCompare(b))
                        .map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
            </div>
        </div>

    )
}