import {
   EntityType,
   SearchAlbumFragment,
   SearchArtistFragment,
   SearchPlaylistFragment,
   SearchSpotifyDocument,
   SearchSpotifyQuery,
   SearchSpotifyQueryVariables,
} from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { Virtuoso } from 'react-virtuoso'
import { CrossIcon } from '../Icons'
import { Atom, atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import atomWithDebounce from 'platform/atom/atomWithDebounce'
import { UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { fetcher } from 'graphql/fetcher'

type SearchResult = SearchPlaylistFragment | SearchAlbumFragment | SearchArtistFragment
const searchTextResult = 'select-none truncate text-sm lg:text-base p-0.5 max-w-[50%]'
const DEFAULT_PAGINATION = { first: 20, offset: 0 }

interface SearchSpotifyProps {
   onClear: () => void
   entityTypeAtom: PrimitiveAtom<EntityType>
   entityIdAtom: PrimitiveAtom<string | undefined>
}

const searchResultAtom = atom<SearchResult[]>([])
const paginationAtom = atom(DEFAULT_PAGINATION)
const {
   isDebouncingAtom: isSearchDebouncing,
   debouncedValueAtom: debouncedSearchAtom,
   clearTimeoutAtom,
   currentValueAtom: currentSearchAtom,
} = atomWithDebounce('')

export default function SearchSpotify({ onClear, entityTypeAtom, entityIdAtom }: SearchSpotifyProps) {
   const entityType = useAtomValue(entityTypeAtom)
   const [debouncedSearch, setDebouncedSearch] = useAtom(debouncedSearchAtom)
   const isDebouncing = useAtomValue(isSearchDebouncing)
   const setSearchResults = useSetAtom(searchResultAtom)
   const [pagination, setPagination] = useAtom(paginationAtom)

   const clearSearchResults = () => {
      setSearchResults([])
      setPagination(DEFAULT_PAGINATION)
   }

   const { data, fetchNextPage } = useInfiniteSearchSpotifyQuery(
      'pagination',
      {
         query: debouncedSearch,
         types: [entityType],
         pagination,
      },
      {
         onError: () => toast.error('Error searching for entity'),
         enabled: !isDebouncing && debouncedSearch.length > 0,
         staleTime: 1000 * 30,
         getNextPageParam: (last, all) => {
            const albumsLeft = last.search?.albums?.itemsLeft ?? 0
            const playlistsLeft = last.search?.playlists?.itemsLeft ?? 0
            const artistsLeft = last.search?.artists?.itemsLeft ?? 0
            const totalLeft = Math.min(albumsLeft + playlistsLeft + artistsLeft, 20)
            const nextOffset = last.search?.playlists?.nextOffset ?? 0
            // TODO: impose limit?
            if (totalLeft > 0 && nextOffset > 0) {
               return { first: 20, offset: nextOffset }
            }
         },
      }
   )

   useEffect(() => clearSearchResults(), [entityType])

   useEffect(() => {
      const latestData =
         data?.pages?.flatMap(p => [
            ...(p.search?.albums?.items ?? []),
            ...(p.search?.playlists?.items ?? []),
            ...(p.search?.artists?.items ?? []),
         ]) ?? []
      setSearchResults(latestData)
   }, [data])

   const resetState = () => {
      setDebouncedSearch('')
      clearSearchResults()
      onClear()
   }

   // Cleanup on unmount.
   useEffect(() => () => resetState(), [])

   return (
      <>
         <div className='flex w-full flex-row items-center justify-center'>
            <SearchInput />
            <button className='btn btn-accent' onClick={resetState}>
               <CrossIcon />
            </button>
         </div>
         <div className='h-80 w-full bg-base-200 lg:h-96'>
            <SearchResults searchResultAtom={searchResultAtom} entityIdAtom={entityIdAtom} fetchMore={fetchNextPage} />
         </div>
      </>
   )
}

const SearchInput = () => {
   const currentValue = useAtomValue(currentSearchAtom)
   const setDebouncedValue = useSetAtom(debouncedSearchAtom)

   return (
      <input
         type='text'
         placeholder='search'
         className='input input-bordered grow'
         onChange={e => setDebouncedValue(e.target.value as string)}
         value={currentValue}
      />
   )
}

interface SearchResultsProps {
   fetchMore: () => void
   searchResultAtom: Atom<SearchResult[]>
   entityIdAtom: PrimitiveAtom<string | undefined>
}

const SearchResults = ({ fetchMore, searchResultAtom, entityIdAtom }: SearchResultsProps) => {
   const searchResults = useAtomValue(searchResultAtom)
   const [entityId, setEntityId] = useAtom(entityIdAtom)

   const getSecondRow = (result: SearchResult) => {
      if (result.__typename === 'Album') {
         return result?.artists?.map(a => a.name).join(', ')
      } else if (result.__typename === 'Playlist') {
         return result?.owner?.spotifyProfile?.displayName ?? result?.owner?.id
      } else {
         return result?.name
      }
   }
   return (
      <Virtuoso
         className='h-full w-full overflow-y-auto'
         data={searchResults}
         endReached={fetchMore}
         overscan={200}
         itemContent={(i, result) => {
            const image = result.images?.at(-1)
            const second = getSecondRow(result)
            const [bgStyle, textStyle, hoverStyle] =
               result.id === entityId
                  ? ['bg-success', 'text-success-content', '']
                  : ['bg-base', 'text-base-content', 'hover:bg-base-focus']
            return (
               <div
                  className={`card card-body m-0 flex w-full max-w-full flex-row items-center justify-around p-1 ${bgStyle} ${hoverStyle}`}
                  key={i}
                  onClick={() => setEntityId(result.id)}
               >
                  <div className='avatar flex-none'>
                     <div className='w-8 rounded md:w-16'>
                        <img src={image} />
                     </div>
                  </div>
                  <div className='flex max-w-[80%] grow flex-row justify-between'>
                     <div className={`${searchTextResult} ${textStyle}`}> {result.name} </div>
                     <div className={`${searchTextResult} ${textStyle}`}> {second} </div>
                  </div>
               </div>
            )
         }}
      />
   )
}

const useInfiniteSearchSpotifyQuery = (
   pageParamKey: keyof SearchSpotifyQueryVariables,
   variables: SearchSpotifyQueryVariables,
   options?: UseInfiniteQueryOptions<SearchSpotifyQuery, unknown, SearchSpotifyQuery>
) => {
   return useInfiniteQuery<SearchSpotifyQuery, unknown, SearchSpotifyQuery>(
      ['SearchSpotify.infinite', variables],
      metaData =>
         fetcher<SearchSpotifyQuery, SearchSpotifyQueryVariables>(SearchSpotifyDocument, {
            ...variables,
            [pageParamKey]: metaData.pageParam,
         })(),
      options
   )
}

useInfiniteSearchSpotifyQuery.getKey = (variables: SearchSpotifyQueryVariables) => ['SearchSpotify.infinite', variables]
