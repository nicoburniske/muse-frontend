import { QueryFunction, UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useSpotifyClient } from 'component/sdk/ClientAtoms'
import { SearchConfig, useAvailableGenreSeeds, usePlayMutation } from 'component/sdk/ClientHooks'
import { EntityType } from 'graphql/generated/schema'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import atomWithDebounce from 'platform/atom/atomWithDebounce'
import { HeroLoading } from 'platform/component/HeroLoading'
import { useEffect, useMemo, useRef, memo, ReactNode, RefObject, useCallback } from 'react'
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
import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectItemText,
   SelectTrigger,
   SelectValue,
} from 'platform/component/Select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'platform/component/Card'
import { Button } from 'platform/component/Button'
import { Badge } from 'platform/component/Badge'
import { Bars3BottomLeftIcon, PlusIcon, BackspaceIcon } from '@heroicons/react/24/outline'
import { Separator } from 'platform/component/Seperator'
import { OpenMobileMenuButton } from 'component/container/OpenMobileMenuButton'

const SearchPage = () => {
   return (
      <>
         <div className='flex grow flex-col'>
            <div className='relative flex w-full items-center justify-center'>
               <OpenMobileMenuButton>
                  {onClick => (
                     <Button className='absolute left-2 inline md:hidden' onClick={onClick}>
                        <span className='sr-only'>Open sidebar</span>
                        <Bars3BottomLeftIcon className='h-6 w-6' aria-hidden='true' />
                     </Button>
                  )}
               </OpenMobileMenuButton>
               <div className='ml-16 w-full max-w-3xl justify-self-center'>
                  <SearchInputBar />
               </div>
            </div>
            <div className='flex max-w-full flex-wrap items-center justify-evenly gap-1 p-1'>
               <SelectEntityTypes />
               <SelectGenreSeeds />
               <SelectHipsterFilter />
               <SelectNewFilter />
            </div>
            <Separator />

            {/* Again no idea why I need min-h */}
            <div className='min-h-0 w-full grow rounded-md p-3 shadow-2xl'>
               <ScrollSearchResults />
            </div>
         </div>

         <CreateReviewModal />
      </>
   )
}
export default SearchPage

type NoTrack = Exclude<EntityType, 'Track'>
const NoTrackValues = EntityTypeValues.filter(t => t !== 'Track') as NoTrack[]
const allTypes = new Set(NoTrackValues.flatMap(t => [t, t.toLocaleLowerCase()]).map(t => '/' + t))
const asMap = new Map(
   NoTrackValues.flatMap(t => [
      ['/' + t, t],
      ['/' + t.toLocaleLowerCase(), t],
   ])
)

const selectedEntityTypesAtom = atom(['Playlist'] as NoTrack[])
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
         id='hipster-filter'
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
         id='new-filter'
         label='New'
         description='Released In Last 2 Weeks'
         enabled={newOnly}
         setEnabled={onChange}
      />
   )
}

const SearchInputBar = () => {
   const search = useAtomValue(queryStringAtom)
   const setSearch = useSetAtom(setQueryStringAtom)

   return (
      <SearchInputKbdSuggestion
         screenReaderLabel='Search'
         placeholder='Search'
         search={search}
         setSearch={setSearch}
         autoFocus={true}
      />
   )
}

const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const SelectEntityTypes = () => {
   const [selected, setSelectedEntityTypes] = useAtom(selectedEntityTypesAtom)
   const setNewToggle = useSetAtom(filterNewAtom)

   const set = (value: NoTrack) => {
      if (value !== 'Album') {
         setNewToggle(false)
      }
      setSelectedEntityTypes([value])
   }
   return (
      <div className='w-32'>
         <Select value={selected[0]} onValueChange={set}>
            <SelectTrigger>
               <SelectValue />
            </SelectTrigger>
            <SelectContent>
               <SelectGroup>
                  {NoTrackValues.map(item => (
                     <SelectItem key={item} value={item}>
                        <SelectItemText>{capitalizeFirst(item)}</SelectItemText>
                     </SelectItem>
                  ))}
               </SelectGroup>
            </SelectContent>
         </Select>
      </div>
   )
}

const SelectGenreSeeds = () => {
   const [selected, setSelected] = useAtom(selectedGenreSeedsAtom)
   const clear = () => setSelected([])
   const { data } = useAvailableGenreSeeds({ staleTime: 5 * 60 * 1000 })
   return (
      <div className='flex items-center gap-2'>
         <div className='w-32'>
            <SelectMany
               selected={selected}
               allOptions={data ?? []}
               onChange={setSelected}
               createKey={(s: string) => s}
               renderOption={capitalizeFirst}
               renderSelected={(selected: string[]) =>
                  selected.length > 0 ? selected.map(capitalizeFirst).join(', ') : 'Genres'
               }
            />
         </div>
         <Button onClick={clear} variant='svg' size='empty' disabled={selected.length === 0}>
            <BackspaceIcon className='h-6 w-6' />
         </Button>
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
         const itemWidth = s.isMd ? 192 : 144
         const height = s.isMd ? 350 : 275
         // this one is aribitrary.
         const padding = s.isMd ? 100 : 50
         const width = s.width
         if (width > itemWidth * 6 + padding) {
            return [6, 'grid-cols-6', height]
         } else if (width > itemWidth * 5 + padding) {
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
      const unique = uniqueByProperty(validResults, r => r.id)
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

   const playOnDoubleClickRef = useRef<HTMLDivElement>() as RefObject<HTMLDivElement>
   useDoubleClick({ ref: playOnDoubleClickRef, onDoubleClick: playDoubleClick })

   return (
      <Card
         className='relative flex w-36 flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:w-48'
         ref={playOnDoubleClickRef}
      >
         <CardHeader className='space-y-0 p-4 pb-0'>
            <CardTitle className='line-clamp-1 text-base lg:text-lg'>{searchRow.name}</CardTitle>
            <div className='line-clamp-1 px-0 py-0 text-sm text-muted-foreground md:text-base'>
               {secondaryData(searchRow)}
            </div>
         </CardHeader>
         <CardContent className='p-2'>
            <img
               src={tileImage}
               className='aspect-square h-32 w-32 object-cover object-center md:h-48 md:w-48'
               alt='SearchResult'
            />
            {/* </div> */}
         </CardContent>

         <CardFooter className='flex-col items-start space-y-1'>
            <div className='flex w-full justify-between'>
               <Badge variant='outline'>{capitalizeFirst(type)}</Badge>

               <Button variant='svg' size='empty' onClick={open}>
                  <PlusIcon className='h-6 w-6' aria-hidden='true' />
               </Button>
            </div>
         </CardFooter>
      </Card>
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
