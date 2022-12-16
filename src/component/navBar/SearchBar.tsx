import { useAtom } from 'jotai'
import { searchAtom } from 'state/Atoms'
import { SearchIcon } from '../Icons'

export default function SearchBar() {
    const [search, setSearch] = useAtom(searchAtom)
    return (
        <span className="inline-flex items-center rounded-full p-2 bg-neutral text-neutral-content group transition-all duration-500 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:outline-none" role="alert" tabIndex={0}>
            <SearchIcon />
            <input type="text" placeholder="search"
                className="input input-ghost input-sm hidden group-focus:inline-block group-hover:inline-block  text-neutral-content whitespace-nowrap  group-hover:max-w-screen-2xl group-focus:max-w-screen-2xl max-w-0 scale-80 group-hover:scale-100 overflow-hidden transition-all duration-500 group-hover:px-2 group-focus:px-2"
                value={search} onChange={e => setSearch(e.target.value)} />
        </span>
    )
}