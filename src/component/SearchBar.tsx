import { useAtom } from "jotai"
import { searchAtom } from "state/Atoms"

export default function SearchBar() {
    const [search, setSearch] = useAtom(searchAtom)
    return (
        <input type="text" placeholder="search" className="input hidden md:inline-block w-full bg-base-200 max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
    )
}