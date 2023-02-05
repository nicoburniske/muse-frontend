import { BackspaceIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { QueryFunction, UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useSpotifyClient } from 'component/sdk/ClientAtoms'
import { SearchConfig, useAvailableGenreSeeds } from 'component/sdk/ClientHooks'
import { EntityType } from 'graphql/generated/schema'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import atomWithDebounce from 'platform/atom/atomWithDebounce'
import { HeroLoading } from 'platform/component/HeroLoading'
import { useEffect, useMemo, useRef, memo } from 'react'
import {
   Artist,
   SearchType,
   SimplifiedAlbum,
   SimplifiedEpisode,
   SimplifiedPlaylist,
   SimplifiedShow,
   Track,
} from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { SearchResponse } from 'spotify-web-api-ts/types/types/SpotifyResponses'
import { classNames, nonNullable, uniqueByProperty } from 'util/Utils'
import { ToggleWithDescription } from 'platform/component/ToggleWithDescription'
import SelectMany from 'platform/component/SelectMany'

const SearchPage = () => {
   return (
      <div className='flex h-full w-full'>
         <div className='flex w-56 flex-col space-y-5 bg-base-200 p-4'>
            <SelectEntityTypes />
            <SelectGenreSeeds />
            <SelectHipsterFilter />
            <SelectNewFilter />
         </div>
         <div className='flex grow flex-col items-center justify-between bg-base-100'>
            <div className='w-full max-w-3xl'>
               <SearchInputBar />
            </div>

            <div className='flex h-full w-full px-3'>
               <div className='max-h-full grow rounded-md border-2 border-base-200 shadow-2xl'>
                  <ScrollSearchResults />
               </div>
            </div>
         </div>
      </div>
   )
}

const selectedEntityTypesAtom = atom(new Array<EntityType>())
const selectedGenreSeedsAtom = atom(new Array<string>())
const filterHipsterAtom = atom(false)
const filterNewAtom = atom(false)
const { currentValueAtom: queryStringAtom, debouncedValueAtom: debouncedQueryString } = atomWithDebounce('')

// Hipster only applies to albums?
const SelectHipsterFilter = () => {
   const [hipster, setHipster] = useAtom(filterHipsterAtom)

   const onChange = (value: boolean) => {
      setHipster(value)
   }

   return (
      <ToggleWithDescription
         label={'Hipster'}
         description={'10% Least popular '}
         enabled={hipster}
         setEnabled={onChange}
      />
   )
}

// Only for albums.
const SelectNewFilter = () => {
   const [newOnly, setNewOnly] = useAtom(filterNewAtom)
   const setEntityTypes = useSetAtom(selectedEntityTypesAtom)

   const onChange = (value: boolean) => {
      setNewOnly(value)
      setEntityTypes(current => (value ? [EntityType.Album] : current))
   }

   return (
      <ToggleWithDescription
         label='New'
         description='Released in last 2 weeks'
         enabled={newOnly}
         setEnabled={onChange}
      />
   )
}

const SearchInputBar = () => {
   const search = useAtomValue(queryStringAtom)
   const setSearch = useSetAtom(debouncedQueryString)
   return (
      <div className='flex py-1'>
         <form className='flex w-full md:ml-0'>
            <label htmlFor='search-field' className='sr-only'>
               Search reviews
            </label>
            <div className='flex w-full flex-row items-center justify-between space-x-5 text-base-content'>
               <MagnifyingGlassIcon className='h-5 w-5 flex-shrink-0' aria-hidden='true' />
               <input
                  name='search-field'
                  id='search-field'
                  className='input w-full border-2 border-base-content/20 text-base placeholder-base-content/50 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm'
                  placeholder='Search'
                  value={search}
                  type='search'
                  autoComplete='off'
                  onChange={e => setSearch(e.target.value as string)}
               />
            </div>
         </form>
      </div>
   )
}

export default SearchPage

const renderString = (selected: string[]) => (selected.length > 0 ? selected.join(', ') : 'None')
const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const SelectEntityTypes = () => {
   const [selected, setSelectedEntityTypes] = useAtom(selectedEntityTypesAtom)
   const clear = () => setSelectedEntityTypes([])
   return (
      <div className='flex flex-col items-center space-y-2'>
         <div className='w-full'>
            <SelectMany
               label={'Search Types'}
               selected={selected}
               allOptions={Object.values(EntityType)}
               onChange={setSelectedEntityTypes}
               createKey={(e: EntityType) => e}
               renderOption={(e: EntityType) => e}
               renderSelected={renderString}
            />
         </div>
         <button className='btn btn-md w-32 gap-2' onClick={clear} disabled={selected.length === 0}>
            <span className='hidden md:block'>Clear</span>
            <BackspaceIcon className='h-6 w-6' />
         </button>
      </div>
   )
}

const SelectGenreSeeds = () => {
   const [selected, setSelected] = useAtom(selectedGenreSeedsAtom)
   const clear = () => setSelected([])
   const { data } = useAvailableGenreSeeds({ staleTime: 5 * 60 * 1000 })
   return (
      <div className='flex flex-col items-center space-y-2'>
         <div className='w-full'>
            <SelectMany
               label={'Genres'}
               selected={selected}
               allOptions={data ?? []}
               onChange={setSelected}
               createKey={(s: string) => s}
               renderOption={capitalizeFirst}
               renderSelected={(selected: string[]) =>
                  selected.length > 0 ? selected.map(capitalizeFirst).join(', ') : 'None'
               }
            />
         </div>
         <button className='btn btn-md w-32 gap-2' onClick={clear} disabled={selected.length === 0}>
            <span className='hidden md:block'>Clear</span>
            <BackspaceIcon className='h-6 w-6' />
         </button>
      </div>
   )
}

const searchConfigAtom = atom(get => {
   const type = get(selectedEntityTypesAtom).map(e => e.toLowerCase() as SearchType)
   const genre = get(selectedGenreSeedsAtom)
   const query = get(debouncedQueryString)
   const filterHipster = get(filterHipsterAtom)
   const filterNew = get(filterNewAtom)

   const withFilters = classNames(
      query,
      genre.length > 0 ? `"genre":${genre.join(' ')}` : undefined,
      filterHipster ? 'tag:hipster' : undefined,
      filterNew ? 'tag:new' : undefined
   )
   console.log('withFilters', withFilters, type)

   if (type.length === 0 || withFilters.length === 0) {
      return null
   } else {
      console.log('searchConfigAtom', { type, query, genre })
      return { type, query: withFilters }
   }
})

type SearchResults = {
   albums: SimplifiedAlbum[]
   artists: Artist[]
   episodes: SimplifiedEpisode[]
   playlists: SimplifiedPlaylist[]
   shows: SimplifiedShow[]
   tracks: Track[]
}

const ScrollSearchResults = () => {
   const searchConfig = useAtomValue(searchConfigAtom)
   const isDisabled = searchConfig === null

   const { isLoading, data, error, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteSearch(
      searchConfig!,
      20,
      { enabled: !isDisabled, retry: false }
   )

   const response = data?.pages ?? []

   const results = useMemo(
      () =>
         ({
            albums: response.flatMap(r => r.albums?.items ?? []),
            artists: response.flatMap(r => r.artists?.items ?? []),
            episodes: response.flatMap(r => r.episodes?.items ?? []),
            playlists: response.flatMap(r => r.playlists?.items ?? []),
            shows: response.flatMap(r => r.shows?.items ?? []),
            tracks: response.flatMap(r => r.tracks?.items ?? []),
         } as SearchResults),
      [response]
   )
   const allRows = useMemo(() => {
      const validResults = Object.values(results)
         .flat()
         .filter(r => nonNullable(r?.href ?? r?.id))
         .filter(r => nonNullable(r.type))
      return uniqueByProperty(validResults, r => r?.href ?? r?.id)
   }, [results])

   const parentRef = useRef<HTMLDivElement>(null)
   //    const [mountedRef, keepMounted] = useKeepMountedRangeExtractor()
   const rowVirtualizer = useVirtualizer({
      //   rangeExtractor: keepMounted,
      count: hasNextPage ? allRows.length + 1 : allRows.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 100,
      overscan: 20,
   })

   // Fetch next page on bottom.
   useEffect(() => {
      const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()
      if (!lastItem) {
         return
      }
      if (lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
         fetchNextPage()
      }
   }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()])

   if (isDisabled) {
      return null
   } else if (isLoading && response.length === 0) {
      return (
         <div className='relative h-full w-full'>
            <HeroLoading />
         </div>
      )
   } else {
      return (
         <div ref={parentRef} className='h-full w-full overflow-y-auto'>
            <div
               className='relative w-full'
               style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
               }}
            >
               {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const isLoaderRow = virtualRow.index > allRows.length - 1
                  const searchRow = allRows[virtualRow.index]

                  return (
                     <div
                        key={virtualRow.index}
                        style={{
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           width: '100%',
                           height: `${virtualRow.size}px`,
                           transform: `translateY(${virtualRow.start}px)`,
                        }}
                     >
                        {isLoaderRow ? (
                           hasNextPage ? (
                              'Loading more...'
                           ) : (
                              'Nothing more to load'
                           )
                        ) : (
                           <MemoResultRow searchRow={searchRow} />
                        )}
                     </div>
                  )
               })}
            </div>
         </div>
      )
   }
}

type SearchRow = SimplifiedAlbum | Artist | SimplifiedEpisode | SimplifiedPlaylist | SimplifiedShow | Track
const SearchResultRow = ({ searchRow }: { searchRow: SearchRow }) => {
   const image = searchRow?.images?.at(0)?.url ?? searchRow?.album?.images?.at(-2)?.url
   const type = searchRow.type

   return (
      <div
         className={`card card-body m-0 flex w-full flex-row items-center justify-evenly p-1`}
         //   onClick={() => setEntityId(result.id)}
      >
         <div className='avatar flex-none justify-self-start'>
            <div className='w-8 rounded md:w-16'>
               <img src={image} />
            </div>
         </div>

         <div className='select-none truncate p-0.5 text-base'> {capitalizeFirst(type)} </div>
         <div className='w-56 select-none truncate p-0.5 text-base'> {searchRow.name} </div>
         <div className='flex w-24 flex-col pl-1 md:w-40 lg:w-48'>
            {/* <div className='select-none truncate p-0.5 text-sm font-light'>
                 {artistNames ?? ''}
              </div> */}
         </div>
      </div>
   )
}

const MemoResultRow = memo(
   SearchResultRow,
   (prevProps, nextProps) => prevProps.searchRow.href === nextProps.searchRow.href
)

export const useInfiniteSearch = (
   search: SearchConfig,
   limit: number,
   options: UseInfiniteQueryOptions<SearchResponse, unknown, SearchResponse>
) => {
   const { query, type, options: searchOptions } = search ?? {}

   const client = useSpotifyClient()

   const pageQuery: QueryFunction<SearchResponse, readonly unknown[]> = ({ pageParam }) => {
      return client.search.search(query, type, { ...searchOptions, limit, offset: pageParam })
   }

   return useInfiniteQuery<SearchResponse, unknown, SearchResponse>(
      ['SpotifySearch', query, type, searchOptions],
      pageQuery,
      {
         getNextPageParam: (lastPage, pages) => {
            if (
               lastPage.albums?.next ||
               lastPage.artists?.next ||
               lastPage.episodes?.next ||
               lastPage.playlists?.next ||
               lastPage.shows?.next ||
               lastPage.tracks?.next
            ) {
               return pages.length * limit
            }
            return false
         },
         ...options,
      }
   )
}
