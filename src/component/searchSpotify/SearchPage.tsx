import { BackspaceIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { QueryFunction, UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useSpotifyClient } from 'component/sdk/ClientAtoms'
import { SearchConfig, useAvailableGenreSeeds, usePlayMutation } from 'component/sdk/ClientHooks'
import { EntityType } from 'graphql/generated/schema'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import atomWithDebounce from 'platform/atom/atomWithDebounce'
import { HeroLoading } from 'platform/component/HeroLoading'
import { useEffect, useMemo, useRef, memo, ReactNode, RefObject, useCallback, useState } from 'react'
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
import { EntityTypeValues, chunkArrayInGroups, cn, nonNullable, uniqueByProperty } from 'util/Utils'
import { ToggleWithDescription } from 'platform/component/ToggleWithDescription'
import SelectMany from 'platform/component/SelectMany'
import useDoubleClick from 'platform/hook/useDoubleClick'
import { useWindowSizeAtom } from 'platform/hook/useWindowSize'
import { SearchInputKbdSuggestion } from 'platform/component/SearchInputKbdSuggestion'
import { CreateReviewModal, useCreateReviewModal } from 'component/createReview/CreateReviewModal'
import toast from 'react-hot-toast'
import { useDerivedAtomValue } from 'platform/hook/useDerivedAtomValue'

const SearchPage = () => {
   const [expandFilter, setExpandFilter] = useState(true)
   return (
      <>
         <div className='flex grow'>
            {expandFilter && (
               <div className='bg-base-200 flex w-32 flex-col space-y-5 p-2 md:w-56 md:p-4'>
                  <SelectEntityTypes />
                  <SelectGenreSeeds />
                  <SelectHipsterFilter />
                  <SelectNewFilter />
                  <SelectPlayOnHover />
               </div>
            )}
            <div className='flex grow flex-col items-center justify-between bg-background'>
               <div className='flex w-full flex-none items-center justify-between'>
                  <button
                     className='btn btn-ghost btn-sm h-3/4 flex-none justify-self-start'
                     onClick={() => setExpandFilter(!expandFilter)}
                  >
                     {expandFilter ? <ChevronLeftIcon className='h-6 w-6' /> : <ChevronRightIcon className='h-6 w-6' />}
                  </button>

                  <div className='max-w-3xl flex-1 justify-self-center'>
                     <SearchInputBar />
                  </div>
                  {/* Empty div ftw */}
                  <div />
               </div>
               {/* Again no idea why I need min-h */}
               <div className='border-base-200 min-h-0 w-full grow rounded-md border-2 px-3 shadow-2xl'>
                  <ScrollSearchResults />
               </div>
            </div>
         </div>

         <CreateReviewModal />
      </>
   )
}
export default SearchPage

const playOnHoverAtom = atom(false)

type NoTrack = Exclude<EntityType, 'Track'>
const NoTrackValues = EntityTypeValues.filter(t => t !== 'Track') as NoTrack[]
const allTypes = new Set(NoTrackValues.flatMap(t => [t, t.toLocaleLowerCase()]).map(t => '/' + t))
const asMap = new Map(
   NoTrackValues.flatMap(t => [
      ['/' + t, t],
      ['/' + t.toLocaleLowerCase(), t],
   ])
)

const selectedEntityTypesAtom = atom(['Album', 'Playlist', 'Artist'] as NoTrack[])
const selectedGenreSeedsAtom = atom(new Array<string>())
const filterHipsterAtom = atom(false)
const filterNewAtom = atom(false)
// TODO: Handle URI getting pasted in?
const { currentValueAtom: queryStringAtom, debouncedValueAtom: debouncedQueryString } = atomWithDebounce('')

const setQueryStringAtom = atom(null, (get, set, value: string) => {
   const containedTypes = value
      .split(' ')
      .filter(t => allTypes.has(t))
      .map(t => asMap.get(t)!)

   if (containedTypes.length > 0) {
      set(selectedEntityTypesAtom, containedTypes)
   }

   const filteredString = value
      .split(' ')
      .filter(t => !allTypes.has(t))
      .join(' ')

   set(debouncedQueryString, filteredString)
})

// Hipster only applies to albums?
const SelectHipsterFilter = () => {
   const [hipster, setHipster] = useAtom(filterHipsterAtom)

   const onChange = (value: boolean) => {
      setHipster(value)
   }

   return (
      <ToggleWithDescription
         label={'Hipster'}
         description={'10% Least Popular'}
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
      setEntityTypes(current => (value ? ['Album'] : current))
   }

   return (
      <ToggleWithDescription
         label='New'
         description='Released In Last 2 Weeks'
         enabled={newOnly}
         setEnabled={onChange}
      />
   )
}

const SelectPlayOnHover = () => {
   const [playOnHove, setPlayOnHover] = useAtom(playOnHoverAtom)

   const onChange = (value: boolean) => {
      setPlayOnHover(value)
   }

   return (
      <ToggleWithDescription
         label={'Play on Hover'}
         description={'Hover over an item to play it'}
         enabled={playOnHove}
         setEnabled={onChange}
         className='hidden sm:flex'
      />
   )
}

const SearchInputBar = () => {
   const search = useAtomValue(queryStringAtom)
   const setSearch = useSetAtom(setQueryStringAtom)

   return (
      <SearchInputKbdSuggestion screenReaderLabel='Search' placeholder='Search' search={search} setSearch={setSearch} />
   )
}

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
               // Can't currently handle track reviews.
               allOptions={['Album', 'Playlist', 'Artist'] as EntityType[]}
               onChange={setSelectedEntityTypes}
               createKey={(e: EntityType) => e}
               renderOption={(e: EntityType) => e}
               renderSelected={renderString}
            />
         </div>
         <button className='btn btn-md w-20 gap-2 md:w-32' onClick={clear} disabled={selected.length === 0}>
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
         <button className='btn btn-md w-20 gap-2 md:w-32' onClick={clear} disabled={selected.length === 0}>
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

   const withFilters = cn(
      query,
      genre.length > 0 ? `"genre":${genre.join(' ')}` : undefined,
      filterHipster ? 'tag:hipster' : undefined,
      filterNew ? 'tag:new' : undefined
   )

   if (type.length === 0 || withFilters.length === 0) {
      return null
   } else {
      return { type, query: withFilters }
   }
})

const ScrollSearchResults = () => {
   const searchConfig = useAtomValue(searchConfigAtom)
   const isDisabled = searchConfig === null

   const { isLoading, data, error, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteSearch(
      searchConfig!,
      20,
      { enabled: !isDisabled, retry: false, staleTime: 1 * 60 * 1000 }
   )

   useEffect(() => {
      if (error) {
         toast.error('Search Error.')
      }
   }, [error])

   const response = data?.pages ?? []

   const [numCols, colsStyle, height]: [number, string, number] = useWindowSizeAtom(
      useCallback(s => {
         const itemWidth = s.isMd ? 192 : 128
         const sidebarWidth = s.isMd ? 224 : 128
         const height = s.isMd ? 300 : 200
         // this one is aribitrary.
         const padding = s.isMd ? 100 : 50
         const width = s.width - sidebarWidth
         if (width > itemWidth * 5 + padding) {
            return [5, 'grid-cols-5', height]
         } else if (width > itemWidth * 4 + padding) {
            return [4, 'grid-cols-4', height]
         } else if (width > itemWidth * 3 + padding) {
            return [3, 'grid-cols-3', height]
         } else {
            return [2, 'grid-cols-2', height]
         }
      }, [])
   )

   const allRows = useMemo(() => {
      const validResults = [
         response.flatMap(r => r.albums?.items ?? []),
         response.flatMap(r => r.artists?.items ?? []),
         response.flatMap(r => r.episodes?.items ?? []),
         response.flatMap(r => r.playlists?.items ?? []),
         response.flatMap(r => r.shows?.items ?? []),
         response.flatMap(r => r.tracks?.items ?? []),
      ]
         .flat()
         .filter(r => nonNullable(r?.href ?? r?.id))
         .filter(r => nonNullable(r.type))
      const unique = uniqueByProperty(validResults, r => r?.href ?? r?.id)
      return chunkArrayInGroups(unique, numCols)
   }, [response, numCols])

   const parentRef = useRef<HTMLDivElement>(null)
   const rowVirtualizer = useVirtualizer({
      count: hasNextPage ? allRows.length + 1 : allRows.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => height,
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
         <div ref={parentRef} className='muse-scrollbar h-full w-full overflow-y-auto overflow-x-hidden'>
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
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
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
                              <progress className='progress w-full'></progress>
                           ) : null
                        ) : (
                           <div className={cn('grid place-items-center gap-x-4', colsStyle)}>
                              {searchRow.map((searchRow, i) => (
                                 <MemoResultRow key={i} searchRow={searchRow} />
                              ))}
                           </div>
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
const findImage = (searchRow: SearchRow, index: number) => {
   const images = searchRow.type === 'track' ? searchRow.album?.images : searchRow.images
   return (
      images
         ?.map(i => i.url)
         .filter((_, i) => i <= index)
         .at(-1) ?? ''
   )
}

const nowPlayingAtom = atom<string | undefined>(undefined)
const SearchResultTile = ({ searchRow }: { searchRow: SearchRow }) => {
   const tileImage = findImage(searchRow, 1)
   const bigImage = findImage(searchRow, 0)
   const type = searchRow.type

   const { open } = useCreateReviewModal({
      entityId: searchRow.id,
      entityImage: bigImage,
      entityName: searchRow.name,
      entityType: capitalizeFirst(type) as EntityType,
   })

   const delayHandler = useRef<NodeJS.Timeout | undefined>(undefined)
   const isPlaying = useDerivedAtomValue(get => get(nowPlayingAtom) === searchRow.id, [searchRow.id])
   const setIsPlaying = useSetAtom(nowPlayingAtom)

   const { isLoading, playAlbumIndexOffset, playTrackOffset, playArtist, playPlaylistIndexOffset } = usePlayMutation({
      onSuccess: () => setIsPlaying(searchRow.id),
      onError: () => {
         toast.error(`Error playing ${type}.`, { id: 'play-error', duration: 2000 })
      },
      retry: 2,
   })

   const playDoubleClick = () => {
      if (!isPlaying) {
         if (type === 'track') {
            playTrackOffset(searchRow.id, 0)
         } else if (type === 'artist') {
            playArtist(searchRow.id)
         } else if (type === 'playlist') {
            playPlaylistIndexOffset(searchRow.id, 0)
         } else if (type === 'album') {
            playAlbumIndexOffset(searchRow.id, 0)
         }
      }
   }

   const shouldPlayHover = useAtomValue(playOnHoverAtom)

   const playHover = () => {
      delayHandler.current = setTimeout(() => {
         if (shouldPlayHover && !isPlaying && !isLoading) {
            if (type === 'track') {
               const offset = searchRow.duration_ms / 2
               playTrackOffset(searchRow.id, offset)
            } else if (type === 'artist') {
               playArtist(searchRow.id, 15 * 1000)
            } else if (type === 'playlist') {
               playPlaylistIndexOffset(searchRow.id, 0, 15 * 1000)
            } else if (type === 'album') {
               playAlbumIndexOffset(searchRow.id, 0, 15 * 1000)
            }
         }
      }, 100)
   }

   const mouseLeave = () => {
      const timeout = delayHandler.current
      if (timeout !== undefined) {
         clearTimeout(timeout)
      }
   }

   const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>
   useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: playDoubleClick })

   return (
      <div
         className='bg-base-200 hover:bg-base-300 flex w-32 flex-col text-foreground shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl md:w-48'
         onMouseEnter={playHover}
         onMouseLeave={mouseLeave}
         ref={playOnDoubleClickRef}
      >
         <img src={tileImage} className='h-32 w-32 object-center md:h-48 md:w-48' alt='SearchResult' />
         <div className='flex cursor-pointer flex-col items-center justify-evenly text-center' onClick={open}>
            <div className='line-clamp-1 w-full text-xs font-extrabold md:text-base'>{searchRow.name}</div>
            <div className='badge badge-primary truncate text-xs md:text-sm'>{capitalizeFirst(searchRow.type)}</div>
            <p className='line-clamp-1 text-clip text-sm'>{secondaryData(searchRow)}</p>
         </div>
      </div>
   )
}

const secondaryData = (searchRow: SearchRow): ReactNode => {
   if (searchRow.type === 'artist') {
      return `${searchRow.followers.total.toLocaleString()} Followers`
   } else if (searchRow.type === 'album') {
      return searchRow.artists.at(0)?.name
   } else if (searchRow.type === 'track') {
      return searchRow.artists.map(artist => artist.name).join(', ')
   } else if (searchRow.type === 'playlist') {
      return searchRow.owner.display_name ?? searchRow.owner.id
   }
   // Other cases are not supported.
   return null
}

const MemoResultRow = memo(
   SearchResultTile,
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
