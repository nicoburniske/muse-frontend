import { EntityType, SearchAlbumFragment, SearchPlaylistFragment, useInfiniteSearchSpotifyQuery, useSearchSpotifyQuery } from "graphql/generated/schema"
import toast from 'react-hot-toast';
import { Virtuoso } from "react-virtuoso"
import { CrossIcon, SearchIcon } from "./Icons";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import atomWithDebounce from "state/atomWithDebounce";
import { useEffect } from "react";
import { entityTypeAtom } from "./browseReviews/CreateReview";

type SearchResult = SearchPlaylistFragment | SearchAlbumFragment
const searchTextResult = "select-none truncate text-sm lg:text-base p-0.5 max-w-[50%]"
const DEFAULT_PAGINATION = { first: 20, from: 0 }


export const entityIdAtom = atom<string>("")
const searchResultAtom = atom<SearchResult[]>([])
const paginationAtom = atom(DEFAULT_PAGINATION)
const {
    isDebouncingAtom: isSearchDebouncing,
    debouncedValueAtom: debouncedSearchAtom,
    clearTimeoutAtom,
    currentValueAtom: currentSearchAtom
} = atomWithDebounce("");


export default function SearchSpotify() {
    const entityType = useAtomValue(entityTypeAtom)
    const [debouncedSearch, setDebouncedSearch] = useAtom(debouncedSearchAtom)
    const isDebouncing = useAtomValue(isSearchDebouncing)
    const setSearchResults = useSetAtom(searchResultAtom)
    const [pagination, setPagination] = useAtom(paginationAtom)

    const clearSearchResults = () => {
        setSearchResults([])
        setPagination(DEFAULT_PAGINATION)
    }

    const { data, fetchNextPage } = useInfiniteSearchSpotifyQuery('pagination', {
        query: debouncedSearch, types: [entityType], pagination
    }, {
        onError: () => toast.error("Error searching for entity"),
        enabled: !isDebouncing && debouncedSearch.length > 0,
        staleTime: 1000 * 30,
        getNextPageParam: (last, all) => {
            // TODO: fix this by including offset in response body.
            const allAlbums: number = all.map(p => p.search?.albums.length ?? 0).reduce((a, b) => a + b, 0)
            const allPlaylists: number = all.map(p => p.search?.playlists.length ?? 0).reduce((a, b) => a + b, 0)
            const totalLength = allAlbums + allPlaylists
            if (totalLength < 100) {
                return { first: 20, from: totalLength }
            }
        },
    })

    useEffect(() => clearSearchResults(), [entityType])

    useEffect(() => {
        const latestData = data?.pages?.flatMap(p =>
            [...p.search?.albums ?? [], ...p.search?.playlists ?? []]
        ) ?? []
        setSearchResults(latestData)
    }, [data])

    const resetState = () => {
        setDebouncedSearch("")
        clearSearchResults()
    }

    return (
        <>
            <div className="w-full flex flex-row items-center">
                <SearchInput />
                <button className="btn btn-accent w-[10%]" onClick={resetState}>
                    <CrossIcon />
                </button>
            </div>
            <div className="h-80 w-full bg-base-200">
                <SearchResults fetchMore={fetchNextPage} />
            </div>
        </>
    )
}

const SearchInput = () => {
    const currentValue = useAtomValue(currentSearchAtom)
    const setDebouncedValue = useSetAtom(debouncedSearchAtom)

    return (
        <div className="w-full flex flex-row items-center">
            <input type="text" placeholder="search" className="input input-bordered w-[90%]"
                onChange={e => setDebouncedValue(e.target.value as string)}
                value={currentValue}
            />
        </div>
    )
}

const SearchResults = ({ fetchMore }: { fetchMore: () => void }) => {
    const searchResults = useAtomValue(searchResultAtom)
    const [entityId, setEntityId] = useAtom(entityIdAtom)

    const getSecondRow = (result: SearchResult) => {
        if (result.__typename === "Album") {
            return result?.artists?.map(a => a.name).join(", ")
        } else if (result.__typename === "Playlist") {
            return result?.owner?.spotifyProfile?.displayName ?? result?.owner?.id
        } else {
            return ""
        }
    }
    return (
        <Virtuoso
            className="w-full h-full overflow-y-auto"
            data={searchResults}
            endReached={fetchMore}
            overscan={200}
            itemContent={(i, result) => {
                const image = result.images?.at(-1)
                const second = getSecondRow(result)
                const [bgStyle, textStyle, hoverStyle] =
                    result.id === entityId ? ["bg-success", "text-success-content", ''] : ["bg-base", "text-base-content", 'hover:bg-base-focus']
                return (
                    <div
                        className={`w-full max-w-full card card-body flex flex-row justify-around items-center p-1 m-0 ${bgStyle} ${hoverStyle}`}
                        key={i}
                        onClick={() => setEntityId(result.id)}>
                        <div className="avatar flex-none">
                            <div className="w-8 md:w-16 rounded">
                                <img loading='lazy' src={image} />
                            </div>
                        </div>
                        <div className="grow flex flex-row justify-between max-w-[80%]">
                            <div className={`${searchTextResult} ${textStyle}`}> {result.name} </div>
                            <div className={`${searchTextResult} ${textStyle}`}> {second} </div>
                        </div>
                    </div>)
            }} />
    )
}
